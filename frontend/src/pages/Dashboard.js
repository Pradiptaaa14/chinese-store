// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Avatar } from '@mui/material';
import {
    Category as CategoryIcon,
    ShoppingCart as ShoppingCartIcon,
    MonetizationOn as MonetizationOnIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import apiClient from '../api/axiosConfig';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [summary, setSummary] = useState({
        totalProducts: 0,
        todayTransactions: 0,
        monthlyRevenue: 0,
        lowStock: 0,
    });
    const [monthlySalesData, setMonthlySalesData] = useState(null);
    const [salesByCategoryData, setSalesByCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [summaryRes, monthlySalesRes, salesByCategoryRes] = await Promise.all([
                    apiClient.get('/reports/summary'),
                    apiClient.get('/reports/monthly-sales'),
                    apiClient.get('/reports/sales-by-category'),
                ]);

                setSummary(summaryRes.data);

                // Process monthly sales data for a Bar chart
                const monthlyLabels = monthlySalesRes.data.map(item => {
                    const [year, month] = item.bulan.split('-');
                    const date = new Date(year, month - 1);
                    return date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
                });
                const monthlyRevenues = monthlySalesRes.data.map(item => item.total_pendapatan);
                setMonthlySalesData({
                    labels: monthlyLabels,
                    datasets: [{
                        label: 'Pendapatan Bulanan',
                        data: monthlyRevenues,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                        hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                    }],
                });

                // Process sales by category data for a Doughnut chart
                const categoryLabels = salesByCategoryRes.data.map(item => item.nama_kategori);
                const categorySales = salesByCategoryRes.data.map(item => item.total_penjualan);
                const backgroundColors = [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#8D6E63', '#4DD0E1', '#F06292', '#7C4DFF', '#66BB6A', '#FFA726'
                ];
                setSalesByCategoryData({
                    labels: categoryLabels,
                    datasets: [{
                        data: categorySales,
                        backgroundColor: backgroundColors.slice(0, categoryLabels.length),
                        borderWidth: 1,
                        hoverOffset: 8,
                    }],
                });

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Gagal memuat data dashboard. Pastikan server backend berjalan dan API endpoint benar.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>Memuat data dashboard...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3, borderRadius: 2, boxShadow: 3 }}>{error}</Alert>;
    }

    const StatCard = ({ icon, title, value, color, unit }) => (
        <Paper
            elevation={4}
            sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                height: 120,
                borderRadius: 3,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 8,
                },
            }}
        >
            <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56, mr: 2 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: '600' }}>
                    {unit === 'Rp' ? formatRupiah(value) : value}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Dashboard Analitik Penjualan
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<CategoryIcon />} title="Total Produk" value={summary.totalProducts} color="primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<ShoppingCartIcon />} title="Transaksi Hari Ini" value={summary.todayTransactions} color="success" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<MonetizationOnIcon />} title="Pendapatan Bulan Ini" value={summary.monthlyRevenue} color="secondary" unit="Rp" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<WarningIcon />} title="Stok Menipis" value={summary.lowStock} color="error" />
                </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} lg={7}>
                    <Paper elevation={4} sx={{ p: 2, height: 450, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>Grafik Pendapatan Bulanan</Typography>
                        {monthlySalesData && monthlySalesData.labels.length > 0 ? (
                            <Bar
                                data={monthlySalesData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => `${context.dataset.label}: ${formatRupiah(context.raw)}`
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => `${formatRupiah(value).replace('Rp', 'Rp ')}`
                                            }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                                <Typography color="text.secondary">Data penjualan bulanan tidak tersedia.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Paper elevation={4} sx={{ p: 2, height: 450, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>Distribusi Penjualan per Kategori</Typography>
                        {salesByCategoryData && salesByCategoryData.labels.length > 0 ? (
                            <Doughnut
                                data={salesByCategoryData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom' },
                                    },
                                    cutout: '60%',
                                }}
                            />
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                                <Typography color="text.secondary">Data penjualan per kategori tidak tersedia.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;