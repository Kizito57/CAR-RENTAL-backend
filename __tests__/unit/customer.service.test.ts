import { getAll, getById, create, update, remove } from '../../src/Customer/customer.service';
import db from '../../src/Drizzle/db';

jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(() => ({
    from: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve([{ customerID: 1, firstName: 'John' }]))
    }))
  })),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ customerID: 1, firstName: 'Alice' }])),
    })),
  })),
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ customerID: 1, firstName: 'Updated' }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ customerID: 1 }]))
    })),
  })),
}));

// Override the mock for getAll specifically
const mockGetAllData = [{ customerID: 1, firstName: 'John' }];
const mockGetByIdData = [{ customerID: 1, firstName: 'John' }];

describe('customer.service', () => {
  beforeEach(() => {
    // Reset and setup mocks for each test
    jest.clearAllMocks();
  });

  it('should fetch all customers', async () => {
    // Mock getAll specific behavior
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockResolvedValue(mockGetAllData)
    });

    const result = await getAll();
    expect(result).toBeDefined();
    expect(result[0].firstName).toBe('John');
  });

  it('should fetch customer by ID', async () => {
    // Mock getById specific behavior - need to chain from().where()
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(mockGetByIdData)
      })
    });

    const result = await getById(1);
    expect(result).toBeDefined();
    expect(result?.firstName).toBe('John');
  });

  it('should create a new customer', async () => {
    const data = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phoneNumber: '1234567890',
      driverLicense: 'DL12345',
      address: '123 Elm St',
      role: 'customer',
    };
    const result = await create(data as any);
    expect(result?.firstName).toBe('Alice');
  });

  it('should update a customer', async () => {
    const result = await update(1, { firstName: 'Updated' } as any);
    expect(result?.firstName).toBe('Updated');
  });

  it('should delete a customer', async () => {
    const result = await remove(1);
    expect(result).toBe(true);
  });
});