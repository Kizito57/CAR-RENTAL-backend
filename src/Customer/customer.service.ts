import db from '../Drizzle/db';
import { CustomerTable ,BookingsTable,PaymentTable,InsuranceTable, ReservationTable} from '../Drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { TICustomer, TSCustomer } from '../Drizzle/schema';

// Get all customers
export const getAll = async (): Promise<TSCustomer[]> => {
    return await db.select().from(CustomerTable);
};

// Get customer by ID
export const getById = async (id: number): Promise<TSCustomer | undefined> => {
    const result = await db.select().from(CustomerTable).where(eq(CustomerTable.customerID, id));
    return result[0];
};

// Get customer by email (for login)
export const getByEmail = async (email: string): Promise<TSCustomer | undefined> => {
    const result = await db.select().from(CustomerTable).where(eq(CustomerTable.email, email));
    return result[0];
};

// Create new customer or admin
export const create = async (data: TICustomer): Promise<TSCustomer | undefined> => {
    try {
        const result = await db.insert(CustomerTable).values(data).returning();
        return result[0];
    } catch (error: any) {
        // Handle duplicate email error
        if (error.code === '23505') {
            throw new Error('Email already exists');
        }
        throw error;
    }
};

// Update customer
export const update = async (id: number, data: Partial<TICustomer>): Promise<TSCustomer | undefined> => {
    try {
        const result = await db.update(CustomerTable)
            .set(data)
            .where(eq(CustomerTable.customerID, id))
            .returning();
        return result[0];
    } catch (error: any) {
        // Handle duplicate email error
        if (error.code === '23505') {
            throw new Error('Email already exists');
        }
        throw error;
    }
};

// Delete customer
export const remove = async (id: number): Promise<boolean> => {
    const result = await db.delete(CustomerTable)
        .where(eq(CustomerTable.customerID, id))
        .returning();
    return result.length > 0;
};

// Check if email exists (optional utility function)
export const emailExists = async (email: string): Promise<boolean> => {
    const result = await db.select({ customerID: CustomerTable.customerID })
        .from(CustomerTable)
        .where(eq(CustomerTable.email, email));
    return result.length > 0;
};



// JOIN: customer + booking
export const getCustomersWithBookings = async () => {
  return db
    .select()
    .from(CustomerTable)
    .innerJoin(BookingsTable as any, eq(CustomerTable.customerID, BookingsTable.customerID));
};

// JOIN: customer + reservation
export const getCustomersWithReservation = async () => {
  return db
    .select()
    .from(CustomerTable)
    .innerJoin(ReservationTable as any, eq(CustomerTable.customerID, ReservationTable.customerID));
};

