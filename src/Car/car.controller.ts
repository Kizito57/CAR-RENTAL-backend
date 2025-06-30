import { Request, Response } from 'express';
import * as carService from './car.service';

// Get all cars
export const getAllCars = async (req: Request, res: Response) => {
  try {
    const cars = await carService.getAll();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
};

// Get a single car by ID
export const getCarById = async (req: Request, res: Response) => {
  try {
    const car = await carService.getById(Number(req.params.id));
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Car not found" });
  }
};

// Create a new car
export const createCar = async (req: Request, res: Response) => {
  try {
    const newCar = await carService.create(req.body);
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ error: "Failed to create car" });
  }
};

// Update an existing car
export const updateCar = async (req: Request, res: Response) => {
  try {
    const updatedCar = await carService.update(Number(req.params.id), req.body);
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ error: "Failed to update car" });
  }
};

// Delete a car
export const deleteCar = async (req: Request, res: Response) => {
  try {
    await carService.remove(Number(req.params.id));
    res.json({ message: "Car deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete car" });
  }
};

// Get all cars with their location details
export const getAllCarsWithLocation = async (req: Request, res: Response) => {
  try {
    const cars = await carService.getAllCarsWithLocation();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars with location details" });
  }
};



// Get cars with booking statistics
export const getCarsWithBookingStats = async (req: Request, res: Response) => {
  try {
    const stats = await carService.getCarsWithBookingStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car booking statistics" });
  }
};