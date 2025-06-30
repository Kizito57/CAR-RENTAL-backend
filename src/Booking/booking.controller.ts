import { Request, Response } from 'express';
import * as bookingService from './booking.service';
import { getAllBookingsWithPaymentsService } from "./booking.service";
// Get all bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingService.getAll();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.getById(Number(req.params.id));
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Booking not found" });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const newBooking = await bookingService.create(req.body);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Update a booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const updatedBooking = await bookingService.update(Number(req.params.id), req.body);
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
};

// Delete a booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    await bookingService.remove(Number(req.params.id));
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

export const getAllBookingsWithPaymentsController = async (_req: Request, res: Response) => {
  try {
    const bookings = await getAllBookingsWithPaymentsService();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings with payments", error });
  }
};
