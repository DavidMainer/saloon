const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '..', 'anex_salon.db'));
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS specialists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'On Floor',
    capacity_pct INTEGER DEFAULT 0,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'Standard',
    tea_preference TEXT,
    notes TEXT,
    total_spend REAL DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    confirmation_code TEXT UNIQUE NOT NULL,
    client_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    specialist_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(specialist_id) REFERENCES specialists(id)
  );
`);

// Auto-seed initial salon data
const staffCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (staffCount === 0) {
  const hash = bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASSWORD || 'AdminAnex2026!', 10);
  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    'Anex Concierge',
    'concierge@anexsalon.com',
    hash,
    'superadmin'
  );

  const insertSpecialist = db.prepare('INSERT INTO specialists (name, title, role, status, capacity_pct) VALUES (?, ?, ?, ?, ?)');
  insertSpecialist.run('Yuki Sato', 'Grand Master Stylist', 'Scalp Spa & Cut', 'On Floor', 80);
  insertSpecialist.run('Aoi Takahashi', 'Master Gel Artist', 'Japanese Gel Art', 'In Treatment', 95);
  insertSpecialist.run('Kenji Mori', 'Acupressure Specialist', 'Head Spa & Facial', 'Break', 60);
  insertSpecialist.run('Maya Tanaka', 'Senior Lash Artisan', 'Lashes & Brows', 'On Floor', 45);

  const insertService = db.prepare('INSERT INTO services (name, category, duration, price, description) VALUES (?, ?, ?, ?, ?)');
  insertService.run('Japanese Carbonated Head Spa', 'Scalp Care', 75, 185.00, 'Micro-camera scan, waterfall rinse & Shiatsu head pressure');
  insertService.run('Omakase Botanical Gel Manicure', 'Nail Art', 90, 160.00, 'Hand-painted mineral leaf art and non-acid Japanese gel');
  insertService.run('Feather-Weight Lash Extension', 'Lash & Brow', 90, 195.00, 'Handmade silk lash fans tailored to Japanese eye contouring');
  insertService.run('Zen Hinoki Facial Lift', 'Facial Care', 60, 150.00, 'Hinoki cypress wand acupressure with matcha antioxidant infusion');
}

module.exports = db;