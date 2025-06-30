import { getAll, create, update, remove } from '../../src/Maintenance/maintenance.service';
import db from '../../src/Drizzle/db';

jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => Promise.resolve([{ maintenanceID: 1, description: 'Oil Change' }])),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ maintenanceID: 1, description: 'New Tire' }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ maintenanceID: 1, description: 'Updated Tire' }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve()),
  })),
}));

describe('maintenance.service', () => {
  it('should fetch all maintenance records', async () => {
    const result = await getAll();
    expect(result[0].description).toBe('Oil Change');
  });

  it('should create a maintenance record', async () => {
    const data = {
      carID: 1,
      maintenanceDate: new Date(),
      description: 'New Tire',
      cost: 50.0,
    };
    const result = await create(data as any);
    expect(result.description).toBe('New Tire');
  });

  it('should update a maintenance record', async () => {
    const result = await update(1, { description: 'Updated Tire' } as any);
    expect(result.description).toBe('Updated Tire');
  });

  it('should delete a maintenance record', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
  });
});