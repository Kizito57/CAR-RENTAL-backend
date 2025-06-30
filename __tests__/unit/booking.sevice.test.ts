import { getAll, create, update, remove } from '../../src/Booking/booking.service';
import db from '../../src/Drizzle/db';

jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => Promise.resolve([{ bookingID: 1, customerID: 301 }])),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ bookingID: 1, customerID: 301 }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ bookingID: 1, customerID: 999 }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve()),
  })),
}));

describe('booking.service', () => {
  it('should fetch all bookings', async () => {
    const result = await getAll();
    expect(result[0].bookingID).toBe(1);
  });

  it('should create a booking', async () => {
    const data = {
      customerID: 301,
      carID: 2,
      pickupDate: new Date(),
      returnDate: new Date(),
      totalAmount: 500.00,
    };
    const result = await create(data as any);
    expect(result.customerID).toBe(301);
  });

  it('should update a booking', async () => {
    const result = await update(1, { customerID: 999 } as any);
    expect(result.customerID).toBe(999);
  });

  it('should delete a booking', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
  });
});