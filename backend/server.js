// backend/server.js
const express = require('express');
const cors = require('cors'); // Untuk mengizinkan frontend mengakses backend
require('dotenv').config(); // Untuk membaca variabel lingkungan

const app = express();
const PORT = process.env.PORT || 5000; // Menggunakan port dari .env atau 5000

// Middleware
app.use(cors()); // Mengizinkan semua origin (untuk development)
app.use(express.json()); // Mengizinkan Express untuk membaca JSON dari body request

// Import Routes (akan dibuat nanti)
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const customerRoutes = require('./routes/customers');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');
// const authRoutes = require('./routes/auth'); // Jika ingin menambahkan otentikasi

// Gunakan Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
// app.use('/api/auth', authRoutes);

// Route default
app.get('/', (req, res) => {
    res.send('API Penjualan Berjalan!');
});

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server Express berjalan di http://localhost:${PORT}`);
});