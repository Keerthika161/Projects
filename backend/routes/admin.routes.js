const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');
const bookingController = require('../controllers/booking.controller');
const hotelController = require('../controllers/hotel.controller');
const prasadamController = require('../controllers/prasadam.controller');
const poojaController = require('../controllers/pooja.controller');
const visitorController = require('../controllers/visitor.controller');

// All routes here are protected and require admin privileges
router.use(verifyAdmin);

// Dashboard & Analytics
router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/analytics-charts', reportController.getAnalyticsCharts);
router.get('/reports/export', reportController.exportReportCSV);

// Bookings
router.get('/bookings', bookingController.getAllBookings);
router.put('/bookings/:id/cancel', bookingController.cancelBooking);

// Hotels & Rooms
router.get('/hotels', hotelController.getHotelsList);
router.get('/hotels/:hotelId/rooms', hotelController.getRoomsList);
router.post('/rooms', hotelController.addNewRoom);
router.put('/rooms/:roomId/status', hotelController.updateRoomStatus);

// Prasadam Management
router.get('/prasadam', prasadamController.getPrasadamList);
router.post('/prasadam', prasadamController.addNewPrasadam);
router.put('/prasadam/:id', prasadamController.updatePrasadamQuantities);
router.delete('/prasadam/:id', prasadamController.deletePrasadamItem);

// Special Pooja Management
router.get('/poojas', poojaController.getSpecialPoojas);
router.post('/poojas', poojaController.addSpecialPooja);
router.put('/poojas/:id', poojaController.updateSpecialPooja);
router.delete('/poojas/:id', poojaController.deleteSpecialPooja);

// Visitor Management & Physical Check-in/out
router.get('/visitors', visitorController.getVisitorsList);
router.post('/visitors/check-in', visitorController.checkInVisitor);
router.put('/visitors/:id/check-out', visitorController.checkOutVisitor);

module.exports = router;
