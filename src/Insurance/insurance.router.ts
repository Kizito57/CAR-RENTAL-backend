import { Router } from 'express';
import * as controller from './insurance.controller';

const router = Router();

router.get('/', controller.getAllInsurance);
router.get('/with-car', controller.getAllInsuranceWithCarController);
router.get('/:id', controller.getInsuranceById);
router.post('/', controller.createInsurance);
router.put('/:id', controller.updateInsurance);
router.delete('/:id', controller.deleteInsurance);

export default router;
