import request from 'supertest';
import express from 'express';
import * as paymentService from '../../src/Payment/payment.service';
import * as paymentController from '../../src/Payment/payment.controller';

// Mock DB connection
jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock payment service
jest.mock('../../src/Payment/payment.service');

const app = express();
app.use(express.json());

app.get('/payments', paymentController.getAllPayments);
app.get('/payments/with-booking', paymentController.handleGetPaymentsWithBooking);
app.get('/payments/:id', paymentController.getPaymentById);
app.post('/payments', paymentController.createPayment);
app.put('/payments/:id', paymentController.updatePayment);
app.delete('/payments/:id', paymentController.deletePayment);

const mockPayment = {
  paymentID: 1,
  bookingID: 2,
  amount: '200.00',
  paymentDate: '2025-06-10',
  paymentMethod: 'Credit Card',
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
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 100));
});

describe('Payment Controller', () => {
  describe('GET /payments', () => {
    it('returns all payments', async () => {
      (paymentService.getAll as jest.Mock).mockResolvedValue([mockPayment]);
      const res = await request(app).get('/payments');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockPayment]);
    });

    it('handles fetch error', async () => {
      (paymentService.getAll as jest.Mock).mockRejectedValue(new Error('Error'));
      const res = await request(app).get('/payments');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch payments' });
    });
  });

  describe('GET /payments/:id', () => {
    it('returns payment by ID', async () => {
      (paymentService.getById as jest.Mock).mockResolvedValue(mockPayment);
      const res = await request(app).get('/payments/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPayment);
    });

    it('handles not found error', async () => {
      (paymentService.getById as jest.Mock).mockRejectedValue(new Error('Not found'));
      const res = await request(app).get('/payments/999');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Payment not found' });
    });
  });

  describe('POST /payments', () => {
    const newPayment = { ...mockPayment, paymentID: undefined };

    it('creates a payment', async () => {
      (paymentService.create as jest.Mock).mockResolvedValue(mockPayment);
      const res = await request(app).post('/payments').send(newPayment);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockPayment);
    });

    it('handles creation error', async () => {
      (paymentService.create as jest.Mock).mockRejectedValue(new Error('Create failed'));
      const res = await request(app).post('/payments').send(newPayment);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to create payment' });
    });
  });

  describe('PUT /payments/:id', () => {
    it('updates a payment', async () => {
      const update = { amount: '250.00' };
      const updatedPayment = { ...mockPayment, ...update };
      (paymentService.update as jest.Mock).mockResolvedValue(updatedPayment);
      const res = await request(app).put('/payments/1').send(update);
      expect(res.status).toBe(200);
      expect(res.body.amount).toBe('250.00');
    });

    it('handles update error', async () => {
      (paymentService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      const res = await request(app).put('/payments/1').send({ amount: '250.00' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update payment' });
    });
  });

  describe('DELETE /payments/:id', () => {
    it('deletes a payment', async () => {
      (paymentService.remove as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app).delete('/payments/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Payment deleted' });
    });

    it('handles delete error', async () => {
      (paymentService.remove as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      const res = await request(app).delete('/payments/1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete payment' });
    });
  });

  describe('GET /payments/with-booking', () => {
    it('returns payments with booking info', async () => {
      const mockWithBooking = [
        {
          ...mockPayment,
          booking: {
            bookingID: 2,
            customerID: 1,
            totalAmount: '200.00',
          },
        },
      ];
      (paymentService.getPaymentsWithBooking as jest.Mock).mockResolvedValue(mockWithBooking);
      const res = await request(app).get('/payments/with-booking');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockWithBooking);
    });

    it('handles fetch error for payments with booking', async () => {
      (paymentService.getPaymentsWithBooking as jest.Mock).mockRejectedValue(new Error('Error'));
      const res = await request(app).get('/payments/with-booking');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch payments with booking.' });
    });
  });
});
