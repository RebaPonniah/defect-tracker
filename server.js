require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// GET all tickets (with optional filters)
app.get('/api/tickets', async (req, res) => {
  try {
    const { status, priority, q } = req.query;
    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];
    if (status)   { sql += ' AND status = ?';   params.push(status); }
    if (priority) { sql += ' AND priority = ?'; params.push(priority); }
    if (q) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR assignee LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create ticket
app.post('/api/tickets', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE ticket_counter SET counter = counter + 1 WHERE id = 1');
    const [[row]] = await conn.query('SELECT counter FROM ticket_counter WHERE id = 1');
    const id = `DEF-${String(row.counter).padStart(3, '0')}`;
    const { title, description, priority, status, assignee } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    await conn.query(
      'INSERT INTO tickets (id, title, description, priority, status, assignee) VALUES (?,?,?,?,?,?)',
      [id, title, description || '', priority || 'Medium', status || 'Open', assignee || '']
    );
    await conn.commit();
    const [[ticket]] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    res.status(201).json(ticket);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PATCH update ticket
app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const fields = ['title', 'description', 'priority', 'status', 'assignee'];
    const updates = [], params = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    });
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(req.params.id);
    await pool.query(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);
    const [[ticket]] = await pool.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
