require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const specialistRoutes = require('./routes/specialistRoutes');
const clientRoutes = require('./routes/clientRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/api/clients', clientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'SQLite', salon: 'Anex Salon NYC' });
});

// Central error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🌸 Anex Salon Server running on port ${PORT}`);
  console.log(`🌿 Main Website:  http://localhost:${PORT}`);
  console.log(`⛩️  Admin Portal:  http://localhost:${PORT}/admin.html`);
  console.log('📁 Database:      anex_salon.db (Auto-created)');
  console.log('=========================================');
});