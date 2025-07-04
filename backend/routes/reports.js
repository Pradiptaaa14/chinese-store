// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Laporan Penjualan Bulanan (untuk chart Line)
router.get('/monthly-sales', async (req, res) => {
    try {
        const query = `
            SELECT
                DATE_FORMAT(tanggal_transaksi, '%Y-%m') AS bulan,
                SUM(total_harga) AS total_pendapatan
            FROM
                transaksi
            WHERE
                status_transaksi = 'Selesai'
            GROUP BY
                bulan
            ORDER BY
                bulan ASC;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil laporan penjualan bulanan' });
    }
});

// Laporan Penjualan per Kategori (untuk chart Pie)
router.get('/sales-by-category', async (req, res) => {
    try {
        const query = `
            SELECT
                k.nama_kategori,
                SUM(dt.jumlah * dt.harga_satuan) AS total_penjualan
            FROM
                detail_transaksi dt
            JOIN
                produk p ON dt.id_produk = p.id_produk
            JOIN
                kategori k ON p.id_kategori = k.id_kategori
            JOIN
                transaksi t ON dt.id_transaksi = t.id_transaksi
            WHERE
                t.status_transaksi = 'Selesai'
            GROUP BY
                k.nama_kategori
            ORDER BY
                total_penjualan DESC;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil laporan penjualan per kategori' });
    }
});

// API untuk data summary Dashboard
router.get('/summary', async (req, res) => {
    try {
        // Total Produk
        const [totalProductsResult] = await pool.query('SELECT COUNT(*) AS count FROM produk');
        const totalProducts = totalProductsResult[0].count;

        // Transaksi Hari Ini
        const [todayTransactionsResult] = await pool.query(
            "SELECT COUNT(*) AS count FROM transaksi WHERE DATE(tanggal_transaksi) = CURDATE() AND status_transaksi = 'Selesai'"
        );
        const todayTransactions = todayTransactionsResult[0].count;

        // Pendapatan Bulan Ini
        const [monthlyRevenueResult] = await pool.query(
            "SELECT SUM(total_harga) AS total FROM transaksi WHERE DATE_FORMAT(tanggal_transaksi, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') AND status_transaksi = 'Selesai'"
        );
        const monthlyRevenue = monthlyRevenueResult[0].total || 0;

        // Stok Menipis (misal: stok < 5)
        const [lowStockResult] = await pool.query('SELECT COUNT(*) AS count FROM produk WHERE stok < 5');
        const lowStock = lowStockResult[0].count;

        res.json({
            totalProducts,
            todayTransactions,
            monthlyRevenue,
            lowStock
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat mengambil data ringkasan dashboard' });
    }
});

module.exports = router;