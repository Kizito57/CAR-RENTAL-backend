import { Request, Response } from 'express';
import * as insuranceService from './insurance.service';
import { getAllInsuranceWithCarService } from "./insurance.service";
// Get all insurance records
export const getAllInsurance = async (req: Request, res: Response) => {
  try {
    const records = await insuranceService.getAll();
    res.json(records);
  } catch {
    res.status(500).json({ error: "Failed to fetch insurance records" });
  }
};

// Get one insurance record by ID
export const getInsuranceById = async (req: Request, res: Response) => {
  try {
    const record = await insuranceService.getById(Number(req.params.id));
    res.json(record);
  } catch {
    res.status(500).json({ error: "Insurance record not found" });
  }
};

// Create new insurance record
export const createInsurance = async (req: Request, res: Response) => {
  try {
    const newRecord = await insuranceService.create(req.body);
    res.status(201).json(newRecord);
  } catch {
    res.status(500).json({ error: "Failed to create insurance record" });
  }
};

// Update insurance record
export const updateInsurance = async (req: Request, res: Response) => {
  try {
    const updated = await insuranceService.update(Number(req.params.id), req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update insurance record" });
  }
};

// Delete insurance record
export const deleteInsurance = async (req: Request, res: Response) => {
  try {
    await insuranceService.remove(Number(req.params.id));
    res.json({ message: "Insurance record deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete insurance record" });
  }
};

export const getAllInsuranceWithCarController = async (_req: Request, res: Response) => {
  try {
    const policies = await getAllInsuranceWithCarService();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch insurance records", err });
  }
};