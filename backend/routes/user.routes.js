const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const hotelController = require('../controllers/hotel.controller');
const poojaController = require('../controllers/pooja.controller');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');

// Public slots and pooja endpoints
router.get('/slots', bookingController.getAvailableSlots);
router.get('/poojas', poojaController.getSpecialPoojas);
router.get('/hotels', hotelController.getHotelsList);

// Protected endpoints for devotees
router.post('/book', verifyToken, bookingController.createBooking);
router.get('/bookings', verifyToken, bookingController.getMyBookings);
router.put('/bookings/:id/cancel', verifyToken, bookingController.cancelBooking);

// Notification endpoints
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const list = await db.getNotifications(req.user.id);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
});

router.put('/notifications/read', verifyToken, async (req, res) => {
  try {
    await db.markNotificationsRead(req.user.id);
    res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications.' });
  }
});

module.exports = router;
