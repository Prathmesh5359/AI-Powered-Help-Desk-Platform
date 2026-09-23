import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NewTicketModal } from './components/NewTicketModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TicketList } from './pages/TicketList';
import { TicketDetail } from './pages/TicketDetail';
import { UserManagement } from './pages/UserManagement';

const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header onOpenNewTicket={() => setIsNewTicketOpen(true)} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            {user.role === 'ADMIN' && <Route path="/users" element={<UserManagement />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSuccess={() => {
          // If on ticket list page, window trigger or navigation can happen
          if (window.location.pathname === '/tickets') {
            window.location.reload();
          }
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
