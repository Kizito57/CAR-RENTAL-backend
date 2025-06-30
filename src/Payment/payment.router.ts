import { Router } from 'express';
import * as controller from './payment.controller';

const router = Router();

router.get('/', controller.getAllPayments);
router.get('/payments-with-booking', controller.handleGetPaymentsWithBooking);

router.get('/:id', controller.getPaymentById);
router.post('/', controller.createPayment);
router.put('/:id', controller.updatePayment);
router.delete('/:id', controller.deletePayment);

export default router;
