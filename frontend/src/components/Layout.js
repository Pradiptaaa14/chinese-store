// frontend/src/components/Layout.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    styled,
    createTheme,
    ThemeProvider,
    alpha
} from '@mui/material/styles';
import {
    Box,
    Drawer as MuiDrawer,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    Inventory2 as InventoryIcon,
    Category as CategoryIcon,
    People as PeopleIcon,
    ShoppingCart as ShoppingCartIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';

const drawerWidth = 250;

// Create a custom, serene theme
const sereneTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3f51b5', // A pleasant indigo
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: '#f4f6f8', // Soft gray background
            paper: '#ffffff',   // Pure white for cards
        },
        text: {
            primary: '#263238', // Dark gray for text
            secondary: '#546e7a',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        // DIUBAH: Mengurangi tingkat kelengkungan
        borderRadius: 8, 
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'static',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            borderRight: 'none',
            overflowX: 'hidden',
            height: 'calc(100vh - 32px)', 
            borderRadius: theme.shape.borderRadius,
            ...(!open && {
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const Layout = ({ children }) => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Produk', icon: <InventoryIcon />, path: '/products' },
        { text: 'Kategori', icon: <CategoryIcon />, path: '/categories' },
        { text: 'Pelanggan', icon: <PeopleIcon />, path: '/customers' },
        { text: 'Transaksi', icon: <ShoppingCartIcon />, path: '/transactions' },
        { text: 'Laporan', icon: <AssessmentIcon />, path: '/reports' },
    ];

    return (
        <ThemeProvider theme={sereneTheme}>
            <Box sx={{ display: 'flex', bgcolor: 'background.default', p: 2 }}>
                <CssBaseline />
                
                <Drawer variant="permanent" open={open}>
                    <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
                        {open && (
                             <Typography component="h1" variant="h6" color="primary" noWrap>
                                App Penjualan
                            </Typography>
                        )}
                        <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
                           {open ? <ChevronLeftIcon /> : <MenuIcon />}
                        </IconButton>
                    </Toolbar>

                    <Divider sx={{ my: 1 }} />
                    <List component="nav">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <ListItem key={item.text} disablePadding sx={{ display: 'block', px: 1.5, my: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            justifyContent: open ? 'initial' : 'center',
                                            borderRadius: '8px',
                                            ...(isActive && {
                                                backgroundColor: alpha(sereneTheme.palette.primary.main, 0.08),
                                                color: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: alpha(sereneTheme.palette.primary.main, 0.12),
                                                }
                                            }),
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: open ? 2 : 'auto',
                                                justifyContent: 'center',
                                                color: isActive ? 'primary.main' : 'text.secondary',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: isActive ? '600' : '400'
                                            }}
                                            sx={{
                                                opacity: open ? 1 : 0,
                                                color: 'inherit',
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Drawer>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        height: 'calc(100vh - 32px)',
                        overflow: 'auto',
                        backgroundColor: 'background.paper',
                        borderRadius: sereneTheme.shape.borderRadius,
                        boxShadow: '0px 8px 24px rgba(0,0,0,0.05)',
                        ml: 2,
                        p: 3, 
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;