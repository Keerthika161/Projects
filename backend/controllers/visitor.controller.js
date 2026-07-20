const db = require('../config/db');

exports.getCrowdStatus = async (req, res) => {
  try {
    const status = await db.getCrowdStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching crowd status:', error);
    res.status(500).json({ message: 'Error retrieving crowd monitoring stats.', error: error.message });
  }
};

exports.getVisitorsList = async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const list = await db.getVisitors({ status, date, search });
    res.json(list);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Error retrieving visitors list.', error: error.message });
  }
};

exports.checkInVisitor = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ message: 'Name and Mobile number are required for check-in.' });
    }

    const visitor = await db.checkInVisitor(name, email, mobile);
    res.status(201).json({
      message: 'Visitor checked in successfully.',
      visitor
    });
  } catch (error) {
    console.error('Error checking in visitor:', error);
    res.status(500).json({ message: 'Error registering check-in.', error: error.message });
  }
};

exports.checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Visitor ID is required.' });
    }

    await db.checkOutVisitor(id);
    res.json({ message: 'Visitor checked out successfully.' });
  } catch (error) {
    console.error('Error checking out visitor:', error);
    res.status(500).json({ message: 'Error registering check-out.', error: error.message });
  }
};
