import { getAll, create, update, remove } from '../../src/Location/location.service';
import db from '../../src/Drizzle/db';
jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => Promise.resolve([{ locationID: 1, address: 'NYC' }])),
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ locationID: 1, address: 'LA' }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ locationID: 1, address: 'Chicago' }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => Promise.resolve()),
  })),
}));

describe('location.service', () => {
  it('should fetch all locations', async () => {
    const result = await getAll();
    expect(result[0].address).toBe('NYC');
  });

  it('should create a location', async () => {
    const data = {
      address: 'LA',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    };
    const result = await create(data as any);
    expect(result.address).toBe('LA');
  });

  it('should update a location', async () => {
    const result = await update(1, { address: 'Chicago' } as any);
    expect(result.address).toBe('Chicago');
  });

  it('should delete a location', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
  });
});