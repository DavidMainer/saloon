const db = require('../config/database');

exports.getAllServices = (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY category ASC, price ASC').all();
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createService = (req, res) => {
  const { name, category, duration, price, description } = req.body;
  if (!name || !category || !duration || !price) {
    return res.status(400).json({ success: false, message: 'Name, category, duration, and price are required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO services (name, category, duration, price, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, category, Number(duration), Number(price), description || '');

    res.status(201).json({ success: true, id: result.lastInsertRowid, message: 'Service added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateService = (req, res) => {
  const { id } = req.params;
  const { name, category, duration, price, description, is_active } = req.body;

  try {
    const result = db.prepare(`
      UPDATE services 
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          duration = COALESCE(?, duration),
          price = COALESCE(?, price),
          description = COALESCE(?, description),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, category, duration, price, description, is_active, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.json({ success: true, message: 'Service updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};