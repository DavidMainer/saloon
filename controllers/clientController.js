const db = require('../config/database');

exports.getClients = (req, res) => {
  const { search } = req.query;

  try {
    let query = 'SELECT * FROM clients';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY total_spend DESC, visit_count DESC';

    const clients = db.prepare(query).all(...params);
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientById = (req, res) => {
  const { id } = req.params;

  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client profile not found.' });
    }

    const history = db.prepare(`
      SELECT a.id, a.confirmation_code, a.appointment_date, a.appointment_time, a.status,
             s.name AS service_name, s.price, sp.name AS specialist_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN specialists sp ON a.specialist_id = sp.id
      WHERE a.client_id = ?
      ORDER BY a.appointment_date DESC
    `).all(id);

    res.json({ success: true, client, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateClient = (req, res) => {
  const { id } = req.params;
  const { tea_preference, notes, tier } = req.body;

  try {
    const result = db.prepare(`
      UPDATE clients
      SET tea_preference = COALESCE(?, tea_preference),
          notes = COALESCE(?, notes),
          tier = COALESCE(?, tier)
      WHERE id = ?
    `).run(tea_preference, notes, tier, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    res.json({ success: true, message: 'Client profile updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};