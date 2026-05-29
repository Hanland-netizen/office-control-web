import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#F5F5F7', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280', disabled: '#D1D5DB' },
    divider: '#E5E7EB',
    primary: { main: '#4F46E5' },
    error: { main: '#B91C1C' },
    success: { main: '#15803D' },
    warning: { main: '#B45309' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, sans-serif',
    allVariants: { letterSpacing: 0 },
    h4: { fontWeight: 500, fontSize: '20px' },
    h5: { fontWeight: 500, fontSize: '17px' },
    h6: { fontWeight: 500, fontSize: '14px' },
    body1: { fontSize: '14px', fontWeight: 400 },
    body2: { fontSize: '13px', fontWeight: 400 },
    caption: { fontSize: '12px', fontWeight: 400 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: 'none',
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '7px',
          fontSize: '13px',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: '#FFFFFF', boxShadow: 'none', backgroundImage: 'none' } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#E5E7EB' } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { '& .MuiTableCell-root': { fontWeight: 500, fontSize: '12px', color: '#6B7280', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F5F5F7' } },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottom: '1px solid #E5E7EB', fontSize: '13px' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, fontSize: '12px' } },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0D1117', paper: '#161B22' },
    text: { primary: '#E6EDF3', secondary: '#7D8590', disabled: '#30363D' },
    divider: '#21262D',
    primary: { main: '#4F46E5' },
    error: { main: '#DA3633' },
    success: { main: '#238636' },
    warning: { main: '#9E6A03' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, sans-serif',
    allVariants: { letterSpacing: 0 },
    h4: { fontWeight: 500, fontSize: '20px' },
    h5: { fontWeight: 500, fontSize: '17px' },
    h6: { fontWeight: 500, fontSize: '14px' },
    body1: { fontSize: '14px', fontWeight: 400 },
    body2: { fontSize: '13px', fontWeight: 400 },
    caption: { fontSize: '12px', fontWeight: 400 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#161B22',
          borderBottom: '1px solid #21262D',
          boxShadow: 'none',
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #21262D',
          borderRadius: '10px',
          boxShadow: 'none',
          backgroundColor: '#161B22',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '7px',
          fontSize: '13px',
          boxShadow: 'none',
         },
       },
     },
     MuiPaper: {
       styleOverrides: { root: { backgroundColor: '#161B22', boxShadow: 'none', backgroundImage: 'none' } },
     },
     MuiDivider: {
       styleOverrides: { root: { borderColor: '#21262D' } },
     },
     MuiTableHead: {
       styleOverrides: {
         root: { '& .MuiTableCell-root': { fontWeight: 500, fontSize: '12px', color: '#7D8590', borderBottom: '1px solid #21262D', backgroundColor: '#0D1117' } },
       },
     },
     MuiTableCell: {
       styleOverrides: { root: { borderBottom: '1px solid #21262D', fontSize: '13px' } },
     },
     MuiChip: {
       styleOverrides: { root: { fontWeight: 500, fontSize: '12px' } },
     },
   },
});

export const getAppTheme = (mode: 'light' | 'dark') => {
  return mode === 'light' ? lightTheme : darkTheme;
};
