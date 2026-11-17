import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/notifications
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [user.id]
    );

    const unreadCount = rows.filter((r) => !r['is_read']).length;

    res.json({
      success: true,
      data: {
        notifications: rows,
        unreadCount,
      },
    });
  } catch (err: any) {
    logger.error('Get notifications failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const notifId = parseInt(req.params['id']);

    await query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [notifId, user.id]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    logger.error('Mark notification read failed', err);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

/**
 * POST /api/notifications/read-all
 */
router.post('/read-all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [user.id]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    logger.error('Mark all read failed', err);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

export default router;

