import  db  from '../Drizzle/db';
import { MaintenanceTable ,CarTable } from '../Drizzle/schema';
import { eq } from 'drizzle-orm';

// Fetch all maintenance records
export const getAll = async () => {
  return await db.select().from(MaintenanceTable);
};

// Fetch a specific record by ID
export const getById = async (id: number) => {
  const result = await db.select().from(MaintenanceTable).where(eq(MaintenanceTable.maintenanceID, id));
  return result[0];
};

// Insert a new maintenance record
export const create = async (data: any) => {
  const result = await db.insert(MaintenanceTable).values(data).returning();
  return result[0];
};

// Update maintenance record
export const update = async (id: number, data: any) => {
  const result = await db
    .update(MaintenanceTable)
    .set(data)
    .where(eq(MaintenanceTable.maintenanceID, id))
    .returning();
  return result[0];
};

// Delete a maintenance record
export const remove = async (id: number) => {
  await db.delete(MaintenanceTable).where(eq(MaintenanceTable.maintenanceID, id));
};

export const getAllMaintenanceWithCarService = async () => {
  return await db.select().from(MaintenanceTable)
    .leftJoin(CarTable as any, eq(MaintenanceTable.carID, CarTable.carID));
};