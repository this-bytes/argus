import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArgusProvider } from './context/ArgusContext';
import Home from './pages/Home';
import Config from './pages/ConfigV2';
import Notes from './pages/Notes';

function App() {
  return (
    <ArgusProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="h-screen w-screen bg-black crt-scanlines crt-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/config" element={<Config />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ArgusProvider>
  );
}

export default App;
