import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { config } from '../config';
import { db } from '../db';
import { logger } from '../utils/logger';
import {
  transformMakesList,
  transformVehicleTypes,
} from './transformer';

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

export class IngestionService {
  private baseUrl = config.NHTSA_BASE_URL;

  // 1. Fetch and parse all vehicle makes
  async fetchAllMakes(): Promise<Array<{ id: number; name: string }>> {
    try {
      const url = `${this.baseUrl}/getallmakes?format=XML`;
      logger.info({ url }, 'Fetching all vehicle makes...');
      const response = await axios.get(url, { timeout: 15000 });
      const parsedData = parser.parse(response.data);

      const rawResults = parsedData?.Response?.Results?.AllVehicleMakes;
      return transformMakesList(rawResults);
    } catch (error: any) {
      logger.error({ err: error.message }, 'Failed to fetch vehicle makes');
      throw error;
    }
  }

  // 2. Fetch vehicle types for a single make ID
  async fetchTypesForMake(makeId: number) {
    try {
      const url = `${this.baseUrl}/GetVehicleTypesForMakeId/${makeId}?format=xml`;
      const response = await axios.get(url, { timeout: 10000 });
      const parsedData = parser.parse(response.data);

      const rawResults = parsedData?.Response?.Results?.VehicleTypesForMakeIds;
      return transformVehicleTypes(rawResults);
    } catch (error: any) {
      logger.warn({ makeId, err: error.message }, 'Failed to fetch types for make');
      return [];
    }
  }

  // 3. Persist batch data into SQLite transactionally
  async ingestData(limitMakes: number = 25) {
    logger.info('Starting data ingestion pipeline...');
    const allMakes = await this.fetchAllMakes();

    // NHTSA has over 10,000 makes; we ingest a slice for quick bootstrap
    const targetMakes = allMakes.slice(0, limitMakes);

    const insertMakeStmt = db.prepare(
      'INSERT OR REPLACE INTO makes (id, name) VALUES (?, ?)'
    );
    const insertTypeStmt = db.prepare(
      'INSERT OR REPLACE INTO vehicle_types (type_id, type_name, make_id) VALUES (?, ?, ?)'
    );

    const saveTransaction = db.transaction((records: any[]) => {
      for (const item of records) {
        insertMakeStmt.run(item.id, item.name);
        for (const type of item.types) {
          insertTypeStmt.run(type.typeId, type.typeName, item.id);
        }
      }
    });

    const enrichedRecords = [];

    for (const make of targetMakes) {
      logger.debug({ makeId: make.id, makeName: make.name }, 'Processing make...');
      const types = await this.fetchTypesForMake(make.id);
      enrichedRecords.push({
        id: make.id,
        name: make.name,
        types,
      });
    }

    saveTransaction(enrichedRecords);
    logger.info({ count: enrichedRecords.length }, 'Ingestion completed successfully.');
  }
}