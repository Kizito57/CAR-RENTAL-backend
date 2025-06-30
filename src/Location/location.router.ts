import { Router } from 'express';
import * as controller from './location.controller';

const router = Router();

router.get('/', controller.getAllLocations);
router.get('/with-cars', controller.getAllLocationsWithCarsController);
router.get('/with-assigned-cars', controller.getLocationsWithAssignedCarsController);
router.get('/:id', controller.getLocationById);
router.post('/', controller.createLocation);
router.put('/:id', controller.updateLocation);
router.delete('/:id', controller.deleteLocation);

export default router;
