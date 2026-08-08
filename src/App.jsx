import { HashRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage';
import DashBoards from './pages/Dashboards';
import VSMaps from './pages/VSMaps'
import NavBar from './reusable-components/navbar/NavBar';
import BasicLayout from './BasicLayout';
import './i18n.js';  

function App() {
  return <>
    <HashRouter>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboards" element={<DashBoards />} />
          <Route path="/value-stream-maps" element={<VSMaps />} />
        </Route>
      </Routes>
    </HashRouter>
  </>
}

export default App;