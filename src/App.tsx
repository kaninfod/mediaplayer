
import './App.css';
import Player from './pages/Player';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Player />
    </QueryClientProvider>
  );
}

export default App;
