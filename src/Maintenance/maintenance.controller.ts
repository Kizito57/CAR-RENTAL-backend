import { Request, Response } from 'express';
import * as maintenanceService from './maintenance.service';
import { getAllMaintenanceWithCarService } from "./maintenance.service";
// Get all maintenance records
export const getAllMaintenance = async (req: Request, res: Response) => {
  try {
    const records = await maintenanceService.getAll();
    res.json(records);
  } catch {
    res.status(500).json({ error: "Failed to fetch maintenance records" });
  }
};

// Get a single maintenance record
export const getMaintenanceById = async (req: Request, res: Response) => {
  try {
    const record = await maintenanceService.getById(Number(req.params.id));
    res.json(record);
  } catch {
    res.status(500).json({ error: "Maintenance record not found" });
  }
};

// Create a new maintenance record
export const createMaintenance = async (req: Request, res: Response) => {
  try {
    const newRecord = await maintenanceService.create(req.body);
    res.status(201).json(newRecord);
  } catch {
    res.status(500).json({ error: "Failed to create maintenance record" });
  }
};

// Update an existing maintenance record
export const updateMaintenance = async (req: Request, res: Response) => {
  try {
    const updated = await maintenanceService.update(Number(req.params.id), req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update maintenance record" });
  }
};

// Delete a maintenance record
export const deleteMaintenance = async (req: Request, res: Response) => {
  try {
    await maintenanceService.remove(Number(req.params.id));
    res.json({ message: "Maintenance record deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete maintenance record" });
  }
};

export const getAllMaintenanceWithCarController = async (_req: Request, res: Response) => {
  try {
    const records = await getAllMaintenanceWithCarService();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch maintenance records", err });
  }
};