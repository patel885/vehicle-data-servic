export interface TransformedVehicleType {
  typeId: number;
  typeName: string;
}

export interface TransformedMake {
  makeId: number;
  makeName: string;
  vehicleTypes: TransformedVehicleType[];
}

export function transformMakesList(rawResults: any): Array<{ id: number; name: string }> {
  if (!rawResults) return [];
  const list = Array.isArray(rawResults) ? rawResults : [rawResults];
  return list.map((item: any) => ({
    id: Number(item.Make_ID),
    name: String(item.Make_Name || '').trim(),
  }));
}

export function transformVehicleTypes(rawResults: any): TransformedVehicleType[] {
  if (!rawResults) return [];
  const list = Array.isArray(rawResults) ? rawResults : [rawResults];
  return list.map((item: any) => ({
    typeId: Number(item.VehicleTypeId),
    typeName: String(item.VehicleTypeName || '').trim(),
  }));
}