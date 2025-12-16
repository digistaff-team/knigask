require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database configuration
// На VPS создайте файл .env в папке server с содержимым:
// DB_HOST=localhost
// DB_USER=lib_user
// DB_PASSWORD=radostnochitat
// DB_NAME=library_db
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // Не используем дефолтные пароли в коде для GitHub
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    console.error('Make sure you have created a .env file in the server directory with correct credentials.');
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// --- API ROUTES ---

// 1. Get all books (with borrower info)
app.get('/api/books', (req, res) => {
  const sql = `
    SELECT 
      b.id, b.title, b.author, b.cover_type, b.publication_year, 
      b.genre, b.page_count, b.condition_state, b.status, 
      DATE_FORMAT(b.borrowed_date, '%Y-%m-%d') as borrowed_date,
      b.borrower_phone,
      r.first_name, r.last_name 
    FROM books b 
    LEFT JOIN readers r ON b.borrower_phone = r.phone
    ORDER BY b.title ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. Add a new book
app.post('/api/books', (req, res) => {
  const { 
    title, author, coverType, publicationYear, 
    genre, pageCount, conditionState, status 
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Название и автор обязательны' });
  }

  const sql = `
    INSERT INTO books 
    (title, author, cover_type, publication_year, genre, page_count, condition_state, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title, author, coverType, publicationYear, 
    genre, pageCount, conditionState, status
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Книга добавлена успешно', id: result.insertId });
  });
});

// 3. Get all readers
app.get('/api/readers', (req, res) => {
  const sql = `
    SELECT 
      phone, first_name, last_name, 
      DATE_FORMAT(birth_date, "%Y-%m-%d") AS birth_date, 
      DATE_FORMAT(registration_date, "%Y-%m-%d") AS registration_date 
    FROM readers
    ORDER BY last_name ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 4. Register a new reader
app.post('/api/readers', (req, res) => {
  const { phone, firstName, lastName, dob } = req.body;
  
  if (!phone || !firstName || !lastName || !dob) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }

  const sql = 'INSERT INTO readers (phone, first_name, last_name, birth_date) VALUES (?, ?, ?, ?)';
  db.query(sql, [phone, firstName, lastName, dob], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Читатель с таким телефоном уже существует' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Читатель добавлен', id: phone });
  });
});

// 5. Borrow a book
app.post('/api/borrow', (req, res) => {
  const { bookId, phone } = req.body;
  
  if (!bookId || !phone) return res.status(400).json({ error: 'Не указан ID книги или телефон' });

  // Verify reader exists
  db.query('SELECT phone FROM readers WHERE phone = ?', [phone], (err, readers) => {
    if (err) return res.status(500).json({ error: err.message });
    if (readers.length === 0) return res.status(404).json({ error: 'Читатель не найден. Сначала зарегистрируйте его.' });

    const sql = `
      UPDATE books 
      SET status = 'на руках', borrower_phone = ?, borrowed_date = CURDATE() 
      WHERE id = ? AND status = 'свободна'
    `;
    
    db.query(sql, [phone, bookId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(400).json({ error: 'Книга не доступна (уже на руках) или не найдена.' });
      res.json({ message: 'Книга выдана успешно' });
    });
  });
});

// 6. Return a book
app.post('/api/return', (req, res) => {
  const { bookId } = req.body;
  const sql = `
    UPDATE books 
    SET status = 'свободна', borrower_phone = NULL, borrowed_date = NULL 
    WHERE id = ?
  `;
  db.query(sql, [bookId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Книга возвращена' });
  });
});

// 7. Delete a book
app.delete('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  const sql = 'DELETE FROM books WHERE id = ?';
  
  db.query(sql, [bookId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Книга не найдена' });
    res.json({ message: 'Книга удалена' });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});