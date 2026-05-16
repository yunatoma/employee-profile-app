import { AppRoutes } from './routes/AppRoutes';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  useDarkMode();
  return <AppRoutes />;
}

export default App;
