const db = require('../config/db');

exports.getHotelsList = async (req, res) => {
  try {
    const hotels = await db.getHotels();
    
    // Map with occupancy percentage
    const formatted = hotels.map(h => {
      const occupancy = h.total_rooms > 0 ? Math.round((h.booked_rooms / h.total_rooms) * 100) : 0;
      return {
        ...h,
        occupancy_percentage: occupancy
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Error retrieving hotels list.', error: error.message });
  }
};

exports.getRoomsList = async (req, res) => {
  try {
    const { hotelId } = req.params;
    if (!hotelId) {
      return res.status(400).json({ message: 'Hotel ID is required.' });
    }

    const rooms = await db.getRoomsByHotel(hotelId);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error retrieving rooms.', error: error.message });
  }
};

exports.addNewRoom = async (req, res) => {
  try {
    const { hotelId, roomNumber } = req.body;

    if (!hotelId || !roomNumber) {
      return res.status(400).json({ message: 'Hotel ID and Room Number are required.' });
    }

    // Check if room number already exists for this hotel
    const rooms = await db.getRoomsByHotel(hotelId);
    const exists = rooms.some(r => r.room_number === roomNumber.toString());
    if (exists) {
      return res.status(400).json({ message: `Room number ${roomNumber} already exists in this hotel.` });
    }

    const newRoom = await db.addRoom(hotelId, roomNumber);
    res.status(201).json({
      message: 'Room added successfully.',
      room: newRoom
    });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ message: 'Error creating room.', error: error.message });
  }
};

exports.updateRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body; // 'available' or 'occupied'

    if (!status || !['available', 'occupied'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'available' or 'occupied'." });
    }

    const room = await db.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    if (room.status === status) {
      return res.json({ message: 'Room is already in the requested status.', room });
    }

    // Update status
    const updatedRoom = await db.updateRoomStatus(roomId, status);
    
    // Update booked rooms count on hotel
    const increment = status === 'occupied' ? 1 : -1;
    await db.updateHotelBookings(room.hotel_id, increment);

    res.json({
      message: `Room status updated to ${status}.`,
      room: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ message: 'Error updating room status.', error: error.message });
  }
};
