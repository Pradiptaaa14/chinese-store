// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST transaksi baru (proses checkout) - Implementasi Proses Bisnis Utama
router.post('/', async (req, res) => {
    const { id_pelanggan, items } = req.body; // items: [{ id_produk, jumlah }]

    if (!id_pelanggan || !items || items.length === 0) {
        return res.status(400).json({ message: 'Data transaksi tidak lengkap. Harap sertakan id_pelanggan dan setidaknya satu item.' });
    }

    const connection = await pool.getConnection(); // Dapatkan koneksi dari pool
    try {
        await connection.beginTransaction(); // Mulai transaksi database

        let total_harga = 0;
        const productUpdates = [];

        // 1. Validasi Stok dan Hitung Total Harga untuk setiap item
        for (const item of items) {
            if (item.jumlah <= 0) {
                throw new Error(`Jumlah produk dengan ID ${item.id_produk} harus lebih dari 0.`);
            }
            const [productRows] = await connection.query('SELECT harga, stok, nama_produk FROM produk WHERE id_produk = ? FOR UPDATE', [item.id_produk]);
            if (productRows.length === 0) {
                throw new Error(`Produk dengan ID ${item.id_produk} tidak ditemukan.`);
            }
            const product = productRows[0];
            if (product.stok < item.jumlah) {
                throw new Error(`Stok produk "${product.nama_produk}" tidak cukup. Tersedia: ${product.stok}, Dibutuhkan: ${item.jumlah}`);
            }
            total_harga += product.harga * item.jumlah;
            productUpdates.push({ id_produk: item.id_produk, newStok: product.stok - item.jumlah });
        }

        // 2. Buat Entri Transaksi (Header)
        const [transaksiResult] = await connection.query(
            'INSERT INTO transaksi (id_pelanggan, total_harga, status_transaksi) VALUES (?, ?, ?)',
            [id_pelanggan, total_harga, 'Selesai'] // Atau 'Pending' jika ada proses pembayaran terpisah
        );
        const id_transaksi = transaksiResult.insertId;

        // 3. Masukkan Detail Transaksi dan Kurangi Stok Produk
        for (const item of items) {
            const [productInfo] = await connection.query('SELECT harga FROM produk WHERE id_produk = ?', [item.id_produk]);
            await connection.query(
                'INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, harga_satuan) VALUES (?, ?, ?, ?)',
                [id_transaksi, item.id_produk, item.jumlah, productInfo[0].harga]
            );
            // Kurangi stok di tabel produk
            await connection.query('UPDATE produk SET stok = stok - ? WHERE id_produk = ?', [item.jumlah, item.id_produk]);
        }

        await connection.commit(); // Konfirmasi semua perubahan jika berhasil
        res.status(201).json({ message: 'Transaksi berhasil dibuat', id_transaksi });

    } catch (err) {
        await connection.rollback(); // Batalkan semua perubahan jika ada error
        console.error('Error saat membuat transaksi:', err.message);
        res.status(500).json({ message: 'Gagal membuat transaksi: ' + err.message });
    } finally {
        connection.release(); // Lepaskan koneksi kembali ke pool
    }
});

// GET semua transaksi dengan detail yang digabung (untuk tampilan riwayat)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT
                t.id_transaksi,
                t.tanggal_transaksi,
                t.total_harga,
                t.status_transaksi,
                p.nama_pelanggan,
                GROUP_CONCAT(CONCAT(prod.nama_produk, ' (', dt.jumlah, 'x Rp', FORMAT(dt.harga_satuan, 0), ')') SEPARATOR '; ') AS produk_detail
            FROM
                transaksi t
            JOIN
                pelanggan p ON t.id_pelanggan = p.id_pelanggan
            JOIN
                detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
            JOIN
                produk prod ON dt.id_produk = prod.id_produk
            GROUP BY
                t.id_transaksi
            ORDER BY
                t.tanggal_transaksi DESC;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil daftar transaksi' });
    }
});

// GET detail transaksi berdasarkan ID (untuk riwayat transaksi yang lebih detail)
router.get('/:id/details', async (req, res) => {
    try {
        const query = `
            SELECT
                dt.id_detail_transaksi,
                prod.nama_produk,
                prod.deskripsi,
                dt.jumlah,
                dt.harga_satuan,
                (dt.jumlah * dt.harga_satuan) AS subtotal
            FROM
                detail_transaksi dt
            JOIN
                produk prod ON dt.id_produk = prod.id_produk
            WHERE
                dt.id_transaksi = ?;
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil detail transaksi' });
    }
});

module.exports = router;