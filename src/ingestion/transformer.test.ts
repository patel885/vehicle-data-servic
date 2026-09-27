import {
  transformMakesList,
  transformVehicleTypes,
} from './transformer';

describe('XML Data Transformers', () => {
  describe('transformMakesList', () => {
    it('should transform raw array of makes into clean objects', () => {
      const mockRawMakes = [
        { Make_ID: '440', Make_Name: 'ASTON MARTIN' },
        { Make_ID: '441', Make_Name: 'TESLA' },
      ];

      const result = transformMakesList(mockRawMakes);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 440, name: 'ASTON MARTIN' });
      expect(result[1]).toEqual({ id: 441, name: 'TESLA' });
    });

    it('should handle single object response (non-array)', () => {
      const mockSingle = { Make_ID: '440', Make_Name: 'ASTON MARTIN' };
      const result = transformMakesList(mockSingle);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 440, name: 'ASTON MARTIN' });
    });

    it('should return empty array if input is null or undefined', () => {
      expect(transformMakesList(null)).toEqual([]);
      expect(transformMakesList(undefined)).toEqual([]);
    });
  });

  describe('transformVehicleTypes', () => {
    it('should transform vehicle types correctly', () => {
      const mockRawTypes = [
        { VehicleTypeId: '2', VehicleTypeName: 'Passenger Car' },
        { VehicleTypeId: '7', VehicleTypeName: 'Truck ' },
      ];

      const result = transformVehicleTypes(mockRawTypes);

      expect(result).toEqual([
        { typeId: 2, typeName: 'Passenger Car' },
        { typeId: 7, typeName: 'Truck' },
      ]);
    });

    it('should handle empty or undefined input', () => {
      expect(transformVehicleTypes(null)).toEqual([]);
    });
  });
});