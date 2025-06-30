import  db  from '../Drizzle/db';
import { BookingsTable ,CustomerTable, CarTable, PaymentTable } from '../Drizzle/schema';
import { eq } from 'drizzle-orm';
import { InferInsertModel } from 'drizzle-orm';

type NewCar = InferInsertModel<typeof BookingsTable>; // infer only insertable fields


// Get all bookings
export const getAll = async () => {
  return await db.select().from(BookingsTable);
};

// Get booking by ID
export const getById = async (id: number) => {
  const result = await db.select().from(BookingsTable).where(eq(BookingsTable.bookingID, id));
  return result[0];
};

// Create booking
export const create = async (data: NewCar) => {
  const result = await db.insert(BookingsTable).values(data).returning();
  return result[0];
};

// Update booking
export const update = async (id: number, data: NewCar) => {
  const result = await db
    .update(BookingsTable)
    .set(data)
    .where(eq(BookingsTable.bookingID, id))
    .returning();
  return result[0];
};

// Delete booking
export const remove = async (id: number) => {
  await db.delete(BookingsTable).where(eq(BookingsTable.bookingID, id));
};

export const getAllBookingsWithPaymentsService = async () => {
  return await db.select().from(BookingsTable)
    .leftJoin(CustomerTable as any, eq(BookingsTable.customerID, CustomerTable.customerID))
    .leftJoin(CarTable as any, eq(BookingsTable.carID, CarTable.carID))
    .leftJoin(PaymentTable as any, eq(BookingsTable.bookingID, PaymentTable.bookingID));
};
