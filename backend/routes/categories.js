// backend/routes/categories.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET semua kategori
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kategori');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil kategori' });
    }
});

// POST kategori baru
router.post('/', async (req, res) => {
    const { nama_kategori } = req.body;
    if (!nama_kategori) {
        return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO kategori (nama_kategori) VALUES (?)', [nama_kategori]);
        res.status(201).json({ id: result.insertId, message: 'Kategori berhasil ditambahkan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat menambahkan kategori' });
    }
});

// DELETE kategori (tambahan, jika diperlukan)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM kategori WHERE id_kategori = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
        res.json({ message: 'Kategori berhasil dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat menghapus kategori' });
    }
});

module.exports = router;