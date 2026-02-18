import { Router } from 'express';
import { getEvents, createEvent, getEventById, updateEvent, deleteEvent, joinEvent, leaveEvent } from '../controllers/event.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.use(unifiedAuth);

router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/join', joinEvent);
router.delete('/:id/join', leaveEvent);

export default router;
