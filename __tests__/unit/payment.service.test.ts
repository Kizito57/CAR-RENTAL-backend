import { getAll, create, update, remove } from '../../src/Payment/payment.service';
import db from '../../src/Drizzle/db';

jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => Promise.resolve([{ paymentID: 1, amount: 100.0 }])),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ paymentID: 1, amount: 100.0 }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ paymentID: 1, amount: 200.0 }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve()),
  })),
}));

describe('payment.service', () => {
  it('should fetch all payments', async () => {
    const result = await getAll();
    expect(result[0].amount).toBe(100.0);
  });

  it('should create a payment', async () => {
    const data = {
      bookingID: 1,
      amount: 100.0,
      paymentDate: new Date(),
      paymentMethod: 'Credit Card',
      status: 'Completed',
    };
    const result = await create(data as any);
    expect(result.amount).toBe(100.0);
  });

  it('should update a payment', async () => {
    const result = await update(1, { amount: 200.0 } as any);
    expect(result.amount).toBe(200.0);
  });

  it('should delete a payment', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
  });
});