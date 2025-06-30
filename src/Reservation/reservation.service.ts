import  db from '../Drizzle/db';
import { ReservationTable , CustomerTable, CarTable } from '../Drizzle/schema';
import { eq } from 'drizzle-orm';


// Get all reservations
export const getAll = async () => {
  return await db.select().from(ReservationTable);
};

// Get a reservation by ID
export const getById = async (id: number) => {
  const result = await db.select().from(ReservationTable).where(eq(ReservationTable.reservationID, id));
  return result[0];
};

// Create a new reservation
export const create = async (data: any) => {
  const result = await db.insert(ReservationTable).values(data).returning();
  return result[0];
};

// Update a reservation
export const update = async (id: number, data: any) => {
  const result = await db
    .update(ReservationTable)
    .set(data)
    .where(eq(ReservationTable.reservationID, id))
    .returning();
  return result[0];
};

// Delete a reservation
export const remove = async (id: number) => {
  await db.delete(ReservationTable).where(eq(ReservationTable.reservationID, id));
};

export const getReservationsWithDetailsService = async () => {
  return await db
    .select()
    .from(ReservationTable)
    .leftJoin(CustomerTable as any, eq(ReservationTable.customerID, CustomerTable.customerID))
    .leftJoin(CarTable as any, eq(ReservationTable.carID, CarTable.carID));
};