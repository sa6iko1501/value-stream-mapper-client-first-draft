import { HashRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage';
import DashBoards from './pages/dashboards/Dashboards';
import VSMaps from './pages/vsm/VSMaps'
import VSMapBoard from './pages/vsm/VSMapBoard.jsx';
import BasicLayout from './BasicLayout';
import './i18n.js';
import ProcessTableForm from './pages/vsm/forms/ProcessTableForm.jsx';
import ProcessTablePositioningForm from './pages/vsm/forms/ProcessTablePositioningForm.jsx';
import SupplyForm from './pages/vsm/forms/SupplyForm.jsx';
import SupplierForm from './pages/vsm/forms/SupplierForm.jsx';
import CustomerForm from './pages/vsm/forms/CustomerForm.jsx';
import VSMapsForm from './pages/vsm/forms/VSMapsForm.jsx';

function App() {
  return <>
    <HashRouter>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboards" element={<DashBoards />} />
          <Route path="/value-stream-maps" element={<VSMaps />} />
          <Route path="/vs-map/:id" element={<VSMapBoard />} />
          <Route path="/vs-map/new" element={<VSMapsForm />} />
          <Route path="/edit-process-table/:id" element={<ProcessTableForm />} />
          <Route path="/process-table/new" element={<ProcessTableForm />} />
          <Route path="/process-table/positioning" element={<ProcessTablePositioningForm />} />
          <Route path="/supply" element={<SupplyForm />} />
          <Route path="/supplier/:supplierId/edit" element={<SupplierForm />} />
          <Route path="/supplier/new" element={<SupplierForm />} />
          <Route path="/customer/:customerId/edit" element={<CustomerForm />} />
          <Route path="/customer/new" element={<CustomerForm />} />
        </Route>
      </Routes>
    </HashRouter>
  </>
}

export default App;