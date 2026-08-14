import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanDetails from './pages/ScanDetails';
import Vulnerabilities from './pages/Vulnerabilities';
import AttackSurface from './pages/AttackSurface';
import AgentsCenter from './pages/AgentsCenter';
import KnowledgeGraph from './pages/KnowledgeGraph';
import AttackPaths from './pages/AttackPaths';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan/new" element={<NewScan />} />
          <Route path="/scan/active" element={<ScanDetails />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/attack-surface" element={<AttackSurface />} />
          <Route path="/agents" element={<AgentsCenter />} />
          <Route path="/knowledge" element={<KnowledgeGraph />} />
          <Route path="/attack-paths" element={<AttackPaths />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}