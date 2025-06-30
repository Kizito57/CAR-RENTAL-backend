import { Router } from 'express';
import * as controller from './booking.controller';
import { adminOnly, authenticated } from '../middleware/bearAuth';

const router = Router();

router.get('/', controller.getAllBookings);
router.get("/with-payments", controller.getAllBookingsWithPaymentsController);
router.get('/:id', controller.getBookingById);

router.post('/', authenticated,controller.createBooking);
router.put('/:id', adminOnly,controller.updateBooking);
router.delete('/:id', adminOnly ,controller.deleteBooking);



export default router;
