import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PracticeScreen from './screens/PracticeScreen';
import ProgressScreen from './screens/ProgressScreen';
import LibraryScreen from './screens/LibraryScreen';
import ProfileScreen from './screens/ProfileScreen';
import TabBar from './components/TabBar';

function App() {
  return (
    <BrowserRouter>
      <div className="relative h-screen w-full overflow-hidden bg-[#0F1117]">
        <Routes>
          <Route path="/" element={<PracticeScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/library" element={<LibraryScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
        <TabBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
