const db = require('../config/db');

exports.getPrasadamList = async (req, res) => {
  try {
    const list = await db.getPrasadam();
    
    // Map with distribution percentage
    const formatted = list.map(p => {
      const distribution = p.quantity_prepared > 0 
        ? Math.round((p.quantity_distributed / p.quantity_prepared) * 100) 
        : 0;
      return {
        ...p,
        distribution_percentage: distribution
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching prasadam:', error);
    res.status(500).json({ message: 'Error retrieving prasadam records.', error: error.message });
  }
};

exports.addNewPrasadam = async (req, res) => {
  try {
    const { name, quantityPrepared } = req.body;

    if (!name || quantityPrepared === undefined) {
      return res.status(400).json({ message: 'Name and Initial Quantity Prepared are required.' });
    }

    if (quantityPrepared < 0) {
      return res.status(400).json({ message: 'Prepared quantity cannot be negative.' });
    }

    const newPrasadam = await db.addPrasadam(name, quantityPrepared);
    res.status(201).json({
      message: 'Prasadam item created successfully.',
      prasadam: {
        ...newPrasadam,
        distribution_percentage: 0
      }
    });
  } catch (error) {
    console.error('Error adding prasadam:', error);
    res.status(500).json({ message: 'Error creating prasadam.', error: error.message });
  }
};

exports.updatePrasadamQuantities = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantityPrepared, quantityDistributed } = req.body;

    if (!name || quantityPrepared === undefined || quantityDistributed === undefined) {
      return res.status(400).json({ message: 'Name, Quantity Prepared and Quantity Distributed are required.' });
    }

    if (quantityPrepared < 0 || quantityDistributed < 0) {
      return res.status(400).json({ message: 'Quantities cannot be negative.' });
    }

    if (quantityDistributed > quantityPrepared) {
      return res.status(400).json({ message: 'Distributed quantity cannot exceed prepared quantity.' });
    }

    const updated = await db.updatePrasadam(id, name, quantityPrepared, quantityDistributed);
    const distribution = updated.quantity_prepared > 0 
      ? Math.round((updated.quantity_distributed / updated.quantity_prepared) * 100) 
      : 0;

    res.json({
      message: 'Prasadam updated successfully.',
      prasadam: {
        ...updated,
        distribution_percentage: distribution
      }
    });
  } catch (error) {
    console.error('Error updating prasadam:', error);
    res.status(500).json({ message: 'Error updating prasadam.', error: error.message });
  }
};

exports.deletePrasadamItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deletePrasadam(id);
    res.json({ message: 'Prasadam item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting prasadam:', error);
    res.status(500).json({ message: 'Error deleting prasadam.', error: error.message });
  }
};
