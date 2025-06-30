import { getAll, create, update, remove } from '../../src/Insurance/insurance.service';
import db from '../../src/Drizzle/db';

jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => Promise.resolve([{ insuranceID: 1, insuranceProvider: 'InsureCo' }])),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ insuranceID: 1, insuranceProvider: 'NewProvider' }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ insuranceID: 1, insuranceProvider: 'UpdatedProvider' }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve()),
  })),
}));

describe('insurance.service', () => {
  it('should fetch all insurance records', async () => {
    const result = await getAll();
    expect(result[0].insuranceProvider).toBe('InsureCo');
  });

  it('should create a new insurance record', async () => {
    const data = {
      carID: 1,
      insuranceProvider: 'NewProvider',
      policyNumber: 'POL123456',
      startDate: new Date(),
      endDate: new Date(),
    };
    const result = await create(data as any);
    expect(result.insuranceProvider).toBe('NewProvider');
  });

  it('should update an insurance record', async () => {
    const result = await update(1, { provider: 'UpdatedProvider' } as any);
    expect(result.insuranceProvider).toBe('UpdatedProvider');
  });

  it('should delete an insurance record', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
  });
});