import request from 'supertest';
import express from 'express';
import * as insuranceService from '../../src/Insurance/insurance.service';
import * as insuranceController from '../../src/Insurance/insurance.controller';

// Mock the database connection to prevent actual DB connections during tests
jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
  // Mock any other exports from your db file
}));

jest.mock('../../src/Insurance/insurance.service');

const app = express();
app.use(express.json());

// Setup routes
app.get('/insurance', insuranceController.getAllInsurance);
app.get('/insurance/with-car', insuranceController.getAllInsuranceWithCarController);
app.get('/insurance/:id', insuranceController.getInsuranceById);
app.post('/insurance', insuranceController.createInsurance);
app.put('/insurance/:id', insuranceController.updateInsurance);
app.delete('/insurance/:id', insuranceController.deleteInsurance);

const mockInsurance = {
  insuranceID: 1,
  providerName: 'ABC Insurance',
  policyNumber: 'POL123',
  coverageAmount: '10000.00',
  expirationDate: '2025-12-31',
  carID: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Clear any timers that might be running
  jest.clearAllTimers();
  jest.useRealTimers();
});

afterAll(async () => {
  // Close database connections if they exist
  try {
    // Try to close any database connections
    const db = require('../../src/Drizzle/db');
    if (db.client && typeof db.client.end === 'function') {
      await db.client.end();
    }
  } catch (error) {
    // Database already mocked or closed
  }
  
  // Give time for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});

describe('Insurance Controller', () => {
  describe('GET /insurance', () => {
    it('returns all insurance records', async () => {
      (insuranceService.getAll as jest.Mock).mockResolvedValue([mockInsurance]);
      const res = await request(app).get('/insurance');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockInsurance]);
    });

    it('handles fetch error', async () => {
      (insuranceService.getAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
      const res = await request(app).get('/insurance');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch insurance records' });
    });
  });

  describe('GET /insurance/:id', () => {
    it('returns a single insurance record', async () => {
      (insuranceService.getById as jest.Mock).mockResolvedValue(mockInsurance);
      const res = await request(app).get('/insurance/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockInsurance);
    });

    it('handles not found error', async () => {
      (insuranceService.getById as jest.Mock).mockRejectedValue(new Error('Not found'));
      const res = await request(app).get('/insurance/999');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Insurance record not found' });
    });
  });

  describe('POST /insurance', () => {
    it('creates a new insurance record', async () => {
      (insuranceService.create as jest.Mock).mockResolvedValue(mockInsurance);
      const res = await request(app).post('/insurance').send(mockInsurance);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockInsurance);
    });

    it('handles creation error', async () => {
      (insuranceService.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
      const res = await request(app).post('/insurance').send(mockInsurance);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to create insurance record' });
    });
  });

  describe('PUT /insurance/:id', () => {
    it('updates an insurance record', async () => {
      const updated = { ...mockInsurance, coverageAmount: '20000.00' };
      (insuranceService.update as jest.Mock).mockResolvedValue(updated);
      const res = await request(app).put('/insurance/1').send(updated);
      expect(res.status).toBe(200);
      expect(res.body.coverageAmount).toBe('20000.00');
    });

    it('handles update error', async () => {
      (insuranceService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      const res = await request(app).put('/insurance/1').send(mockInsurance);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update insurance record' });
    });
  });

  describe('DELETE /insurance/:id', () => {
    it('deletes an insurance record', async () => {
      (insuranceService.remove as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app).delete('/insurance/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Insurance record deleted' });
    });

    it('handles deletion error', async () => {
      (insuranceService.remove as jest.Mock).mockRejectedValue(new Error('Deletion failed'));
      const res = await request(app).delete('/insurance/1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete insurance record' });
    });
  });

  describe('GET /insurance/with-car', () => {
    it('returns insurance with car data', async () => {
      const mockWithCar = [
        {
          ...mockInsurance,
          car: {
            carID: 1,
            carModel: 'Toyota Camry',
            year: '2023-01-01',
            color: 'Blue',
            rentalRate: '50.00',
          },
        },
      ];
      (insuranceService.getAllInsuranceWithCarService as jest.Mock).mockResolvedValue(mockWithCar);
      const res = await request(app).get('/insurance/with-car');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockWithCar);
    });

    it('handles fetch error for insurance with car', async () => {
      (insuranceService.getAllInsuranceWithCarService as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
      const res = await request(app).get('/insurance/with-car');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch insurance records');
    });
  });
});