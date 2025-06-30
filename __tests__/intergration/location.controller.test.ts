import request from 'supertest';
import express, { Express } from 'express';
import * as locationService from '../../src/Location/location.service';
import * as locationController from '../../src/Location/location.controller';


jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined), // Important to prevent open handle warning
    query: jest.fn(),
  },
}));


jest.mock('../../src/Location/location.service');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());

  // Register routes
  app.get('/locations', locationController.getAllLocations);
  app.get('/locations/:id', locationController.getLocationById);
  app.post('/locations', locationController.createLocation);
  app.put('/locations/:id', locationController.updateLocation);
  app.delete('/locations/:id', locationController.deleteLocation);
  app.get('/locations-with-cars', locationController.getAllLocationsWithCarsController);
  app.get('/assigned-car-locations', locationController.getLocationsWithAssignedCarsController);
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  const db = require('../../src/Drizzle/db');
  if (db.client?.end) {
    await db.client.end();
  }
  await new Promise((resolve) => setTimeout(resolve, 100)); // allow Jest to fully clean up
});

describe('Location Controller Integration', () => {
  const mockLocation = {
    locationID: 1,
    locationName: 'Downtown',
    address: '123 Main St',
    contactNumber: '555-1234'
  };

  it('GET /locations - should return all locations', async () => {
    (locationService.getAll as jest.Mock).mockResolvedValue([mockLocation]);
    const res = await request(app).get('/locations');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockLocation]);
  });

  it('GET /locations/:id - should return one location', async () => {
    (locationService.getById as jest.Mock).mockResolvedValue(mockLocation);
    const res = await request(app).get('/locations/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockLocation);
  });

  it('POST /locations - should create a location', async () => {
    (locationService.create as jest.Mock).mockResolvedValue(mockLocation);
    const res = await request(app).post('/locations').send(mockLocation);
    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockLocation);
  });

  it('PUT /locations/:id - should update a location', async () => {
    const updated = { ...mockLocation, locationName: 'Updated Name' };
    (locationService.update as jest.Mock).mockResolvedValue(updated);
    const res = await request(app).put('/locations/1').send(updated);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  it('DELETE /locations/:id - should delete a location', async () => {
    (locationService.remove as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app).delete('/locations/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Location deleted' });
  });

  it('GET /locations-with-cars - should return locations with cars', async () => {
    (locationService.getAllLocationsWithCarsService as jest.Mock).mockResolvedValue([mockLocation]);
    const res = await request(app).get('/locations-with-cars');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockLocation]);
  });

  it('GET /assigned-car-locations - should return assigned car locations', async () => {
    (locationService.getLocationsWithAssignedCarsService as jest.Mock).mockResolvedValue([mockLocation]);
    const res = await request(app).get('/assigned-car-locations');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockLocation]);
  });
});
