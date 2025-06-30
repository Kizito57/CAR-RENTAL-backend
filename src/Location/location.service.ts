import db  from '../Drizzle/db';
import { LocationTable ,CarTable} from '../Drizzle/schema';
import { eq } from 'drizzle-orm';

// Get all locations
export const getAll = async () => {
  return await db.select().from(LocationTable);
};

// Get a location by ID
export const getById = async (id: number) => {
  const result = await db.select().from(LocationTable).where(eq(LocationTable.locationID, id));
  return result[0];
};

// Create a new location
export const create = async (data: any) => {
  const result = await db.insert(LocationTable).values(data).returning();
  return result[0];
};

// Update a location
export const update = async (id: number, data: any) => {
  const result = await db
    .update(LocationTable)
    .set(data)
    .where(eq(LocationTable.locationID, id))
    .returning();
  return result[0];
};

// Delete a location
export const remove = async (id: number) => {
  await db.delete(LocationTable).where(eq(LocationTable.locationID, id));
};


export const getAllLocationsWithCarsService = async () => {
  return await db.select({
    locationID: LocationTable.locationID,
    locationName: LocationTable.locationName,
    address: LocationTable.address,
    carID: CarTable.carID,
    carModel: CarTable.carModel,
  })
  .from(LocationTable)
  .leftJoin(CarTable as any, eq(LocationTable.locationID, CarTable.locationID));
};
export const getLocationsWithAssignedCarsService = async () => {
  return await db.select({
    locationID: LocationTable.locationID,
    locationName: LocationTable.locationName,
    carModel: CarTable.carModel,
    year: CarTable.year,
  })
  .from(LocationTable)
  .innerJoin(CarTable as any, eq(LocationTable.locationID, CarTable.locationID));
};