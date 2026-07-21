const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const dbMode = process.env.DB_MODE || 'local';
let sqliteDb = null;
let supabaseClient = null;
let mysqlPool = null;

// Initialize Database Connections based on Mode
if (dbMode === 'local') {
  // Ensure db folder exists
  const dbDir = path.join(__dirname, '../db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.resolve(dbDir, 'temple.sqlite');
  
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to local SQLite database:', err.message);
    } else {
      console.log('Connected to local SQLite database at:', dbPath);
      initializeSqliteTables();
    }
  });
} else if (dbMode === 'supabase') {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing. Falling back to local SQLite.');
    // Fallback logic
    process.env.DB_MODE = 'local';
    // Re-initialize sqlite
    const dbDir = path.join(__dirname, '../db');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    const dbPath = path.resolve(dbDir, 'temple.sqlite');
    sqliteDb = new sqlite3.Database(dbPath, () => {
      console.log('Connected to local SQLite database as fallback.');
      initializeSqliteTables();
    });
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('Initialized Supabase Client successfully.');
  }
} else if (dbMode === 'mysql') {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'temple_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('MySQL connection pool initialized.');
}

// SQLITE INITIALIZATION & SEEDING (Run automatically in local mode)
function initializeSqliteTables() {
  sqliteDb.serialize(() => {
    // 1. Users
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Slots
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slot_time TEXT NOT NULL,
        max_capacity INTEGER NOT NULL,
        current_bookings INTEGER DEFAULT 0,
        remaining_slots INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, slot_time)
      )
    `);

    // 3. Hotels
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        total_rooms INTEGER NOT NULL,
        booked_rooms INTEGER DEFAULT 0,
        available_rooms INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Rooms
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id INTEGER,
        room_number TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        UNIQUE(hotel_id, room_number)
      )
    `);

    // 5. Bookings
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        date TEXT NOT NULL,
        slot_id INTEGER,
        hotel_id INTEGER,
        room_id INTEGER,
        status TEXT DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      )
    `);

    // 6. Prasadam
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS prasadam (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        quantity_prepared INTEGER DEFAULT 0,
        quantity_distributed INTEGER DEFAULT 0,
        remaining_quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Special Pooja
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS special_pooja (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Visitors
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        mobile TEXT NOT NULL,
        check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        check_out_time DATETIME,
        status TEXT DEFAULT 'inside',
        date TEXT DEFAULT (date('now', 'localtime')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Notifications
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Seed Admin & User if empty
    sqliteDb.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
      if (err) return;
      if (row.count === 0) {
        const adminHash = await bcrypt.hash('admin12', 10);
        const userHash = await bcrypt.hash('user12', 10);
        sqliteDb.run(`INSERT INTO users (name, mobile, email, password, role) VALUES (?, ?, ?, ?, ?)`, 
          ['Temple Admin', '9876543210', 'admin@gmail.com', adminHash, 'admin']
        );
        sqliteDb.run(`INSERT INTO users (name, mobile, email, password, role) VALUES (?, ?, ?, ?, ?)`, 
          ['Devotee Keerthi', '8765432109', 'user@gmail.com', userHash, 'user']
        );
        console.log('Seeded SQLite Users: admin@gmail.com / admin12, user@gmail.com / user12');
      }
    });

    // Seed Hotels
    sqliteDb.get(`SELECT COUNT(*) as count FROM hotels`, (err, row) => {
      if (err) return;
      if (row.count === 0) {
        sqliteDb.run(`INSERT INTO hotels (name, total_rooms, booked_rooms, available_rooms) VALUES (?, ?, ?, ?)`, ['Taj Hotel', 60, 0, 60]);
        sqliteDb.run(`INSERT INTO hotels (name, total_rooms, booked_rooms, available_rooms) VALUES (?, ?, ?, ?)`, ['Breeze Hotel', 100, 0, 100]);
        sqliteDb.run(`INSERT INTO hotels (name, total_rooms, booked_rooms, available_rooms) VALUES (?, ?, ?, ?)`, ['Sree Hotel', 80, 0, 80], () => {
          // Seed Rooms for each hotel
          // Hotel 1 (Taj)
          for (let i = 1; i <= 5; i++) {
            sqliteDb.run(`INSERT INTO rooms (hotel_id, room_number, status) VALUES (?, ?, ?)`, [1, `10${i}`, 'available']);
          }
          // Hotel 2 (Breeze)
          for (let i = 1; i <= 5; i++) {
            sqliteDb.run(`INSERT INTO rooms (hotel_id, room_number, status) VALUES (?, ?, ?)`, [2, `20${i}`, 'available']);
          }
          // Hotel 3 (Sree)
          for (let i = 1; i <= 5; i++) {
            sqliteDb.run(`INSERT INTO rooms (hotel_id, room_number, status) VALUES (?, ?, ?)`, [3, `30${i}`, 'available']);
          }
          console.log('Seeded SQLite Hotels & Rooms.');
        });
      }
    });

    // Seed Prasadam
    sqliteDb.get(`SELECT COUNT(*) as count FROM prasadam`, (err, row) => {
      if (err) return;
      if (row.count === 0) {
        sqliteDb.run(`INSERT INTO prasadam (name, quantity_prepared, quantity_distributed, remaining_quantity) VALUES (?, ?, ?, ?)`, ['Pongal', 1000, 750, 250]);
        sqliteDb.run(`INSERT INTO prasadam (name, quantity_prepared, quantity_distributed, remaining_quantity) VALUES (?, ?, ?, ?)`, ['Laddu', 2000, 1500, 500]);
        sqliteDb.run(`INSERT INTO prasadam (name, quantity_prepared, quantity_distributed, remaining_quantity) VALUES (?, ?, ?, ?)`, ['Puliyodarai', 1500, 1100, 400]);
        console.log('Seeded SQLite Prasadam.');
      }
    });

    // Seed Special Poojas for today
    sqliteDb.get(`SELECT COUNT(*) as count FROM special_pooja`, (err, row) => {
      if (err) return;
      if (row.count === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        sqliteDb.run(`INSERT INTO special_pooja (name, description, date, status) VALUES (?, ?, ?, ?)`, ['Ganapathi Homam', 'Pooja performed for health, wealth and prosperity at morning 5:00 AM.', todayStr, 'active']);
        sqliteDb.run(`INSERT INTO special_pooja (name, description, date, status) VALUES (?, ?, ?, ?)`, ['Lakshmi Pooja', 'Special pooja for blessing of Goddess Lakshmi at evening 6:00 PM.', todayStr, 'active']);
        sqliteDb.run(`INSERT INTO special_pooja (name, description, date, status) VALUES (?, ?, ?, ?)`, ['Abhishekam', 'Deity holy bath pooja at morning 7:30 AM.', todayStr, 'active']);
        sqliteDb.run(`INSERT INTO special_pooja (name, description, date, status) VALUES (?, ?, ?, ?)`, ['Rudra Pooja', 'Lord Shiva pooja at 11:00 AM.', todayStr, 'active']);
        console.log('Seeded SQLite Special Poojas.');
      }
    });

    // Seed Visitors
    sqliteDb.get(`SELECT COUNT(*) as count FROM visitors`, (err, row) => {
      if (err) return;
      if (row.count === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        sqliteDb.run(`INSERT INTO visitors (name, email, mobile, check_in_time, check_out_time, status, date) VALUES (?, ?, ?, datetime('now', '-2 hours'), datetime('now', '-1 hour'), ?, ?)`, ['Rahul Sharma', 'rahul@gmail.com', '9812345678', 'exited', todayStr]);
        sqliteDb.run(`INSERT INTO visitors (name, email, mobile, check_in_time, check_out_time, status, date) VALUES (?, ?, ?, datetime('now', '-90 minutes'), NULL, ?, ?)`, ['Amit Kumar', 'amit@gmail.com', '9822345678', 'inside', todayStr]);
        sqliteDb.run(`INSERT INTO visitors (name, email, mobile, check_in_time, check_out_time, status, date) VALUES (?, ?, ?, datetime('now', '-1 hour'), NULL, ?, ?)`, ['Priya Patel', 'priya@gmail.com', '9832345678', 'inside', todayStr]);
        sqliteDb.run(`INSERT INTO visitors (name, email, mobile, check_in_time, check_out_time, status, date) VALUES (?, ?, ?, datetime('now', '-30 minutes'), NULL, ?, ?)`, ['Sneha Reddy', 'sneha@gmail.com', '9842345678', 'inside', todayStr]);
        sqliteDb.run(`INSERT INTO visitors (name, email, mobile, check_in_time, check_out_time, status, date) VALUES (?, ?, ?, datetime('now', '-4 hours'), datetime('now', '-3 hours'), ?, ?)`, ['Vikram Singh', 'vikram@gmail.com', '9852345678', 'exited', todayStr]);
        console.log('Seeded SQLite Visitors.');
      }
    });
  });
}

// UNIFIED DATA ACCESS METHODS (PROMISE-BASED CRUD)
const db = {
  // Query Helper for SQLite & MySQL
  runQuery(sql, params = []) {
    const currentMode = process.env.DB_MODE || 'local';
    return new Promise(async (resolve, reject) => {
      if (currentMode === 'local') {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else if (currentMode === 'mysql') {
        try {
          const [rows] = await mysqlPool.execute(sql, params);
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error('Supabase client uses direct SDK calls.'));
      }
    });
  },

  runExec(sql, params = []) {
    const currentMode = process.env.DB_MODE || 'local';
    return new Promise(async (resolve, reject) => {
      if (currentMode === 'local') {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      } else if (currentMode === 'mysql') {
        try {
          const [result] = await mysqlPool.execute(sql, params);
          resolve({ id: result.insertId, changes: result.affectedRows });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error('Supabase client uses direct SDK calls.'));
      }
    });
  },

  // 1. User Authentication
  async getUserByEmail(email) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('users').select('*').eq('email', email).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const rows = await this.runQuery(`SELECT * FROM users WHERE email = ?`, [email]);
      return rows[0] || null;
    }
  },

  async getUserById(id) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const rows = await this.runQuery(`SELECT * FROM users WHERE id = ?`, [id]);
      return rows[0] || null;
    }
  },

  async createUser(name, mobile, email, passwordHash, role = 'user') {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('users')
        .insert([{ name, mobile, email, password: passwordHash, role }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const result = await this.runExec(
        `INSERT INTO users (name, mobile, email, password, role) VALUES (?, ?, ?, ?, ?)`,
        [name, mobile, email, passwordHash, role]
      );
      return { id: result.id, name, mobile, email, role };
    }
  },

  async getAllUsers() {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(`SELECT * FROM users ORDER BY created_at DESC`);
    }
  },

  // 2. Slot Booking Management
  async getSlotsByDate(dateStr) {
    const currentMode = process.env.DB_MODE || 'local';
    // Ensure standard slots are initialized for the date
    await this.ensureSlotsExistForDate(dateStr);

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('slots').select('*').eq('date', dateStr).order('slot_time', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(`SELECT * FROM slots WHERE date = ? ORDER BY id ASC`, [dateStr]);
    }
  },

  async getSlotById(id) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('slots').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } else {
      const rows = await this.runQuery(`SELECT * FROM slots WHERE id = ?`, [id]);
      return rows[0] || null;
    }
  },

  async ensureSlotsExistForDate(dateStr) {
    const currentMode = process.env.DB_MODE || 'local';
    const defaultSlots = [
      { time: '10:00 AM – 11:30 AM', capacity: 100 },
      { time: '12:00 PM – 1:30 PM', capacity: 100 },
      { time: '2:00 PM – 3:30 PM', capacity: 150 },
      { time: '4:00 PM – 5:30 PM', capacity: 150 }
    ];

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('slots').select('id').eq('date', dateStr);
      if (error) return;
      if (data.length === 0) {
        const inserts = defaultSlots.map(s => ({
          slot_time: s.time,
          max_capacity: s.capacity,
          current_bookings: 0,
          remaining_slots: s.capacity,
          date: dateStr
        }));
        await supabaseClient.from('slots').insert(inserts);
      }
    } else {
      const rows = await this.runQuery(`SELECT COUNT(*) as count FROM slots WHERE date = ?`, [dateStr]);
      if (rows[0] && rows[0].count === 0) {
        for (const s of defaultSlots) {
          try {
            await this.runExec(
              `INSERT OR IGNORE INTO slots (slot_time, max_capacity, current_bookings, remaining_slots, date) VALUES (?, ?, 0, ?, ?)`,
              [s.time, s.capacity, s.capacity, dateStr]
            );
          } catch (e) {
            // Suppress error if already exists due to race conditions
          }
        }
      }
    }
  },

  async updateSlotBookings(slotId, increment) {
    const currentMode = process.env.DB_MODE || 'local';
    const slot = await this.getSlotById(slotId);
    if (!slot) throw new Error('Slot not found');

    const newBookings = slot.current_bookings + increment;
    const newRemaining = slot.max_capacity - newBookings;

    if (newBookings > slot.max_capacity) {
      throw new Error('Slot has reached maximum capacity.');
    }

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('slots')
        .update({ current_bookings: newBookings, remaining_slots: newRemaining })
        .eq('id', slotId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(
        `UPDATE slots SET current_bookings = ?, remaining_slots = ? WHERE id = ?`,
        [newBookings, newRemaining, slotId]
      );
      return { ...slot, current_bookings: newBookings, remaining_slots: newRemaining };
    }
  },

  // 3. Bookings
  async createBooking(bookingId, userId, dateStr, slotId, hotelId, roomId) {
    const currentMode = process.env.DB_MODE || 'local';

    // 1. Reserve Slot
    await this.updateSlotBookings(slotId, 1);

    // 2. Reserve Hotel Room if selected
    if (hotelId && roomId) {
      await this.updateRoomStatus(roomId, 'occupied');
      await this.updateHotelBookings(hotelId, 1);
    }

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('bookings')
        .insert([{ id: bookingId, user_id: userId, date: dateStr, slot_id: slotId, hotel_id: hotelId || null, room_id: roomId || null, status: 'confirmed' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(
        `INSERT INTO bookings (id, user_id, date, slot_id, hotel_id, room_id, status) VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
        [bookingId, userId, dateStr, slotId, hotelId || null, roomId || null]
      );
      return { id: bookingId, user_id: userId, date: dateStr, slot_id: slotId, hotel_id: hotelId, room_id: roomId, status: 'confirmed' };
    }
  },

  async getBookings(filters = {}) {
    const currentMode = process.env.DB_MODE || 'local';
    let sql = `
      SELECT b.*, u.name as user_name, u.email as user_email, u.mobile as user_mobile, 
             s.slot_time, h.name as hotel_name, r.room_number 
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN slots s ON b.slot_id = s.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.userId) {
      sql += ` AND b.user_id = ?`;
      params.push(filters.userId);
    }
    if (filters.date) {
      sql += ` AND b.date = ?`;
      params.push(filters.date);
    }
    if (filters.slotId) {
      sql += ` AND b.slot_id = ?`;
      params.push(filters.slotId);
    }
    if (filters.hotelId) {
      sql += ` AND b.hotel_id = ?`;
      params.push(filters.hotelId);
    }
    if (filters.search) {
      sql += ` AND (u.name LIKE ? OR b.id LIKE ? OR u.mobile LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ` ORDER BY b.created_at DESC`;

    if (currentMode === 'supabase') {
      // Direct supabase join queries or JS mappings.
      // To simplify Supabase query support in this mockable system, we run standard query logic or query all bookings and filter.
      // For high performance in production, a join is best. Supabase supports this via:
      let query = supabaseClient.from('bookings').select(`
        id, date, status, created_at, user_id, slot_id, hotel_id, room_id,
        users(name, email, mobile),
        slots(slot_time),
        hotels(name),
        rooms(room_number)
      `);
      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.date) query = query.eq('date', filters.date);
      if (filters.slotId) query = query.eq('slot_id', filters.slotId);
      if (filters.hotelId) query = query.eq('hotel_id', filters.hotelId);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      // Map join structure to match SQL output format
      let formatted = data.map(b => ({
        id: b.id,
        user_id: b.user_id,
        date: b.date,
        slot_id: b.slot_id,
        hotel_id: b.hotel_id,
        room_id: b.room_id,
        status: b.status,
        created_at: b.created_at,
        user_name: b.users?.name,
        user_email: b.users?.email,
        user_mobile: b.users?.mobile,
        slot_time: b.slots?.slot_time,
        hotel_name: b.hotels?.name,
        room_number: b.rooms?.room_number
      }));

      if (filters.search) {
        const s = filters.search.toLowerCase();
        formatted = formatted.filter(b => 
          b.user_name?.toLowerCase().includes(s) || 
          b.id?.toLowerCase().includes(s) || 
          b.user_mobile?.includes(s)
        );
      }
      return formatted;
    } else {
      return await this.runQuery(sql, params);
    }
  },

  async getBookingById(bookingId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('bookings').select(`
        id, date, status, created_at, user_id, slot_id, hotel_id, room_id,
        users(name, email, mobile),
        slots(slot_time),
        hotels(name),
        rooms(room_number)
      `).eq('id', bookingId).single();
      if (error) throw error;
      return {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        slot_id: data.slot_id,
        hotel_id: data.hotel_id,
        room_id: data.room_id,
        status: data.status,
        created_at: data.created_at,
        user_name: data.users?.name,
        user_email: data.users?.email,
        user_mobile: data.users?.mobile,
        slot_time: data.slots?.slot_time,
        hotel_name: data.hotels?.name,
        room_number: data.rooms?.room_number
      };
    } else {
      const rows = await this.runQuery(`
        SELECT b.*, u.name as user_name, u.email as user_email, u.mobile as user_mobile, 
               s.slot_time, h.name as hotel_name, r.room_number 
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN slots s ON b.slot_id = s.id
        LEFT JOIN hotels h ON b.hotel_id = h.id
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
      `, [bookingId]);
      return rows[0] || null;
    }
  },

  async cancelBooking(bookingId) {
    const currentMode = process.env.DB_MODE || 'local';
    const booking = await this.getBookingById(bookingId);
    if (!booking || booking.status === 'cancelled') return;

    // 1. Release Slot
    await this.updateSlotBookings(booking.slot_id, -1);

    // 2. Release Hotel Room if booked
    if (booking.hotel_id && booking.room_id) {
      await this.updateRoomStatus(booking.room_id, 'available');
      await this.updateHotelBookings(booking.hotel_id, -1);
    }

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [bookingId]);
      return { ...booking, status: 'cancelled' };
    }
  },

  // 4. Hotels & Rooms
  async getHotels() {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('hotels').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(`SELECT * FROM hotels ORDER BY id ASC`);
    }
  },

  async getHotelById(hotelId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('hotels').select('*').eq('id', hotelId).single();
      if (error) throw error;
      return data;
    } else {
      const rows = await this.runQuery(`SELECT * FROM hotels WHERE id = ?`, [hotelId]);
      return rows[0] || null;
    }
  },

  async updateHotelBookings(hotelId, increment) {
    const currentMode = process.env.DB_MODE || 'local';
    const hotel = await this.getHotelById(hotelId);
    if (!hotel) return;

    const newBooked = hotel.booked_rooms + increment;
    const newAvailable = hotel.total_rooms - newBooked;

    if (currentMode === 'supabase') {
      await supabaseClient.from('hotels').update({ booked_rooms: newBooked, available_rooms: newAvailable }).eq('id', hotelId);
    } else {
      await this.runExec(`UPDATE hotels SET booked_rooms = ?, available_rooms = ? WHERE id = ?`, [newBooked, newAvailable, hotelId]);
    }
  },

  async getRoomsByHotel(hotelId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('rooms').select('*').eq('hotel_id', hotelId).order('room_number', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(`SELECT * FROM rooms WHERE hotel_id = ? ORDER BY room_number ASC`, [hotelId]);
    }
  },

  async getRoomById(roomId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('rooms').select('*').eq('id', roomId).single();
      if (error) throw error;
      return data;
    } else {
      const rows = await this.runQuery(`SELECT * FROM rooms WHERE id = ?`, [roomId]);
      return rows[0] || null;
    }
  },

  async addRoom(hotelId, roomNumber) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('rooms')
        .insert([{ hotel_id: hotelId, room_number: roomNumber, status: 'available' }])
        .select()
        .single();
      if (error) throw error;

      // Update hotel total
      const hotel = await this.getHotelById(hotelId);
      const newTotal = hotel.total_rooms + 1;
      const newAvailable = newTotal - hotel.booked_rooms;
      await supabaseClient.from('hotels').update({ total_rooms: newTotal, available_rooms: newAvailable }).eq('id', hotelId);

      return data;
    } else {
      const result = await this.runExec(
        `INSERT INTO rooms (hotel_id, room_number, status) VALUES (?, ?, 'available')`,
        [hotelId, roomNumber]
      );
      // Update hotel
      const hotel = await this.getHotelById(hotelId);
      const newTotal = hotel.total_rooms + 1;
      const newAvailable = newTotal - hotel.booked_rooms;
      await this.runExec(`UPDATE hotels SET total_rooms = ?, available_rooms = ? WHERE id = ?`, [newTotal, newAvailable, hotelId]);

      return { id: result.id, hotel_id: hotelId, room_number: roomNumber, status: 'available' };
    }
  },

  async updateRoomStatus(roomId, status) {
    const currentMode = process.env.DB_MODE || 'local';
    const room = await this.getRoomById(roomId);
    if (!room || room.status === status) return;

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('rooms').update({ status }).eq('id', roomId).select().single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(`UPDATE rooms SET status = ? WHERE id = ?`, [status, roomId]);
      return { ...room, status };
    }
  },

  // 5. Prasadam Management
  async getPrasadam() {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('prasadam').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(`SELECT * FROM prasadam ORDER BY name ASC`);
    }
  },

  async addPrasadam(name, quantityPrepared) {
    const currentMode = process.env.DB_MODE || 'local';
    const remaining = quantityPrepared;
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('prasadam')
        .insert([{ name, quantity_prepared: quantityPrepared, quantity_distributed: 0, remaining_quantity: remaining }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const result = await this.runExec(
        `INSERT INTO prasadam (name, quantity_prepared, quantity_distributed, remaining_quantity) VALUES (?, ?, 0, ?)`,
        [name, quantityPrepared, remaining]
      );
      return { id: result.id, name, quantity_prepared: quantityPrepared, quantity_distributed: 0, remaining_quantity: remaining };
    }
  },

  async updatePrasadam(id, name, prepared, distributed) {
    const currentMode = process.env.DB_MODE || 'local';
    const remaining = prepared - distributed;
    if (remaining < 0) throw new Error('Distributed quantity cannot exceed prepared quantity.');

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('prasadam')
        .update({ name, quantity_prepared: prepared, quantity_distributed: distributed, remaining_quantity: remaining })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(
        `UPDATE prasadam SET name = ?, quantity_prepared = ?, quantity_distributed = ?, remaining_quantity = ? WHERE id = ?`,
        [name, prepared, distributed, remaining, id]
      );
      return { id, name, quantity_prepared: prepared, quantity_distributed: distributed, remaining_quantity: remaining };
    }
  },

  async deletePrasadam(id) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      await supabaseClient.from('prasadam').delete().eq('id', id);
    } else {
      await this.runExec(`DELETE FROM prasadam WHERE id = ?`, [id]);
    }
    return { success: true };
  },

  // 6. Special Pooja Management
  async getPoojasByDate(dateStr) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient.from('special_pooja').select('*').eq('date', dateStr).order('id', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(`SELECT * FROM special_pooja WHERE date = ? ORDER BY id ASC`, [dateStr]);
    }
  },

  async addPooja(name, description, dateStr) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('special_pooja')
        .insert([{ name, description, date: dateStr, status: 'active' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const result = await this.runExec(
        `INSERT INTO special_pooja (name, description, date, status) VALUES (?, ?, ?, 'active')`,
        [name, description, dateStr]
      );
      return { id: result.id, name, description, date: dateStr, status: 'active' };
    }
  },

  async updatePooja(id, name, description, dateStr, status) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('special_pooja')
        .update({ name, description, date: dateStr, status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(
        `UPDATE special_pooja SET name = ?, description = ?, date = ?, status = ? WHERE id = ?`,
        [name, description, dateStr, status, id]
      );
      return { id, name, description, date: dateStr, status };
    }
  },

  async deletePooja(id) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      await supabaseClient.from('special_pooja').delete().eq('id', id);
    } else {
      await this.runExec(`DELETE FROM special_pooja WHERE id = ?`, [id]);
    }
    return { success: true };
  },

  // 7. Live Crowd Monitoring & Visitors
  async getVisitors(filters = {}) {
    const currentMode = process.env.DB_MODE || 'local';
    let sql = `SELECT * FROM visitors WHERE 1=1`;
    const params = [];

    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }
    if (filters.date) {
      sql += ` AND date = ?`;
      params.push(filters.date);
    }
    if (filters.search) {
      sql += ` AND (name LIKE ? OR mobile LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ` ORDER BY check_in_time DESC`;

    if (currentMode === 'supabase') {
      let query = supabaseClient.from('visitors').select('*');
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.date) query = query.eq('date', filters.date);
      const { data, error } = await query.order('check_in_time', { ascending: false });
      if (error) throw error;

      let filtered = data;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(v => v.name.toLowerCase().includes(s) || v.mobile.includes(s));
      }
      return filtered;
    } else {
      return await this.runQuery(sql, params);
    }
  },

  async getCrowdStatus() {
    const currentMode = process.env.DB_MODE || 'local';
    const todayStr = new Date().toISOString().split('T')[0];

    if (currentMode === 'supabase') {
      const { data: insideData, error: err1 } = await supabaseClient.from('visitors').select('id').eq('status', 'inside');
      const { data: exitedData, error: err2 } = await supabaseClient.from('visitors').select('id').eq('status', 'exited').eq('date', todayStr);
      
      if (err1 || err2) throw err1 || err2;

      const insideCount = insideData.length;
      const exitedCount = exitedData.length;
      const totalCount = insideCount + exitedCount;

      let status = 'Low Crowd';
      let color = 'green';
      if (insideCount > 15) {
        status = 'High Crowd';
        color = 'red';
      } else if (insideCount > 5) {
        status = 'Medium Crowd';
        color = 'orange';
      }

      return { insideCount, exitedCount, totalCount, status, color };
    } else {
      const rowsInside = await this.runQuery(`SELECT COUNT(*) as count FROM visitors WHERE status = 'inside'`);
      const rowsExited = await this.runQuery(`SELECT COUNT(*) as count FROM visitors WHERE status = 'exited' AND date = ?`, [todayStr]);

      const insideCount = rowsInside[0]?.count || 0;
      const exitedCount = rowsExited[0]?.count || 0;
      const totalCount = insideCount + exitedCount;

      let status = 'Low Crowd';
      let color = 'green';
      if (insideCount > 15) {
        status = 'High Crowd';
        color = 'red';
      } else if (insideCount > 5) {
        status = 'Medium Crowd';
        color = 'orange';
      }

      return { insideCount, exitedCount, totalCount, status, color };
    }
  },

  async checkInVisitor(name, email, mobile) {
    const currentMode = process.env.DB_MODE || 'local';
    const todayStr = new Date().toISOString().split('T')[0];

    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('visitors')
        .insert([{ name, email: email || null, mobile, status: 'inside', date: todayStr }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const result = await this.runExec(
        `INSERT INTO visitors (name, email, mobile, check_in_time, status, date) VALUES (?, ?, ?, datetime('now', 'localtime'), 'inside', ?)`,
        [name, email || null, mobile, todayStr]
      );
      return { id: result.id, name, email, mobile, status: 'inside', date: todayStr };
    }
  },

  async checkOutVisitor(visitorId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('visitors')
        .update({ status: 'exited', check_out_time: new Date().toISOString() })
        .eq('id', visitorId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await this.runExec(
        `UPDATE visitors SET status = 'exited', check_out_time = datetime('now', 'localtime') WHERE id = ?`,
        [visitorId]
      );
      return { id: visitorId, status: 'exited' };
    }
  },

  // 8. Notifications
  async getNotifications(userId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return await this.runQuery(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
    }
  },

  async createNotification(userId, message, type) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      const { data, error } = await supabaseClient
        .from('notifications')
        .insert([{ user_id: userId, message, type, status: 'unread' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const result = await this.runExec(
        `INSERT INTO notifications (user_id, message, type, status) VALUES (?, ?, ?, 'unread')`,
        [userId, message, type]
      );
      return { id: result.id, user_id: userId, message, type, status: 'unread' };
    }
  },

  async markNotificationsRead(userId) {
    const currentMode = process.env.DB_MODE || 'local';
    if (currentMode === 'supabase') {
      await supabaseClient.from('notifications').update({ status: 'read' }).eq('user_id', userId);
    } else {
      await this.runExec(`UPDATE notifications SET status = 'read' WHERE user_id = ?`, [userId]);
    }
    return { success: true };
  }
};

module.exports = db;
