// backend/routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Perhatikan path ke db.js

// GET semua produk
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT p.*, k.nama_kategori FROM produk p JOIN kategori k ON p.id_kategori = k.id_kategori');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil produk' });
    }
});

// GET produk berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM produk WHERE id_produk = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil produk berdasarkan ID' });
    }
});

// POST produk baru
router.post('/', async (req, res) => {
    const { nama_produk, deskripsi, harga, stok, id_kategori } = req.body;
    if (!nama_produk || !harga || !stok || !id_kategori) {
        return res.status(400).json({ message: 'Harap lengkapi semua bidang yang wajib (nama, harga, stok, kategori).' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO produk (nama_produk, deskripsi, harga, stok, id_kategori) VALUES (?, ?, ?, ?, ?)',
            [nama_produk, deskripsi, harga, stok, id_kategori]
        );
        res.status(201).json({ id: result.insertId, message: 'Produk berhasil ditambahkan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat menambahkan produk' });
    }
});

// PUT/UPDATE produk
router.put('/:id', async (req, res) => {
    const { nama_produk, deskripsi, harga, stok, id_kategori } = req.body;
    if (!nama_produk || !harga || !stok || !id_kategori) {
        return res.status(400).json({ message: 'Harap lengkapi semua bidang yang wajib.' });
    }
    try {
        const [result] = await pool.query(
            'UPDATE produk SET nama_produk = ?, deskripsi = ?, harga = ?, stok = ?, id_kategori = ? WHERE id_produk = ?',
            [nama_produk, deskripsi, harga, stok, id_kategori, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.json({ message: 'Produk berhasil diperbarui' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat memperbarui produk' });
    }
});

// DELETE produk
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM produk WHERE id_produk = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat menghapus produk' });
    }
});

module.exports = router;