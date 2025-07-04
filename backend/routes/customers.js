// backend/routes/customers.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET semua pelanggan
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pelanggan');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil pelanggan' });
    }
});

// POST pelanggan baru
router.post('/', async (req, res) => {
    const { nama_pelanggan, email, alamat, telepon } = req.body;
    if (!nama_pelanggan) {
        return res.status(400).json({ message: 'Nama pelanggan wajib diisi.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO pelanggan (nama_pelanggan, email, alamat, telepon) VALUES (?, ?, ?, ?)',
            [nama_pelanggan, email, alamat, telepon]
        );
        res.status(201).json({ id: result.insertId, message: 'Pelanggan berhasil ditambahkan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat menambahkan pelanggan' });
    }
});

// PUT/UPDATE pelanggan
router.put('/:id', async (req, res) => {
    const { nama_pelanggan, email, alamat, telepon } = req.body;
    if (!nama_pelanggan) {
        return res.status(400).json({ message: 'Nama pelanggan wajib diisi.' });
    }
    try {
        const [result] = await pool.query(
            'UPDATE pelanggan SET nama_pelanggan = ?, email = ?, alamat = ?, telepon = ? WHERE id_pelanggan = ?',
            [nama_pelanggan, email, alamat, telepon, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
        }
        res.json({ message: 'Pelanggan berhasil diperbarui' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat memperbarui pelanggan' });
    }
});

module.exports = router;