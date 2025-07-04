// frontend/src/pages/ProductMaster.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../api/axiosConfig';

const ProductMaster = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        id_produk: null,
        nama_produk: '',
        deskripsi: '',
        harga: '',
        stok: '',
        id_kategori: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Gagal memuat daftar produk.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleOpenAddDialog = () => {
        setIsEditing(false);
        setCurrentProduct({
            id_produk: null,
            nama_produk: '',
            deskripsi: '',
            harga: '',
            stok: '',
            id_kategori: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (product) => {
        setIsEditing(true);
        setCurrentProduct({
            ...product,
            id_kategori: product.id_kategori || '', // Pastikan id_kategori ada
            harga: product.harga.toString(), // Ubah ke string untuk TextField
            stok: product.stok.toString() // Ubah ke string untuk TextField
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError(null); // Reset error saat dialog ditutup
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            // Validasi sederhana
            if (!currentProduct.nama_produk || !currentProduct.harga || !currentProduct.stok || !currentProduct.id_kategori) {
                setError('Mohon lengkapi semua bidang yang wajib.');
                return;
            }
            if (isNaN(currentProduct.harga) || parseFloat(currentProduct.harga) <= 0) {
                setError('Harga harus angka positif.');
                return;
            }
            if (isNaN(currentProduct.stok) || parseInt(currentProduct.stok) < 0) {
                setError('Stok harus angka non-negatif.');
                return;
            }

            const productToSave = {
                ...currentProduct,
                harga: parseFloat(currentProduct.harga),
                stok: parseInt(currentProduct.stok)
            };

            if (isEditing) {
                await apiClient.put(`/products/${currentProduct.id_produk}`, productToSave);
                alert('Produk berhasil diperbarui!');
            } else {
                await apiClient.post('/products', productToSave);
                alert('Produk berhasil ditambahkan!');
            }
            handleCloseDialog();
            fetchProducts(); // Refresh daftar produk
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan produk.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            try {
                await apiClient.delete(`/products/${id}`);
                alert('Produk berhasil dihapus!');
                fetchProducts(); // Refresh daftar produk
            } catch (err) {
                console.error('Error deleting product:', err);
                setError(err.response?.data?.message || 'Gagal menghapus produk.');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Memuat produk...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Manajemen Produk</Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mb: 2 }}
            >
                Tambah Produk Baru
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nama Produk</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell align="right">Harga</TableCell>
                            <TableCell align="right">Stok</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id_produk}>
                                <TableCell>{product.id_produk}</TableCell>
                                <TableCell>{product.nama_produk}</TableCell>
                                <TableCell>{product.nama_kategori}</TableCell>
                                <TableCell align="right">Rp {product.harga.toLocaleString('id-ID')}</TableCell>
                                <TableCell align="right">{product.stok}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpenEditDialog(product)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(product.id_produk)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Tambah/Edit Produk */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nama_produk"
                        label="Nama Produk"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentProduct.nama_produk}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="deskripsi"
                        label="Deskripsi"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={currentProduct.deskripsi}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="harga"
                        label="Harga"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentProduct.harga}
                        onChange={handleChange}
                        inputProps={{ step: "0.01" }} // Untuk harga desimal
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="stok"
                        label="Stok"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentProduct.stok}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel>Kategori</InputLabel>
                        <Select
                            name="id_kategori"
                            value={currentProduct.id_kategori}
                            label="Kategori"
                            onChange={handleChange}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id_kategori} value={cat.id_kategori}>
                                    {cat.nama_kategori}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Batal</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductMaster;