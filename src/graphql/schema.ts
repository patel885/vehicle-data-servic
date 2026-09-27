import { db } from '../db';

export const typeDefs = `#graphql
  type VehicleType {
    typeId: Int!
    typeName: String!
  }

  type Make {
    makeId: Int!
    makeName: String!
    vehicleTypes: [VehicleType!]!
  }

  type Query {
    makes(limit: Int, offset: Int): [Make!]!
    make(id: Int!): Make
  }

  type Mutation {
    triggerIngestion(limit: Int): String!
  }
`;

export const resolvers = {
  Query: {
    makes: (_: any, args: { limit?: number; offset?: number }) => {
      const limit = args.limit || 50;
      const offset = args.offset || 0;

      const makesRows = db
        .prepare('SELECT id, name FROM makes LIMIT ? OFFSET ?')
        .all(limit, offset) as Array<{ id: number; name: string }>;

      return makesRows.map((make) => {
        const types = db
          .prepare(
            'SELECT type_id AS typeId, type_name AS typeName FROM vehicle_types WHERE make_id = ?'
          )
          .all(make.id);

        return {
          makeId: make.id,
          makeName: make.name,
          vehicleTypes: types,
        };
      });
    },

    make: (_: any, args: { id: number }) => {
      const make = db
        .prepare('SELECT id, name FROM makes WHERE id = ?')
        .get(args.id) as { id: number; name: string } | undefined;

      if (!make) return null;

      const types = db
        .prepare(
          'SELECT type_id AS typeId, type_name AS typeName FROM vehicle_types WHERE make_id = ?'
        )
        .all(make.id);

      return {
        makeId: make.id,
        makeName: make.name,
        vehicleTypes: types,
      };
    },
  },

  Mutation: {
    triggerIngestion: async (_: any, args: { limit?: number }) => {
      const { IngestionService } = await import('../ingestion/service');
      const service = new IngestionService();
      // Run ingestion in background or await it
      await service.ingestData(args.limit || 25);
      return 'Ingestion completed successfully';
    },
  },
};