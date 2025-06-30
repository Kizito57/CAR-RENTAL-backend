import request from 'supertest';
import express from 'express';
import * as bookingService from '../../src/Booking/booking.service';
import * as bookingController from '../../src/Booking/booking.controller';

// Mock the database connection to prevent it from actually connecting
jest.mock('../../src/Drizzle/db', () => ({
  // Mock any database exports your service uses
  db: {},
  // Add other exports as needed
}));

// Mock the booking service
jest.mock('../../src/Booking/booking.service');
const mockBookingService = bookingService as jest.Mocked<typeof bookingService>;

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.get('/bookings', bookingController.getAllBookings);
app.get('/bookings/with-payments', bookingController.getAllBookingsWithPaymentsController);
app.get('/bookings/:id', bookingController.getBookingById);
app.post('/bookings', bookingController.createBooking);
app.put('/bookings/:id', bookingController.updateBooking);
app.delete('/bookings/:id', bookingController.deleteBooking);

describe('Booking Controller Integration Tests', () => {
  const mockBooking = {
    customerID: 1,
    carID: 1,
    bookingID: 1,
    rentalStartDate: '2024-01-15',
    rentalEndDate: '2024-01-20',
    totalAmount: '250.00'
  };

  const mockBookings = [
    mockBooking, 
    { 
      ...mockBooking, 
      bookingID: 2, 
      customerID: 2, 
      carID: 2,
      totalAmount: '300.00'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /bookings', () => {
    it('should return all bookings successfully', async () => {
      mockBookingService.getAll.mockResolvedValue(mockBookings);

      const response = await request(app)
        .get('/bookings')
        .expect(200);

      expect(response.body).toEqual(mockBookings);
      expect(mockBookingService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      mockBookingService.getAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/bookings')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch bookings' });
    });
  });

  describe('GET /bookings/with-payments', () => {
    it('should return bookings with payments successfully', async () => {
      const mockBookingsWithPayments = [{ ...mockBooking, payment: { amount: 100, status: 'paid' } }];
      mockBookingService.getAllBookingsWithPaymentsService.mockResolvedValue(mockBookingsWithPayments);

      const response = await request(app)
        .get('/bookings/with-payments')
        .expect(200);

      expect(response.body).toEqual(mockBookingsWithPayments);
      expect(mockBookingService.getAllBookingsWithPaymentsService).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      mockBookingService.getAllBookingsWithPaymentsService.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/bookings/with-payments')
        .expect(500);

      expect(response.body).toEqual({ 
        message: 'Failed to fetch bookings with payments', 
        error: expect.any(Object) 
      });
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return a booking by ID', async () => {
      mockBookingService.getById.mockResolvedValue(mockBooking);

      const response = await request(app)
        .get('/bookings/1')
        .expect(200);

      expect(response.body).toEqual(mockBooking);
      expect(mockBookingService.getById).toHaveBeenCalledWith(1);
    });

    it('should handle booking not found', async () => {
      mockBookingService.getById.mockRejectedValue(new Error('Not found'));

      const response = await request(app)
        .get('/bookings/999')
        .expect(500);

      expect(response.body).toEqual({ error: 'Booking not found' });
    });
  });

  describe('POST /bookings', () => {
    const newBookingData = {
      customerID: 3,
      carID: 1,
      bookingID: 3,
      rentalStartDate: '2024-02-01',
      rentalEndDate: '2024-02-05',
      totalAmount: '200.00'
    };

    it('should create a new booking', async () => {
      const createdBooking = { ...newBookingData };
      mockBookingService.create.mockResolvedValue(createdBooking);

      const response = await request(app)
        .post('/bookings')
        .send(newBookingData)
        .expect(201);

      expect(response.body).toEqual(createdBooking);
      expect(mockBookingService.create).toHaveBeenCalledWith(newBookingData);
    });

    it('should handle creation errors', async () => {
      mockBookingService.create.mockRejectedValue(new Error('Validation error'));

      const response = await request(app)
        .post('/bookings')
        .send(newBookingData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create booking' });
    });
  });

  describe('PUT /bookings/:id', () => {
    const updateData = { totalAmount: '275.00' };

    it('should update a booking', async () => {
      const updatedBooking = { ...mockBooking, ...updateData };
      mockBookingService.update.mockResolvedValue(updatedBooking);

      const response = await request(app)
        .put('/bookings/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedBooking);
      expect(mockBookingService.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle update errors', async () => {
      mockBookingService.update.mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .put('/bookings/1')
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to update booking' });
    });
  });

  describe('DELETE /bookings/:id', () => {
    it('should delete a booking', async () => {
      mockBookingService.remove.mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/bookings/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Booking deleted' });
      expect(mockBookingService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle deletion errors', async () => {
      mockBookingService.remove.mockRejectedValue(new Error('Delete failed'));

      const response = await request(app)
        .delete('/bookings/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to delete booking' });
    });
  });
});