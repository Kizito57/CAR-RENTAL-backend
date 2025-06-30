import { getAll, create, update, remove } from '../../src/Reservation/reservation.service';
import db from '../../src/Drizzle/db';

jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => Promise.resolve([{ reservationID: 1, customerID: 101 }])),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ reservationID: 1, customerID: 101 }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ reservationID: 1, customerID: 202 }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve()),
  })),
}));

describe('reservation.service', () => {
  it('should fetch all reservations', async () => {
    const result = await getAll();
    expect(result[0].reservationID).toBe(1);
  });

  it('should create a new reservation', async () => {
    const data = {
      customerID: 101,
      carID: 5,
      reservationDate: new Date(),
      pickupDate: new Date(),
      returnDate: new Date(),
    };
    const result = await create(data as any);
    expect(result.customerID).toBe(101);
  });

  it('should update a reservation', async () => {
    const result = await update(1, { customerID: 202 } as any);
    expect(result.customerID).toBe(202);
  });

  it('should delete a reservation', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
  });
});