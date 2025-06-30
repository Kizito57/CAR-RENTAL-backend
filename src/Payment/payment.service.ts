import db from '../Drizzle/db';
import { PaymentTable ,BookingsTable} from '../Drizzle/schema';
import { eq } from 'drizzle-orm';

// Get all payments
export const getAll = async () => {
  return await db.select().from(PaymentTable);
};

// Get payment by ID
export const getById = async (id: number) => {
  const result = await db.select().from(PaymentTable).where(eq(PaymentTable.paymentID, id));
  return result[0];
};

// Create new payment
export const create = async (data: any) => {
  const result = await db.insert(PaymentTable).values(data).returning();
  return result[0];
};

// Update a payment
export const update = async (id: number, data: any) => {
  const result = await db
    .update(PaymentTable)
    .set(data)
    .where(eq(PaymentTable.paymentID, id))
    .returning();
  return result[0];
};

// Delete a payment
export const remove = async (id: number) => {
  await db.delete(PaymentTable).where(eq(PaymentTable.paymentID, id));
};

// JOIN: payment + booking
export const getPaymentsWithBooking = async () => {
  return db
    .select()
    .from(PaymentTable)
    .innerJoin(BookingsTable as any, eq(PaymentTable.bookingID, BookingsTable.bookingID));
};

