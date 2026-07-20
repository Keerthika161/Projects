const db = require('../config/db');

exports.getSpecialPoojas = async (req, res) => {
  try {
    const { date } = req.query;
    // Default to today's date if not supplied
    const queryDate = date || new Date().toISOString().split('T')[0];

    const poojas = await db.getPoojasByDate(queryDate);
    res.json(poojas);
  } catch (error) {
    console.error('Error fetching poojas:', error);
    res.status(500).json({ message: 'Error retrieving special poojas.', error: error.message });
  }
};

exports.addSpecialPooja = async (req, res) => {
  try {
    const { name, description, date } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: 'Name and Date are required.' });
    }

    const newPooja = await db.addPooja(name, description || '', date);

    // Create a broadcast announcement (notify all active users, or seed it in notification table)
    // To make this feel like a live platform, we will add a notification for all users
    const users = await db.getAllUsers();
    for (const u of users) {
      await db.createNotification(
        u.id, 
        `New Special Pooja Scheduled: ${name} on ${date}. ${description || ''}`, 
        'special_pooja_announcement'
      );
    }

    res.status(201).json({
      message: 'Special Pooja added successfully.',
      pooja: newPooja
    });
  } catch (error) {
    console.error('Error adding pooja:', error);
    res.status(500).json({ message: 'Error creating special pooja.', error: error.message });
  }
};

exports.updateSpecialPooja = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, status } = req.body; // status: 'active' or 'completed'

    if (!name || !date || !status) {
      return res.status(400).json({ message: 'Name, Date, and Status are required.' });
    }

    const updated = await db.updatePooja(id, name, description || '', date, status);
    res.json({
      message: 'Special Pooja updated successfully.',
      pooja: updated
    });
  } catch (error) {
    console.error('Error updating pooja:', error);
    res.status(500).json({ message: 'Error updating special pooja.', error: error.message });
  }
};

exports.deleteSpecialPooja = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deletePooja(id);
    res.json({ message: 'Special Pooja deleted successfully.' });
  } catch (error) {
    console.error('Error deleting pooja:', error);
    res.status(500).json({ message: 'Error deleting special pooja.', error: error.message });
  }
};
