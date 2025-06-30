import { Router } from 'express';
import * as carController from './car.controller';
import { adminOnly, authenticated } from '../middleware/bearAuth'; // Import admin middleware

const router = Router();

// Public routes (anyone can view cars)
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.get('/with-location/all', carController.getAllCarsWithLocation);
router.get('/stats/bookings', carController.getCarsWithBookingStats);

// Admin-only routes (only admin can create, update, delete)
router.post('/', adminOnly, carController.createCar);
router.put('/:id', adminOnly, carController.updateCar);
router.delete('/:id', adminOnly, carController.deleteCar);

export default router;