import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VectorProvider } from './context/VectorContext';
import Home from './pages/Home';
import Config from './pages/Config';
import Notes from './pages/Notes';

function App() {
  return (
    <VectorProvider>
      <BrowserRouter>
        <div className="h-screen w-screen bg-black crt-scanlines crt-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/config" element={<Config />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </div>
      </BrowserRouter>
    </VectorProvider>
  );
}

export default App;
