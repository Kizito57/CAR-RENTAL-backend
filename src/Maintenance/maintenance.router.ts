import { Router } from 'express';
import * as controller from './maintenance.controller';

const router = Router();

router.get('/', controller.getAllMaintenance);
router.get('/with-car', controller.getAllMaintenanceWithCarController);
router.get('/:id', controller.getMaintenanceById);
router.post('/', controller.createMaintenance);
router.put('/:id', controller.updateMaintenance);
router.delete('/:id', controller.deleteMaintenance);

export default router;
