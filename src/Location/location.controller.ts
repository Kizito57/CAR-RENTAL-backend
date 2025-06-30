import { Request, Response } from 'express';
import * as locationService from './location.service';
import { getAllLocationsWithCarsService ,getLocationsWithAssignedCarsService} from "./location.service";
// Get all locations
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await locationService.getAll();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};

// Get a single location by ID
export const getLocationById = async (req: Request, res: Response) => {
  try {
    const location = await locationService.getById(Number(req.params.id));
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Location not found" });
  }
};

// Create a new location
export const createLocation = async (req: Request, res: Response) => {
  try {
    const newLocation = await locationService.create(req.body);
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create location" });
  }
};

// Update an existing location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const updated = await locationService.update(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update location" });
  }
};

// Delete a location
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    await locationService.remove(Number(req.params.id));
    res.json({ message: "Location deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete location" });
  }
};
export const getAllLocationsWithCarsController = async (_req: Request, res: Response) => {
  try {
    const locations = await getAllLocationsWithCarsService();
    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations with cars:", error);
    res.status(500).json({ message: "Failed to fetch locations with cars", error });
  }
};
export const getLocationsWithAssignedCarsController = async (_req: Request, res: Response) => {
  try {
    const locations = await getLocationsWithAssignedCarsService();
    res.json(locations);
  } catch (error) {
    console.error("Error fetching assigned car locations:", error);
    res.status(500).json({ message: "Failed to fetch locations with assigned cars", error });
  }
};