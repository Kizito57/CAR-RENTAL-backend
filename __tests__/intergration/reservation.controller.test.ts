import request from 'supertest';
import express from 'express';
import * as reservationService from '../../src/Reservation/reservation.service';
import * as reservationController from '../../src/Reservation/reservation.controller';

// Mock the database connection
jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock the reservation service
jest.mock('../../src/Reservation/reservation.service');

const app = express();
app.use(express.json());

app.get('/reservations', reservationController.getAllReservations);
app.get('/reservations/details', reservationController.getReservationsWithDetailsController);
app.get('/reservations/:id', reservationController.getReservationById);
app.post('/reservations', reservationController.createReservation);
app.put('/reservations/:id', reservationController.updateReservation);
app.delete('/reservations/:id', reservationController.deleteReservation);

const mockReservation = {
  reservationID: 1,
  customerID: 1,
  carID: 2,
  pickupDate: '2025-06-20',
  returnDate: '2025-06-25',
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
    // DB teardown failed silently
  }
  await new Promise(resolve => setTimeout(resolve, 100));
});

describe('Reservation Controller', () => {
  describe('GET /reservations', () => {
    it('returns all reservations', async () => {
      (reservationService.getAll as jest.Mock).mockResolvedValue([mockReservation]);
      const res = await request(app).get('/reservations');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockReservation]);
    });

    it('handles errors', async () => {
      (reservationService.getAll as jest.Mock).mockRejectedValue(new Error('Test error'));
      const res = await request(app).get('/reservations');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch reservations' });
    });
  });

  describe('GET /reservations/:id', () => {
    it('returns reservation by ID', async () => {
      (reservationService.getById as jest.Mock).mockResolvedValue(mockReservation);
      const res = await request(app).get('/reservations/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockReservation);
    });

    it('handles not found error', async () => {
      (reservationService.getById as jest.Mock).mockRejectedValue(new Error('Not found'));
      const res = await request(app).get('/reservations/999');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Reservation not found' });
    });
  });

  describe('POST /reservations', () => {
    const newReservation = { ...mockReservation, reservationID: undefined };

    it('creates a reservation', async () => {
      (reservationService.create as jest.Mock).mockResolvedValue(mockReservation);
      const res = await request(app).post('/reservations').send(newReservation);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockReservation);
    });

    it('handles creation error', async () => {
      (reservationService.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
      const res = await request(app).post('/reservations').send(newReservation);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to create reservation' });
    });
  });

  describe('PUT /reservations/:id', () => {
    it('updates a reservation', async () => {
      const update = { returnDate: '2025-06-30' };
      const updated = { ...mockReservation, ...update };
      (reservationService.update as jest.Mock).mockResolvedValue(updated);
      const res = await request(app).put('/reservations/1').send(update);
      expect(res.status).toBe(200);
      expect(res.body.returnDate).toBe('2025-06-30');
    });

    it('handles update error', async () => {
      (reservationService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      const res = await request(app).put('/reservations/1').send({ returnDate: '2025-06-30' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update reservation' });
    });
  });

  describe('DELETE /reservations/:id', () => {
    it('deletes a reservation', async () => {
      (reservationService.remove as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app).delete('/reservations/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Reservation deleted' });
    });

    it('handles delete error', async () => {
      (reservationService.remove as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      const res = await request(app).delete('/reservations/1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete reservation' });
    });
  });

  describe('GET /reservations/details', () => {
    it('returns reservation details with joins', async () => {
      const detailed = [{ ...mockReservation, customer: { name: 'John Doe' }, car: { model: 'Toyota Camry' } }];
      (reservationService.getReservationsWithDetailsService as jest.Mock).mockResolvedValue(detailed);
      const res = await request(app).get('/reservations/details');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(detailed);
    });

    it('handles fetch detail error', async () => {
      (reservationService.getReservationsWithDetailsService as jest.Mock).mockRejectedValue(new Error('Detail fetch failed'));
      const res = await request(app).get('/reservations/details');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error fetching reservation details');
    });
  });
});
