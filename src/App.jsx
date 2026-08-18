import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserList from './pages/admin/users/UserList';
import CreateUser from './pages/admin/users/CreateUser';
import EditUser from './pages/admin/users/EditUser';
import SchoolList from './pages/admin/schools/SchoolList';
import CreateSchool from './pages/admin/schools/CreateSchool';
import EditSchool from './pages/admin/schools/EditSchool';
import StudentList from './pages/admin/students/StudentList';
import CreateStudent from './pages/admin/students/CreateStudent';
import StudentProfile from './pages/public/StudentProfile';
import CompetitionList from './pages/admin/competitions/CompetitionList';
import CreateCompetition from './pages/admin/competitions/CreateCompetition';
import MatchList from './pages/admin/matches/MatchList';
import FixtureList from './pages/admin/fixtures/FixtureList';
import Reports from './pages/admin/reports/Reports';
import Settings from './pages/admin/settings/Settings';
import SchoolDashboard from './pages/school/Dashboard';
import RegisterSchool from './pages/school/RegisterSchool';
import SchoolProfile from './pages/school/SchoolProfile';
import RefereeDashboard from './pages/referee/Dashboard';
import PublicDashboard from './pages/public/Home';
import SchoolDetail from './pages/admin/schools/SchoolDetail';
import StudentDetail from './pages/admin/students/StudentDetail';
import EditStudent from './pages/admin/students/EditStudent';
import CompetitionDetail from './pages/admin/competitions/CompetitionDetail';
import EditCompetition from './pages/admin/competitions/EditCompetition';
import CompetitionManage from './pages/admin/competitions/CompetitionManage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ============================================================ */}
          {/* ===== PUBLIC ROUTES - No authentication required ===== */}
          {/* ============================================================ */}
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          
          {/* ============================================================ */}
          {/* ===== SUPER ADMIN ROUTES - Only Super Admin can access ===== */}
          {/* ============================================================ */}
          
          {/* Dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* User Management */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <UserList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/create" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CreateUser />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/competitions/:id/manage" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CompetitionManage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/schools/:id" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <SchoolDetail />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/competitions/:id" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CompetitionDetail />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/competitions/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <EditCompetition />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <EditUser />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/students/:id" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <StudentDetail />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />       
          <Route 
            path="/admin/students/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <EditStudent />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          {/* School Management */}
          <Route 
            path="/admin/schools" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <SchoolList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/schools/create" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CreateSchool />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/schools/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <EditSchool />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Student Management */}
          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <StudentList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/students/create" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CreateStudent />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Competition Management */}
          <Route 
            path="/admin/competitions" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CompetitionList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/competitions/create" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <CreateCompetition />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Match Management */}
          <Route 
            path="/admin/matches" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <MatchList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Fixture Management */}
          <Route 
            path="/admin/fixtures" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <FixtureList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Reports */}
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Settings */}
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* ============================================================ */}
          {/* ===== SCHOOL ADMIN ROUTES - Only School Admin can access ===== */}
          {/* ============================================================ */}
          
          {/* School Dashboard */}
          <Route 
            path="/school/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['School Admin']}>
                <DashboardLayout>
                  <SchoolDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Register School */}
          <Route 
            path="/school/register" 
            element={
              <ProtectedRoute allowedRoles={['School Admin']}>
                <DashboardLayout>
                  <RegisterSchool />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* School Profile */}
          <Route 
            path="/school/profile" 
            element={
              <ProtectedRoute allowedRoles={['School Admin']}>
                <DashboardLayout>
                  <SchoolProfile />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* ============================================================ */}
          {/* ===== REFEREE ROUTES - Only Referee can access ===== */}
          {/* ============================================================ */}
          <Route 
            path="/referee/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Referee']}>
                <DashboardLayout>
                  <RefereeDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* ============================================================ */}
          {/* ===== REDIRECTS ===== */}
          {/* ============================================================ */}
          <Route 
            path="/admin" 
            element={<Navigate to="/admin/dashboard" replace />} 
          />
          
          <Route 
            path="/school" 
            element={<Navigate to="/school/dashboard" replace />} 
          />
          
          <Route 
            path="/referee" 
            element={<Navigate to="/referee/dashboard" replace />} 
          />
          
          {/* ============================================================ */}
          {/* ===== 404 PAGE - Not Found ===== */}
          {/* ============================================================ */}
          <Route 
            path="*" 
            element={
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#F1F5F9',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  background: '#FFFFFF', 
                  padding: '48px 56px', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  maxWidth: '500px'
                }}>
                  <h1 style={{ fontSize: '72px', fontWeight: '700', color: '#1B4D8B', margin: '0' }}>404</h1>
                  <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#0F172A', margin: '8px 0' }}>Page Not Found</h2>
                  <p style={{ color: '#64748B', margin: '8px 0 24px 0' }}>
                    The page you are looking for does not exist or has been moved.
                  </p>
                  <Link 
                    to="/admin/dashboard" 
                    style={{ 
                      display: 'inline-block',
                      padding: '12px 32px',
                      background: '#1B4D8B',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#0D2B4B';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#1B4D8B';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            } 
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;