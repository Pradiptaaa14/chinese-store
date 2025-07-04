// frontend/src/pages/TransactionManagement.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Snackbar
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../api/axiosConfig';

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]); // Untuk form transaksi baru
    const [customers, setCustomers] = useState([]); // Untuk form transaksi baru
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openNewTransactionDialog, setOpenNewTransactionDialog] = useState(false);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedTransactionDetails, setSelectedTransactionDetails] = useState([]);
    const [selectedTransactionHeader, setSelectedTransactionHeader] = useState(null); // Untuk info header transaksi
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [newTransactionData, setNewTransactionData] = useState({
        id_pelanggan: '',
        items: []
    });

    useEffect(() => {
        fetchTransactions();
        fetchProductsForTransaction();
        fetchCustomersForTransaction();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/transactions');
            setTransactions(response.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Gagal memuat daftar transaksi.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsForTransaction = async () => {
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products for transaction:', err);
        }
    };

    const fetchCustomersForTransaction = async () => {
        try {
            const response = await apiClient.get('/customers');
            setCustomers(response.data);
        } catch (err) {
            console.error('Error fetching customers for transaction:', err);
        }
    };

    const handleOpenNewTransactionDialog = () => {
        setNewTransactionData({ id_pelanggan: '', items: [{ id_produk: '', jumlah: 1 }] });
        setOpenNewTransactionDialog(true);
        setError(null); // Reset error
    };

    const handleCloseNewTransactionDialog = () => {
        setOpenNewTransactionDialog(false);
        setError(null); // Reset error
    };

    const handleAddItem = () => {
        setNewTransactionData(prev => ({
            ...prev,
            items: [...prev.items, { id_produk: '', jumlah: 1 }]
        }));
    };

    const handleRemoveItem = (index) => {
        setNewTransactionData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newTransactionData.items];
        updatedItems[index][field] = value;
        setNewTransactionData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleNewTransactionSubmit = async () => {
        // Validasi dasar
        if (!newTransactionData.id_pelanggan) {
            setError('Harap pilih pelanggan.');
            return;
        }
        if (newTransactionData.items.length === 0) {
            setError('Transaksi harus memiliki setidaknya satu item.');
            return;
        }
        for (const item of newTransactionData.items) {
            if (!item.id_produk || item.jumlah <= 0) {
                setError('Setiap item harus memiliki produk dan jumlah yang valid.');
                return;
            }
        }

        try {
            await apiClient.post('/transactions', newTransactionData);
            setSnackbarMessage('Transaksi berhasil dibuat!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseNewTransactionDialog();
            fetchTransactions(); // Refresh daftar transaksi
            fetchProductsForTransaction(); // Refresh stok produk
        } catch (err) {
            console.error('Error creating transaction:', err);
            setSnackbarMessage(err.response?.data?.message || 'Gagal membuat transaksi.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setError(err.response?.data?.message || 'Gagal membuat transaksi.');
        }
    };

    const handleOpenDetailDialog = async (transaction) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/transactions/${transaction.id_transaksi}/details`);
            setSelectedTransactionDetails(response.data);
            setSelectedTransactionHeader(transaction); // Simpan header transaksi
            setOpenDetailDialog(true);
        } catch (err) {
            console.error('Error fetching transaction details:', err);
            setError('Gagal memuat detail transaksi.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false);
        setSelectedTransactionDetails([]);
        setSelectedTransactionHeader(null);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Memuat transaksi...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Manajemen Transaksi</Typography>
            <Button
                variant="contained"
                startIcon={<AddShoppingCartIcon />}
                onClick={handleOpenNewTransactionDialog}
                sx={{ mb: 2 }}
            >
                Buat Transaksi Baru
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Transaksi</TableCell>
                            <TableCell>Tanggal</TableCell>
                            <TableCell>Pelanggan</TableCell>
                            <TableCell>Produk (Jumlah x Harga)</TableCell>
                            <TableCell align="right">Total Harga</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id_transaksi}>
                                <TableCell>{transaction.id_transaksi}</TableCell>
                                <TableCell>{new Date(transaction.tanggal_transaksi).toLocaleString()}</TableCell>
                                <TableCell>{transaction.nama_pelanggan}</TableCell>
                                <TableCell>{transaction.produk_detail}</TableCell>
                                <TableCell align="right">Rp {transaction.total_harga.toLocaleString('id-ID')}</TableCell>
                                <TableCell>{transaction.status_transaksi}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="info" onClick={() => handleOpenDetailDialog(transaction)}>
                                        <InfoIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Buat Transaksi Baru */}
            <Dialog open={openNewTransactionDialog} onClose={handleCloseNewTransactionDialog} fullWidth maxWidth="md">
                <DialogTitle>Buat Transaksi Baru</DialogTitle>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="customer-select-label">Pilih Pelanggan</InputLabel>
                        <Select
                            labelId="customer-select-label"
                            value={newTransactionData.id_pelanggan}
                            label="Pilih Pelanggan"
                            onChange={(e) => setNewTransactionData(prev => ({ ...prev, id_pelanggan: e.target.value }))}
                        >
                            {customers.map((customer) => (
                                <MenuItem key={customer.id_pelanggan} value={customer.id_pelanggan}>
                                    {customer.nama_pelanggan} ({customer.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Item Transaksi</Typography>
                    {newTransactionData.items.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel>Produk</InputLabel>
                                <Select
                                    value={item.id_produk}
                                    label="Produk"
                                    onChange={(e) => handleItemChange(index, 'id_produk', e.target.value)}
                                >
                                    {products.map((product) => (
                                        <MenuItem key={product.id_produk} value={product.id_produk}>
                                            {product.nama_produk} (Stok: {product.stok}, Harga: Rp {product.harga.toLocaleString('id-ID')})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Jumlah"
                                type="number"
                                value={item.jumlah}
                                onChange={(e) => handleItemChange(index, 'jumlah', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 1 }}
                                sx={{ width: '120px' }}
                            />
                            <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}>
                        Tambah Item
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewTransactionDialog} color="secondary">Batal</Button>
                    <Button onClick={handleNewTransactionSubmit} variant="contained" color="primary">
                        Buat Transaksi
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Detail Transaksi */}
            <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    Detail Transaksi
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDetailDialog}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedTransactionHeader && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1">ID Transaksi: {selectedTransactionHeader.id_transaksi}</Typography>
                            <Typography variant="subtitle1">Pelanggan: {selectedTransactionHeader.nama_pelanggan}</Typography>
                            <Typography variant="subtitle1">Tanggal: {new Date(selectedTransactionHeader.tanggal_transaksi).toLocaleString()}</Typography>
                            <Typography variant="subtitle1">Status: {selectedTransactionHeader.status_transaksi}</Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>Total: Rp {selectedTransactionHeader.total_harga.toLocaleString('id-ID')}</Typography>
                            <Divider sx={{ my: 1 }} />
                        </Box>
                    )}
                    <Typography variant="h6" gutterBottom>Item-item:</Typography>
                    {selectedTransactionDetails.length > 0 ? (
                        <List>
                            {selectedTransactionDetails.map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`${item.nama_produk} (${item.jumlah} x Rp ${item.harga_satuan.toLocaleString('id-ID')})`}
                                        secondary={`Subtotal: Rp ${(item.jumlah * item.harga_satuan).toLocaleString('id-ID')}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>Tidak ada detail item untuk transaksi ini.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailDialog} variant="contained">Tutup</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TransactionManagement;