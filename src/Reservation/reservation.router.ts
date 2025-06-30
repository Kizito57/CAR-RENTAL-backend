import { Router } from 'express';
import * as controller from './reservation.controller';

const router = Router();

router.get('/', controller.getAllReservations);
router.get('/with-details', controller.getReservationsWithDetailsController);
router.get('/:id', controller.getReservationById);
router.post('/', controller.createReservation);
router.put('/:id', controller.updateReservation);
router.delete('/:id', controller.deleteReservation);



export default router;
