const db = require('../config/database');

exports.createAppointment = (req, res) => {
  const { clientName, clientEmail, clientPhone, serviceId, specialistId, date, time, notes, teaPreference } = req.body;

  if (!clientName || !clientEmail || !serviceId || !specialistId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required reservation fields.' });
  }

  const confirmationCode = 'ANX-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  const transaction = db.transaction(() => {
    let client = db.prepare('SELECT id, visit_count, total_spend FROM clients WHERE email = ?').get(clientEmail);
    const service = db.prepare('SELECT price FROM services WHERE id = ?').get(serviceId);

    if (!service) throw new Error('Selected ritual does not exist.');

    let clientId;
    if (client) {
      clientId = client.id;
      db.prepare(`
        UPDATE clients 
        SET visit_count = visit_count + 1, 
            total_spend = total_spend + ?,
            tea_preference = COALESCE(?, tea_preference),
            notes = COALESCE(?, notes)
        WHERE id = ?
      `).run(service.price, teaPreference, notes, clientId);
    } else {
      const info = db.prepare(`
        INSERT INTO clients (name, email, phone, tea_preference, notes, total_spend, visit_count)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).run(clientName, clientEmail, clientPhone || '', teaPreference || 'Matcha Genmaicha', notes || '', service.price);
      clientId = info.lastInsertRowid;
    }

    const appt = db.prepare(`
      INSERT INTO appointments (confirmation_code, client_id, service_id, specialist_id, appointment_date, appointment_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(confirmationCode, clientId, serviceId, specialistId, date, time, notes || '');

    return { id: appt.lastInsertRowid, confirmationCode };
  });

  try {
    const data = transaction();
    res.status(201).json({ success: true, message: 'Reservation confirmed.', appointment: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = (req, res) => {
  const { date, status, specialistId } = req.query;

  let query = `
    SELECT 
      a.id, a.confirmation_code, a.appointment_date, a.appointment_time, a.status, a.notes,
      c.name AS client_name, c.email AS client_email, c.phone AS client_phone, c.tier AS client_tier, c.tea_preference,
      s.name AS service_name, s.duration, s.price,
      sp.name AS specialist_name
    FROM appointments a
    JOIN clients c ON a.client_id = c.id
    JOIN services s ON a.service_id = s.id
    JOIN specialists sp ON a.specialist_id = sp.id
    WHERE 1=1
  `;
  const params = [];

  if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (specialistId) { query += ' AND a.specialist_id = ?'; params.push(specialistId); }

  query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

  const rows = db.prepare(query).all(...params);
  res.json({ success: true, appointments: rows });
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Confirmed', 'In Treatment', 'Completed', 'Cancelled', 'No-Show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
  }

  const result = db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  res.json({ success: true, message: `Status updated to ${status}.` });
};