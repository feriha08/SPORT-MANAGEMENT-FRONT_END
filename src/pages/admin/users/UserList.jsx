import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaFilter, FaCheck, FaTimes, FaUserCog,
  FaUserGraduate, FaUsers, FaChevronLeft, FaChevronRight,
  FaUserTie, FaSchool, FaUserCircle, FaSync
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './UserList.css';

const UserList = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Check if we have refresh flag from edit page
    const shouldRefresh = location.state?.refresh || false;
    console.log('🔄 UserList: shouldRefresh =', shouldRefresh);
    
    fetchUsers(shouldRefresh);
    
    // Clear the state after refresh
    if (shouldRefresh) {
      window.history.replaceState({}, document.title, '/admin/users');
    }
  }, [currentPage, roleFilter, statusFilter, location.state]);

  const fetchUsers = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (roleFilter !== 'All') {
        params.role = roleFilter;
      }
      if (statusFilter !== 'All') {
        params.is_active = statusFilter === 'Active';
      }

      // Add cache buster for force refresh
      if (forceRefresh) {
        params._ = Date.now();
        console.log('🔄 Force refresh with cache buster');
      }

      const response = await axiosInstance.get('accounts/list/', { params });
      console.log('✅ Users loaded:', response.data.results?.length || 0, 'users');
      
      setUsers(response.data.results || response.data || []);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(true);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDelete = async (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`accounts/${selectedUser.id}/`);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers(true);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await axiosInstance.put(`accounts/${user.id}/toggle-active/`);
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers(true);
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle user status');
    }
  };

  const handleRefresh = () => {
    fetchUsers(true);
    toast.info('Data refreshed');
  };

  // ============ HELPER FUNCTIONS FOR ROLE DISPLAY ============
  
  const getRoleDisplay = (role) => {
    const roleMap = {
      'super_admin': 'Super Admin',
      'school_admin': 'School Admin',
      'referee': 'Referee',
      'public_user': 'Public User',
      'Super Admin': 'Super Admin',
      'School Admin': 'School Admin',
      'Referee': 'Referee',
      'Public User': 'Public User',
    };
    return roleMap[role] || role || 'Public User';
  };

  const getRoleBadgeClass = (role) => {
    const roleMap = {
      'super_admin': 'role-super-admin',
      'Super Admin': 'role-super-admin',
      'school_admin': 'role-school-admin',
      'School Admin': 'role-school-admin',
      'referee': 'role-referee',
      'Referee': 'role-referee',
      'public_user': 'role-public',
      'Public User': 'role-public',
    };
    return roleMap[role] || 'role-public';
  };

  const getRoleIcon = (role) => {
    if (role === 'super_admin' || role === 'Super Admin') return <FaUserTie />;
    if (role === 'school_admin' || role === 'School Admin') return <FaSchool />;
    if (role === 'referee' || role === 'Referee') return <FaUserCircle />;
    return <FaUserGraduate />;
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  // ============ PAGINATION ============
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <FaChevronLeft /> Prev
        </button>
        
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && setCurrentPage(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next <FaChevronRight />
        </button>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="user-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all users in the system</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <Link to="/admin/users/create" className="btn btn-primary">
            <FaPlus /> Create User
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </div>
          </form>

          <div className="filter-group">
            <div className="filter-item">
              <label>Role:</label>
              <select 
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="School Admin">School Admin</option>
                <option value="Referee">Referee</option>
                <option value="Public User">Public User</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Status:</label>
              <select 
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <div>
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaCheck className="stat-icon" style={{ color: 'var(--success)' }} />
          <div>
            <span className="stat-label">Active</span>
            <span className="stat-value">{users.filter(u => u.is_active).length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaTimes className="stat-icon" style={{ color: 'var(--error)' }} />
          <div>
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{users.filter(u => !u.is_active).length}</span>
          </div>
        </div>
      </div>

      {/* User Table */}
      <Card className="table-card">
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>School</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <FaUsers className="empty-icon" />
                    <p>No users found</p>
                    <p className="empty-subtitle">Try adjusting your filters or create a new user</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="user-name">{user.full_name || user.username}</div>
                          <div className="user-username">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)} 
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td>{user.school?.name || '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/users/${user.id}`} 
                          className="action-btn view-btn"
                          title="View User"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/admin/users/${user.id}/edit`} 
                          className="action-btn edit-btn"
                          title="Edit User"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`action-btn ${user.is_active ? 'deactivate-btn' : 'activate-btn'}`}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.is_active ? <FaTimes /> : <FaCheck />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          className="action-btn delete-btn"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete User</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{selectedUser.username}</strong>?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;