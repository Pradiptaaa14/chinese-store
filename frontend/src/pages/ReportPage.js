// frontend/src/pages/ReportPage.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import apiClient from '../api/axiosConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const ReportPage = () => {
    const [monthlySalesData, setMonthlySalesData] = useState(null);
    const [salesByCategoryData, setSalesByCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [monthlySalesRes, salesByCategoryRes] = await Promise.all([
                    apiClient.get('/reports/monthly-sales'),
                    apiClient.get('/reports/sales-by-category'),
                ]);

                const monthlyLabels = monthlySalesRes.data.map(item => item.bulan);
                const monthlyRevenues = monthlySalesRes.data.map(item => item.total_pendapatan);
                setMonthlySalesData({
                    labels: monthlyLabels,
                    datasets: [{
                        label: 'Pendapatan Bulanan',
                        data: monthlyRevenues,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.4,
                    }],
                });

                const categoryLabels = salesByCategoryRes.data.map(item => item.nama_kategori);
                const categorySales = salesByCategoryRes.data.map(item => item.total_penjualan);
                setSalesByCategoryData({
                    labels: categoryLabels,
                    datasets: [{
                        data: categorySales,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(199, 199, 199, 0.6)',
                            'rgba(83, 102, 255, 0.6)',
                        ],
                        borderWidth: 1,
                    }],
                });

            } catch (err) {
                console.error('Error fetching report data:', err);
                setError('Gagal memuat data laporan.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Memuat laporan...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Laporan Penjualan</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Pendapatan Bulanan</Typography>
                        {monthlySalesData ? (
                            <Line data={monthlySalesData} options={{ responsive: true, plugins: { legend: { position: 'top' }} }} />
                        ) : (
                            <Typography>Data penjualan bulanan tidak tersedia.</Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Distribusi Penjualan per Kategori</Typography>
                        {salesByCategoryData ? (
                            <Pie data={salesByCategoryData} options={{ responsive: true, plugins: { legend: { position: 'top' }} }} />
                        ) : (
                            <Typography>Data penjualan per kategori tidak tersedia.</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReportPage;