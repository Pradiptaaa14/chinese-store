// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductMaster from './pages/ProductMaster';
import TransactionManagement from './pages/TransactionManagement';
import ReportPage from './pages/ReportPage';
import CategoryMaster from './pages/CategoryMaster';
import CustomerMaster from './pages/CustomerMaster'; // <--- PASTIKAN INI TIDAK DIKOMENTARI

function App() {
    return (
        <Router>
            <Layout> {/* Layout membungkus semua halaman yang memiliki sidebar */}
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<ProductMaster />} />
                    <Route path="/categories" element={<CategoryMaster />} />
                    <Route path="/customers" element={<CustomerMaster />} /> {/* <--- PASTIKAN INI TIDAK DIKOMENTARI */}
                    <Route path="/transactions" element={<TransactionManagement />} />
                    <Route path="/reports" element={<ReportPage />} />
                    {/* Tambahkan route lain sesuai kebutuhan */}
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;