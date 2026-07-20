const db = require('../config/db');

// Helper to generate a unique Booking ID (e.g. TPL-5A8D2F)
function generateBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TPL-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required (YYYY-MM-DD).' });
    }

    const slots = await db.getSlotsByDate(date);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Error retrieving booking slots.', error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { date, slotId, needAccommodation, hotelId, roomId } = req.body;
    const userId = req.user.id;

    if (!date || !slotId) {
      return res.status(400).json({ message: 'Date and Slot selection are required.' });
    }

    // 1. Verify Slot Capacity
    const slot = await db.getSlotById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Selected slot does not exist.' });
    }

    if (slot.remaining_slots <= 0) {
      return res.status(400).json({ message: 'This slot is fully booked. Please select another slot.' });
    }

    // 2. Validate Room Availability if accommodation requested
    let finalRoomId = null;
    let finalHotelId = null;

    if (needAccommodation && hotelId) {
      finalHotelId = hotelId;
      const rooms = await db.getRoomsByHotel(hotelId);
      const availableRooms = rooms.filter(r => r.status === 'available');

      if (availableRooms.length === 0) {
        return res.status(400).json({ message: 'No rooms available in the selected hotel.' });
      }

      // If specific room is selected, check it. Otherwise, auto-assign the first available room.
      if (roomId) {
        const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
        if (!selectedRoom || selectedRoom.status !== 'available') {
          return res.status(400).json({ message: 'Selected room is no longer available.' });
        }
        finalRoomId = roomId;
      } else {
        finalRoomId = availableRooms[0].id;
      }
    }

    // 3. Create Booking
    const bookingId = generateBookingId();
    const booking = await db.createBooking(bookingId, userId, date, slotId, finalHotelId, finalRoomId);

    // 4. Create Notifications
    const user = await db.getUserById(userId);
    const timeAnnouncement = slot.slot_time;
    
    await db.createNotification(
      userId, 
      `Booking Confirmed! ID: ${bookingId}. Slot: ${timeAnnouncement} on ${date}. Please arrive 15 minutes early.`, 
      'booking_confirmation'
    );

    if (finalHotelId && finalRoomId) {
      const hotel = await db.getHotelById(finalHotelId);
      const room = await db.getRoomById(finalRoomId);
      await db.createNotification(
        userId, 
        `Accommodation Confirmed! Hotel: ${hotel.name}, Room: ${room.room_number}. Check-in on ${date}.`, 
        'accommodation_confirmation'
      );
    }

    // Add a slot reminder notification (mocked for tomorrow or immediate check)
    await db.createNotification(
      userId,
      `Reminder: You have a scheduled temple visit tomorrow for slot ${timeAnnouncement}.`,
      'slot_reminder'
    );

    // 5. Add to walk-in/visitors dynamically when checked in (normally done by Admin check-in, 
    // but we link it to visitor count for analytics when they complete bookings)
    // To feed crowd data, we can also register this visitor as 'pre-registered' or add them to the visitors table when checked-in.
    
    res.status(201).json({
      message: 'Booking created successfully!',
      booking: {
        ...booking,
        bookingId: bookingId,
        slot_time: timeAnnouncement,
        hotel_name: finalHotelId ? (await db.getHotelById(finalHotelId)).name : null,
        room_number: finalRoomId ? (await db.getRoomById(finalRoomId)).room_number : null
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error processing booking.', error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await db.getBookings({ userId });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error retrieving your bookings.', error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { date, slotId, hotelId, search } = req.query;
    const bookings = await db.getBookings({ date, slotId, hotelId, search });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Error retrieving bookings list.', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Standard users can only cancel their own bookings
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    await db.cancelBooking(id);

    // Notify user
    await db.createNotification(
      booking.user_id,
      `Your booking ID: ${id} has been cancelled successfully.`,
      'booking_confirmation'
    );

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error processing cancellation.', error: error.message });
  }
};
