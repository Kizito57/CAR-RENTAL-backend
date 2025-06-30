import { Request, Response } from 'express';
import * as reservationService from './reservation.service';
import { getReservationsWithDetailsService } from "./reservation.service";

// Get all reservations
export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await reservationService.getAll();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

// Get a single reservation by ID
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const reservation = await reservationService.getById(Number(req.params.id));
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Reservation not found" });
  }
};

// Create a new reservation
export const createReservation = async (req: Request, res: Response) => {
  try {
    const newReservation = await reservationService.create(req.body);
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

// Update a reservation
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const updatedReservation = await reservationService.update(Number(req.params.id), req.body);
    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ error: "Failed to update reservation" });
  }
};

// Delete a reservation
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    await reservationService.remove(Number(req.params.id));
    res.json({ message: "Reservation deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reservation" });
  }
};

export const getReservationsWithDetailsController = async (_req: Request, res: Response) => {
  try {
    const data = await getReservationsWithDetailsService();
     console.log("Reservation data:", data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reservation details", error: err });
  }
};