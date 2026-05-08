import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import { AppRouter } from './router';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from '@/reactQueryConfig/QueryProvider';

export function App() {
  return (
    <ReduxProvider store={store}>
      <QueryProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
