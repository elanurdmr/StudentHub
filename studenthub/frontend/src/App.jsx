import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Market from './pages/Market.jsx';
import Projects from './pages/Projects.jsx';
import Needs from './pages/Needs.jsx';
import Detail from './pages/Detail.jsx';
import Create from './pages/Create.jsx';
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages.jsx';
import Notifications from './pages/Notifications.jsx';
import Applications from './pages/Applications.jsx';
import ReviewForm from './pages/ReviewForm.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/market" element={<Market />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/needs" element={<Needs />} />
        <Route path="/detail/:type/:id" element={<Detail />} />
        <Route path="/profile/:id" element={<Profile />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/applications/:projectId" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/review/:targetId" element={<ProtectedRoute><ReviewForm /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
