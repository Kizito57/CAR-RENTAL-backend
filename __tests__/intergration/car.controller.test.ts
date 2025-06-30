import request from 'supertest';
import express from 'express';
import * as carService from '../../src/Car/car.service';
import * as carController from '../../src/Car/car.controller';

// Mocks the database connection to prevent actual DB connections during tests
jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
 
}));

jest.mock('../../src/Car/car.service');


const app = express();
app.use(express.json());
app.get('/cars', carController.getAllCars);
app.get('/cars/with-location', carController.getAllCarsWithLocation);
app.get('/cars/booking-stats', carController.getCarsWithBookingStats);
app.get('/cars/:id', carController.getCarById);
app.post('/cars', carController.createCar);
app.put('/cars/:id', carController.updateCar);
app.delete('/cars/:id', carController.deleteCar);

const mockCar = {
  carID: 1,
  carModel: 'Toyota Camry',
  year: '2023-01-01',
  color: 'Blue',
  rentalRate: '50.00',
  availability: true,
  locationID: 1
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Clears any timers that might be running
  jest.clearAllTimers();
  jest.useRealTimers();
});

afterAll(async () => {
  // Closes database connections if they exist
  try {
    
    const db = require('../../src/Drizzle/db');
    if (db.client && typeof db.client.end === 'function') {
      await db.client.end();
    }
  } catch (error) {
  
  }
  

  
  await new Promise(resolve => setTimeout(resolve, 100));
});

describe('Car Controller', () => {
  describe('GET /cars', () => {
    it('returns all cars', async () => {
      (carService.getAll as jest.Mock).mockResolvedValue([mockCar]);
      const res = await request(app).get('/cars');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockCar]);
    });

    it('handles errors', async () => {
      (carService.getAll as jest.Mock).mockRejectedValue(new Error('Test error'));
      const res = await request(app).get('/cars');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch cars' });
    });
  });

  describe('GET /cars/:id', () => {
    it('returns car by ID', async () => {
      (carService.getById as jest.Mock).mockResolvedValue(mockCar);
      const res = await request(app).get('/cars/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCar);
    });

    it('handles not found error', async () => {
      (carService.getById as jest.Mock).mockRejectedValue(new Error('Not found'));
      const res = await request(app).get('/cars/999');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Car not found' });
    });
  });

  describe('POST /cars', () => {
    const newCar = { ...mockCar, carID: undefined };
    
    it('creates a car', async () => {
      (carService.create as jest.Mock).mockResolvedValue(mockCar);
      const res = await request(app).post('/cars').send(newCar);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCar);
    });

    it('handles creation error', async () => {
      (carService.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
      const res = await request(app).post('/cars').send(newCar);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to create car' });
    });
  });

  describe('PUT /cars/:id', () => {
    it('updates a car', async () => {
      const update = { rentalRate: '60.00' };
      (carService.update as jest.Mock).mockResolvedValue({ ...mockCar, ...update });
      const res = await request(app).put('/cars/1').send(update);
      expect(res.status).toBe(200);
      expect(res.body.rentalRate).toBe('60.00');
    });

    it('handles update error', async () => {
      (carService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      const res = await request(app).put('/cars/1').send({ rentalRate: '60.00' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update car' });
    });
  });

  describe('DELETE /cars/:id', () => {
    it('deletes a car', async () => {
      (carService.remove as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app).delete('/cars/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Car deleted' });
    });

    it('handles delete error', async () => {
      (carService.remove as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      const res = await request(app).delete('/cars/1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete car' });
    });
  });

  describe('GET /cars/with-location', () => {
    it('returns cars with location', async () => {
      const mockWithLocation = [
        {
          ...mockCar,
          location: {
            locationID: 1,
            locationName: 'Downtown Branch',
            address: '123 Main St',
            contactNumber: '555-0123',
          },
        },
      ];
      (carService.getAllCarsWithLocation as jest.Mock).mockResolvedValue(mockWithLocation);
      const res = await request(app).get('/cars/with-location');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockWithLocation);
    });

    it('handles location fetch error', async () => {
      (carService.getAllCarsWithLocation as jest.Mock).mockRejectedValue(new Error('Location fetch failed'));
      const res = await request(app).get('/cars/with-location');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch cars with location details' });
    });
  });

  describe('GET /cars/booking-stats', () => {
    it('returns car booking stats', async () => {
      const mockStats = [
        {
          ...mockCar,
          location: { locationName: 'Downtown Branch' },
          bookingCount: 5,
          totalRevenue: '250.00',
        },
      ];
      (carService.getCarsWithBookingStats as jest.Mock).mockResolvedValue(mockStats);
      const res = await request(app).get('/cars/booking-stats');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockStats);
    });

    it('handles stats fetch error', async () => {
      (carService.getCarsWithBookingStats as jest.Mock).mockRejectedValue(new Error('Stats fetch failed'));
      const res = await request(app).get('/cars/booking-stats');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch car booking statistics' });
    });
  });
});