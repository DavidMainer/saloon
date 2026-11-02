const db = require('../config/database');

exports.getAllSpecialists = (req, res) => {
  try {
    const specialists = db.prepare('SELECT * FROM specialists ORDER BY id ASC').all();
    res.json({ success: true, specialists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status, capacity_pct } = req.body;

  const validStatuses = ['On Floor', 'In Treatment', 'Break', 'Off Duty'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid specialist status.' });
  }

  try {
    const result = db.prepare(`
      UPDATE specialists
      SET status = COALESCE(?, status),
          capacity_pct = COALESCE(?, capacity_pct)
      WHERE id = ?
    `).run(status, capacity_pct, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    res.json({ success: true, message: 'Specialist status updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};