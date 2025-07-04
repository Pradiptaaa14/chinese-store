// frontend/src/pages/CustomerMaster.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api/axiosConfig';

const CustomerMaster = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({
        id_pelanggan: null,
        nama_pelanggan: '',
        email: '',
        alamat: '',
        telepon: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/customers');
            setCustomers(response.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Gagal memuat daftar pelanggan.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddDialog = () => {
        setIsEditing(false);
        setCurrentCustomer({
            id_pelanggan: null,
            nama_pelanggan: '',
            email: '',
            alamat: '',
            telepon: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (customer) => {
        setIsEditing(true);
        setCurrentCustomer(customer);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError(null); // Reset error saat dialog ditutup
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            // Validasi sederhana
            if (!currentCustomer.nama_pelanggan.trim()) {
                setError('Nama pelanggan wajib diisi.');
                return;
            }
            // Anda bisa menambahkan validasi email/telepon di sini jika diperlukan

            if (isEditing) {
                await apiClient.put(`/customers/${currentCustomer.id_pelanggan}`, currentCustomer);
                alert('Pelanggan berhasil diperbarui!');
            } else {
                await apiClient.post('/customers', currentCustomer);
                alert('Pelanggan berhasil ditambahkan!');
            }
            handleCloseDialog();
            fetchCustomers(); // Refresh daftar pelanggan
        } catch (err) {
            console.error('Error saving customer:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan pelanggan.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
            try {
                // Catatan: Saat ini, backend belum memiliki route DELETE untuk pelanggan.
                // Anda perlu menambahkannya di backend/routes/customers.js
                // Jika Anda mencoba ini tanpa route DELETE di backend, akan ada error.
                // Contoh penambahan di backend: router.delete('/:id', async (req, res) => { ... });
                // Untuk saat ini, kita akan membuat alert untuk mengingatkan.
                // await apiClient.delete(`/customers/${id}`);
                alert('Fungsi hapus pelanggan belum diimplementasikan di backend. Silakan tambahkan route DELETE di backend/routes/customers.js.');
                // fetchCustomers(); // Uncomment ini jika sudah ada route DELETE di backend
            } catch (err) {
                console.error('Error deleting customer:', err);
                setError(err.response?.data?.message || 'Gagal menghapus pelanggan.');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Memuat pelanggan...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Manajemen Pelanggan</Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mb: 2 }}
            >
                Tambah Pelanggan Baru
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nama Pelanggan</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Alamat</TableCell>
                            <TableCell>Telepon</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id_pelanggan}>
                                <TableCell>{customer.id_pelanggan}</TableCell>
                                <TableCell>{customer.nama_pelanggan}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.alamat}</TableCell>
                                <TableCell>{customer.telepon}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpenEditDialog(customer)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(customer.id_pelanggan)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Tambah/Edit Pelanggan */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nama_pelanggan"
                        label="Nama Pelanggan"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentCustomer.nama_pelanggan}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={currentCustomer.email}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="alamat"
                        label="Alamat"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={currentCustomer.alamat}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="telepon"
                        label="Telepon"
                        type="tel"
                        fullWidth
                        variant="outlined"
                        value={currentCustomer.telepon}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Batal</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CustomerMaster;