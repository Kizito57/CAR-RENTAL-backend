import  db  from '../Drizzle/db';
import { InsuranceTable ,CarTable} from '../Drizzle/schema';
import { eq } from 'drizzle-orm';

// Get all insurance records
export const getAll = async () => {
  return await db.select().from(InsuranceTable);
};

// Get one insurance record by ID
export const getById = async (id: number) => {
  const result = await db.select().from(InsuranceTable).where(eq(InsuranceTable.insuranceID, id));
  return result[0];
};

// Create a new insurance record
export const create = async (data: any) => {
  const result = await db.insert(InsuranceTable).values(data).returning();
  return result[0];
};

// Update insurance record
export const update = async (id: number, data: any) => {
  const result = await db
    .update(InsuranceTable)
    .set(data)
    .where(eq(InsuranceTable.insuranceID, id))
    .returning();
  return result[0];
};

// Delete insurance record
export const remove = async (id: number) => {
  await db.delete(InsuranceTable).where(eq(InsuranceTable.insuranceID, id));
};

export const getAllInsuranceWithCarService = async () => {
  return await db.select().from(InsuranceTable)
    .leftJoin(CarTable as any, eq(InsuranceTable.carID, CarTable.carID));
};
