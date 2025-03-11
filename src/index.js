import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import App from './App';
import './index.css';

// Create custom theme with your color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4AF37',    // Main Islamic golden
      light: '#E7C877',   // Lighter golden variant
      dark: '#B58E2B',    // Darker golden variant
      contrastText: '#004B23' // Deep Islamic green for contrast
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Create root element
const container = document.getElementById('root');
const root = createRoot(container);

// Render application with all providers
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);