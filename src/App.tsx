/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MasterSchedule from './pages/MasterSchedule';
import DesignProgress from './pages/DesignProgress';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import AiAssistantPage from './pages/AiAssistantPage';
import ConnectionsPage from './pages/ConnectionsPage';
import DataSourcesPage from './pages/DataSourcesPage';
import AiChatOverlay from './components/AiChatOverlay';
import { auth } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useStore } from './store';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [firebaseUser, loading] = useAuthState(auth);
  const storeUser = useStore((state) => state.user);
  
  if (loading && !storeUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Đang khởi tạo phiên làm việc...</p>
        </div>
      </div>
    );
  }
  
  const isAuthenticated = Boolean(storeUser || firebaseUser);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="master-schedule" element={<MasterSchedule />} />
          <Route path="design-progress" element={<DesignProgress />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="documents" element={<Documents />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="ai-assistant" element={<AiAssistantPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <AiChatOverlay />
    </Router>
  );
}
