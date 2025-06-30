import request from 'supertest';
import express from 'express';
import * as maintenanceService from '../../src/Maintenance/maintenance.service';
import * as maintenanceController from '../../src/Maintenance/maintenance.controller';

// Mock DB to prevent real connections
jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock the service
jest.mock('../../src/Maintenance/maintenance.service');

const app = express();
app.use(express.json());

app.get('/maintenance', maintenanceController.getAllMaintenance);
app.get('/maintenance/with-car', maintenanceController.getAllMaintenanceWithCarController);
app.get('/maintenance/:id', maintenanceController.getMaintenanceById);
app.post('/maintenance', maintenanceController.createMaintenance);
app.put('/maintenance/:id', maintenanceController.updateMaintenance);
app.delete('/maintenance/:id', maintenanceController.deleteMaintenance);

const mockMaintenance = {
  maintenanceID: 1,
  carID: 2,
  description: 'Oil Change',
  date: '2025-06-10',
  cost: '100.00',
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

afterAll(async () => {
  try {
    const db = require('../../src/Drizzle/db');
    if (db.client && typeof db.client.end === 'function') {
      await db.client.end();
    }
  } catch (error) {
    // ignore teardown error
  }
  await new Promise(resolve => setTimeout(resolve, 100));
});

describe('Maintenance Controller', () => {
  describe('GET /maintenance', () => {
    it('returns all maintenance records', async () => {
      (maintenanceService.getAll as jest.Mock).mockResolvedValue([mockMaintenance]);
      const res = await request(app).get('/maintenance');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockMaintenance]);
    });

    it('handles fetch error', async () => {
      (maintenanceService.getAll as jest.Mock).mockRejectedValue(new Error('Failed'));
      const res = await request(app).get('/maintenance');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch maintenance records' });
    });
  });

  describe('GET /maintenance/:id', () => {
    it('returns maintenance by ID', async () => {
      (maintenanceService.getById as jest.Mock).mockResolvedValue(mockMaintenance);
      const res = await request(app).get('/maintenance/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMaintenance);
    });

    it('handles not found error', async () => {
      (maintenanceService.getById as jest.Mock).mockRejectedValue(new Error('Not found'));
      const res = await request(app).get('/maintenance/999');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Maintenance record not found' });
    });
  });

  describe('POST /maintenance', () => {
    const newRecord = { ...mockMaintenance, maintenanceID: undefined };

    it('creates a maintenance record', async () => {
      (maintenanceService.create as jest.Mock).mockResolvedValue(mockMaintenance);
      const res = await request(app).post('/maintenance').send(newRecord);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMaintenance);
    });

    it('handles creation error', async () => {
      (maintenanceService.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
      const res = await request(app).post('/maintenance').send(newRecord);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to create maintenance record' });
    });
  });

  describe('PUT /maintenance/:id', () => {
    it('updates a maintenance record', async () => {
      const update = { cost: '120.00' };
      const updated = { ...mockMaintenance, ...update };
      (maintenanceService.update as jest.Mock).mockResolvedValue(updated);
      const res = await request(app).put('/maintenance/1').send(update);
      expect(res.status).toBe(200);
      expect(res.body.cost).toBe('120.00');
    });

    it('handles update error', async () => {
      (maintenanceService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      const res = await request(app).put('/maintenance/1').send({ cost: '120.00' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update maintenance record' });
    });
  });

  describe('DELETE /maintenance/:id', () => {
    it('deletes a maintenance record', async () => {
      (maintenanceService.remove as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app).delete('/maintenance/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Maintenance record deleted' });
    });

    it('handles delete error', async () => {
      (maintenanceService.remove as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      const res = await request(app).delete('/maintenance/1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete maintenance record' });
    });
  });

  describe('GET /maintenance/with-car', () => {
    it('returns maintenance records with car data', async () => {
      const mockWithCar = [
        {
          ...mockMaintenance,
          car: {
            carID: 2,
            carModel: 'Honda Accord',
          },
        },
      ];
      (maintenanceService.getAllMaintenanceWithCarService as jest.Mock).mockResolvedValue(mockWithCar);
      const res = await request(app).get('/maintenance/with-car');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockWithCar);
    });

    it('handles fetch error for maintenance with car', async () => {
      (maintenanceService.getAllMaintenanceWithCarService as jest.Mock).mockRejectedValue(new Error('Failed'));
      const res = await request(app).get('/maintenance/with-car');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch maintenance records');
    });
  });
});
