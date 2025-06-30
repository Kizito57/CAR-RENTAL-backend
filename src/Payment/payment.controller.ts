import { Request, Response } from 'express';
import * as paymentService from './payment.service';
import {
  getPaymentsWithBooking,

} from './payment.service';
// Get all payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await paymentService.getAll();
    res.json(payments);
  } catch {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await paymentService.getById(Number(req.params.id));
    res.json(payment);
  } catch {
    res.status(500).json({ error: "Payment not found" });
  }
};

// Create new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const newPayment = await paymentService.create(req.body);
    res.status(201).json(newPayment);
  } catch {
    res.status(500).json({ error: "Failed to create payment" });
  }
};

// Update a payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const updatedPayment = await paymentService.update(Number(req.params.id), req.body);
    res.json(updatedPayment);
  } catch {
    res.status(500).json({ error: "Failed to update payment" });
  }
};

// Delete a payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    await paymentService.remove(Number(req.params.id));
    res.json({ message: "Payment deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete payment" });
  }
};
export const handleGetPaymentsWithBooking = async (_req: Request, res: Response) => {
  try {
    const result = await getPaymentsWithBooking();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments with booking.' });
  }
};
