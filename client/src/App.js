import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home         from './pages/Home';
import Login        from './pages/Login';
import Signup       from './pages/Signup';
import PetList      from './components/PetList';
import PetDetail    from './pages/PetDetail';
import AdoptionForm from './pages/AdoptionForm';
import AdminDashboard    from './pages/admin/AdminDashboard';
import UserDashboard     from './pages/user/UserDashboard';
import CompatibilityQuiz from './pages/user/CompatibilityQuiz';

import './App.css';

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'user')  return <Navigate to="/user" replace />;
  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"        element={<HomeRedirect />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<Signup />} />
          <Route path="/pets"    element={<PetList />} />
          <Route path="/pet/:id" element={<PetDetail />} />
          <Route path="/apply/:id" element={<AdoptionForm />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/user" element={
            <ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute allowedRole="user"><CompatibilityQuiz /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
