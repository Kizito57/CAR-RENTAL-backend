import {
  getAll,
  getById,
  create,
  update,
  remove,
} from '../../src/Car/car.service';
import db from '../../src/Drizzle/db';
import { eq } from 'drizzle-orm';
import { CarTable } from '../../src/Drizzle/schema';
import type { InferInsertModel } from 'drizzle-orm';

type NewCar = InferInsertModel<typeof CarTable>;

// Create mock functions for chaining
const mockWhere = jest.fn();
const mockInsertReturning = jest.fn();
const mockUpdateReturning = jest.fn();
const mockSet = jest.fn();
const mockValues = jest.fn();
const mockFrom = jest.fn();

// Mock the database object with proper chaining
jest.mock('../../src/Drizzle/db', () => ({
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

// Cast the mocked db to access its methods
const mockedDb = db as jest.Mocked<typeof db>;

describe('car.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock chains for select operations
    mockFrom.mockReturnValue({
      where: mockWhere.mockResolvedValue([{ carID: 1, carModel: 'Camry' }]),
    });
    
    // For getAll - select().from() should resolve to array of cars
    mockFrom.mockImplementation(() => {
      return Promise.resolve([
        { carID: 1, carModel: 'Camry' },
        { carID: 2, carModel: 'Civic' },
      ]);
    });

    mockedDb.select.mockReturnValue({
      from: mockFrom,
    } as any);

    // Setup mock chains for insert operations
    mockValues.mockReturnValue({
      returning: mockInsertReturning.mockResolvedValue([{ carID: 1, carModel: 'Camry' }]),
    });

    mockedDb.insert.mockReturnValue({
      values: mockValues,
    } as any);

    // Setup mock chains for update operations
    mockSet.mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: mockUpdateReturning.mockResolvedValue([{ carID: 1, carModel: 'Civic' }]),
      }),
    });

    mockedDb.update.mockReturnValue({
      set: mockSet,
    } as any);

    // Setup mock chains for delete operations
    mockedDb.delete.mockReturnValue({
      where: mockWhere.mockResolvedValue(undefined),
    } as any);
  });

  it('should fetch all cars', async () => {
    const cars = await getAll();
    expect(cars).toHaveLength(2);
    expect(cars[0].carModel).toBe('Camry');
    expect(mockedDb.select).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith(CarTable);
  });

  it('should fetch a car by ID', async () => {
    // Reset mockFrom for this specific test to return the where chain
    mockFrom.mockReturnValue({
      where: mockWhere.mockResolvedValue([{ carID: 1, carModel: 'Camry' }]),
    });

    const car = await getById(1);
    expect(car.carID).toBe(1);
    expect(car.carModel).toBe('Camry');
    expect(mockedDb.select).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith(CarTable);
    expect(mockWhere).toHaveBeenCalledWith(eq(CarTable.carID, 1));
  });

  it('should create a new car', async () => {
    const newCar: NewCar = {
      carModel: 'Camry',
      year: '2020',
      color: 'Red',
      rentalRate: '60.00'
    };
    
    const created = await create(newCar);
    expect(created.carModel).toBe('Camry');
    expect(mockedDb.insert).toHaveBeenCalledWith(CarTable);
    expect(mockValues).toHaveBeenCalledWith(newCar);
  });

  it('should update a car', async () => {
    const updatedData: NewCar = {
      carModel: 'Civic',
      year: '2021',
      rentalRate: '50.00',
      color: 'Blue',
    };
    
    const updated = await update(1, updatedData);
    expect(updated.carModel).toBe('Civic');
    expect(mockedDb.update).toHaveBeenCalledWith(CarTable);
    expect(mockSet).toHaveBeenCalledWith(updatedData);
  });

  it('should delete a car', async () => {
    await expect(remove(1)).resolves.toBeUndefined();
    expect(mockedDb.delete).toHaveBeenCalledWith(CarTable);
    expect(mockWhere).toHaveBeenCalledWith(eq(CarTable.carID, 1));
  });
});