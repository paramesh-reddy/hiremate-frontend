import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getTheme } from './theme/theme';
import { store } from './store';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function ThemeGate({ children }) {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const theme = getTheme(darkMode ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeGate>
          <AppRoutes />
        </ThemeGate>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
