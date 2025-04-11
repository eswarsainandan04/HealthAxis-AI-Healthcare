const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'health'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Endpoint to fetch the first 10 rows (Default Data)
app.get('/defaultRows', (req, res) => {
    const sql = 'SELECT * FROM medicine LIMIT 500';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// Endpoint to handle search queries
app.post('/search', (req, res) => {
    const { column, query } = req.body;

    if (!column || !query) {
        return res.status(400).json({ error: 'Column and query are required' });
    }

    const sql = `SELECT * FROM medicine WHERE ?? LIKE ?`;
    db.query(sql, [column, `%${query}%`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
