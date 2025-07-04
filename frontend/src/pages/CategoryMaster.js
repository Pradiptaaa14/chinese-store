// frontend/src/pages/CategoryMaster.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api/axiosConfig';

const CategoryMaster = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id_kategori: null, nama_kategori: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Gagal memuat daftar kategori.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddDialog = () => {
        setIsEditing(false);
        setCurrentCategory({ id_kategori: null, nama_kategori: '' });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError(null);
    };

    const handleChange = (e) => {
        setCurrentCategory(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        try {
            if (!currentCategory.nama_kategori.trim()) {
                setError('Nama kategori tidak boleh kosong.');
                return;
            }
            if (isEditing) {
                // Anda perlu menambahkan route PUT di backend untuk kategori jika ingin mengedit
                // Saat ini backend categories.js hanya ada GET dan POST
                // await apiClient.put(`/categories/${currentCategory.id_kategori}`, currentCategory);
                alert('Fungsi edit kategori belum diimplementasikan di backend!');
            } else {
                await apiClient.post('/categories', currentCategory);
                alert('Kategori berhasil ditambahkan!');
            }
            handleCloseDialog();
            fetchCategories();
        } catch (err) {
            console.error('Error saving category:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan kategori.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            try {
                await apiClient.delete(`/categories/${id}`);
                alert('Kategori berhasil dihapus!');
                fetchCategories();
            } catch (err) {
                console.error('Error deleting category:', err);
                setError(err.response?.data?.message || 'Gagal menghapus kategori.');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Memuat kategori...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Manajemen Kategori</Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mb: 2 }}
            >
                Tambah Kategori Baru
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nama Kategori</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id_kategori}>
                                <TableCell>{category.id_kategori}</TableCell>
                                <TableCell>{category.nama_kategori}</TableCell>
                                <TableCell align="center">
                                    {/* Tidak ada edit di backend categories.js, jadi ini dinonaktifkan */}
                                    <IconButton color="primary" onClick={() => handleOpenEditDialog(category)} disabled>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(category.id_kategori)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nama_kategori"
                        label="Nama Kategori"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentCategory.nama_kategori}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Batal</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Kategori'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryMaster;