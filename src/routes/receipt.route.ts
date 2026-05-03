import { Router } from 'express';
import { createReceipt, getReceipts, getReceiptById, deleteReceipt } from '../controllers/receipt.controller';

import { requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requirePermission('create_receipts'), createReceipt);
router.get('/', requirePermission('view_receipts'), getReceipts);
router.get('/:id', requirePermission('view_receipts'), getReceiptById);
router.delete('/:id', requirePermission('delete_receipts'), deleteReceipt);

export default router;
