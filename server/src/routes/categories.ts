import { Router } from 'express';

const router = Router();

const CATEGORIES = [
  'Music', 'Sports', 'Tech', 'Food', 'Arts', 'Business', 'Wellness', 'Education'
];

router.get('/', (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

export default router;
