/* ============================================================
   SALWADEV — Authentication & User Management System
   ============================================================ */

// Default Admin Account
const DEFAULT_ADMIN = {
  id: 'S@lwadev',
  password: 'S@lwadev123',
  name: 'Admin',
  email: 'admin@salwadev.com',
  role: 'admin',
  company: 'SalwaDev'
};

// Initialize users storage
function initializeAuth() {
  const users = localStorage.getItem('salwadev-users');
  if (!users) {
    // Create default admin account on first load
    const defaultUsers = [DEFAULT_ADMIN];
    localStorage.setItem('salwadev-users', JSON.stringify(defaultUsers));
  }
}

// Get all users
function getAllUsers() {
  initializeAuth();
  const users = localStorage.getItem('salwadev-users');
  return users ? JSON.parse(users) : [];
}

// Get current logged in user
function getCurrentUser() {
  const user = sessionStorage.getItem('salwadev-current-user');
  return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem('salwadev-current-user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('salwadev-current-user');
  }
}

// Register new user
function registerUser(id, password, name, email, company) {
  if (!id || !password || !name || !email) {
    return { success: false, message: 'All fields are required' };
  }

  const users = getAllUsers();
  
  // Check if user already exists
  if (users.find(u => u.id === id)) {
    return { success: false, message: 'User ID already exists' };
  }

  const newUser = {
    id,
    password, // In production, this should be hashed
    name,
    email,
    role: 'client',
    company,
    createdAt: new Date().toISOString(),
    projects: []
  };

  users.push(newUser);
  localStorage.setItem('salwadev-users', JSON.stringify(users));
  
  return { success: true, message: 'Registration successful', user: newUser };
}

// Login user
function loginUser(id, password) {
  const users = getAllUsers();
  const user = users.find(u => u.id === id && u.password === password);

  if (user) {
    setCurrentUser(user);
    return { success: true, message: 'Login successful', user };
  }

  return { success: false, message: 'Invalid credentials' };
}

// Logout user
function logoutUser() {
  setCurrentUser(null);
}

// Check if user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Get user by ID (for admin)
function getUserById(id) {
  const users = getAllUsers();
  return users.find(u => u.id === id);
}

// Update user (for admin)
function updateUser(id, updates) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return { success: false, message: 'User not found' };
  }

  users[index] = { ...users[index], ...updates };
  localStorage.setItem('salwadev-users', JSON.stringify(users));
  
  return { success: true, message: 'User updated', user: users[index] };
}

// Delete user (for admin)
function deleteUser(id) {
  if (id === DEFAULT_ADMIN.id) {
    return { success: false, message: 'Cannot delete default admin account' };
  }

  const users = getAllUsers();
  const filtered = users.filter(u => u.id !== id);
  
  if (filtered.length === users.length) {
    return { success: false, message: 'User not found' };
  }

  localStorage.setItem('salwadev-users', JSON.stringify(filtered));
  return { success: true, message: 'User deleted' };
}

// Get all clients (for admin)
function getAllClients() {
  const users = getAllUsers();
  return users.filter(u => u.role === 'client');
}

// Get client projects (for admin)
function getClientProjects(clientId) {
  const user = getUserById(clientId);
  return user ? user.projects || [] : [];
}

// ============================================================
// PROJECT MANAGEMENT FUNCTIONS
// ============================================================

// Create new project
function createProject(clientId, projectName, description = '') {
  if (!isAdmin()) {
    return { success: false, message: 'Only admin can create projects' };
  }

  const users = getAllUsers();
  const clientIndex = users.findIndex(u => u.id === clientId);
  
  if (clientIndex === -1) {
    return { success: false, message: 'Client not found' };
  }

  if (!users[clientIndex].projects) {
    users[clientIndex].projects = [];
  }

  const project = {
    id: Date.now().toString(),
    name: projectName,
    description,
    status: 'active', // active, pending, completed
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    files: [],
    requirements: [],
    notes: ''
  };

  users[clientIndex].projects.push(project);
  localStorage.setItem('salwadev-users', JSON.stringify(users));
  
  return { success: true, message: 'Project created', project };
}

// Update project
function updateProject(clientId, projectId, updates) {
  if (!isAdmin()) {
    return { success: false, message: 'Only admin can update projects' };
  }

  const users = getAllUsers();
  const user = users.find(u => u.id === clientId);
  
  if (!user) {
    return { success: false, message: 'Client not found' };
  }

  const project = user.projects?.find(p => p.id === projectId);
  
  if (!project) {
    return { success: false, message: 'Project not found' };
  }

  Object.assign(project, updates, { updatedAt: new Date().toISOString() });
  localStorage.setItem('salwadev-users', JSON.stringify(users));
  
  return { success: true, message: 'Project updated', project };
}

// Update project progress (for admin)
function updateProjectProgress(clientId, projectId, progress) {
  if (!isAdmin()) {
    return { success: false, message: 'Only admin can update progress' };
  }

  return updateProject(clientId, projectId, { progress: Math.min(100, Math.max(0, progress)) });
}

// Add file to project (for client)
function addFileToProject(projectId, fileName, fileData) {
  const user = getCurrentUser();
  
  if (!user || user.role !== 'client') {
    return { success: false, message: 'Only clients can upload files' };
  }

  const project = user.projects?.find(p => p.id === projectId);
  
  if (!project) {
    return { success: false, message: 'Project not found' };
  }

  if (!project.files) {
    project.files = [];
  }

  const file = {
    id: Date.now().toString(),
    name: fileName,
    size: fileData ? fileData.length : 0,
    uploadedAt: new Date().toISOString(),
    url: 'data:' + (fileData || '')
  };

  project.files.push(file);

  // Update in localStorage
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === user.id);
  users[userIndex] = user;
  localStorage.setItem('salwadev-users', JSON.stringify(users));
  
  return { success: true, message: 'File uploaded', file };
}

// Add requirement to project (for admin)
function addProjectRequirement(clientId, projectId, requirement) {
  if (!isAdmin()) {
    return { success: false, message: 'Only admin can set requirements' };
  }

  const users = getAllUsers();
  const user = users.find(u => u.id === clientId);
  
  if (!user) {
    return { success: false, message: 'Client not found' };
  }

  const project = user.projects?.find(p => p.id === projectId);
  
  if (!project) {
    return { success: false, message: 'Project not found' };
  }

  if (!project.requirements) {
    project.requirements = [];
  }

  const req = {
    id: Date.now().toString(),
    text: requirement,
    completed: false,
    createdAt: new Date().toISOString()
  };

  project.requirements.push(req);
  localStorage.setItem('salwadev-users', JSON.stringify(users));
  
  return { success: true, message: 'Requirement added', requirement: req };
}

// Get client details (for admin)
function getClientDetails(clientId) {
  const users = getAllUsers();
  const client = users.find(u => u.id === clientId);
  
  if (!client || client.role !== 'client') {
    return null;
  }

  return client;
}

// Update client status (for admin)
function updateClientStatus(clientId, status) {
  if (!isAdmin()) {
    return { success: false, message: 'Only admin can update client status' };
  }

  return updateUser(clientId, { status });
}

// Export functions for use in HTML
window.Auth = {
  initializeAuth,
  getAllUsers,
  getCurrentUser,
  setCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  isAdmin,
  isLoggedIn,
  getUserById,
  updateUser,
  deleteUser,
  getAllClients,
  getClientProjects,
  createProject,
  updateProject,
  updateProjectProgress,
  addFileToProject,
  addProjectRequirement,
  getClientDetails,
  updateClientStatus,
  DEFAULT_ADMIN
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeAuth();
  
  // Update UI based on login status
  updateAuthUI();
});

// Update UI based on authentication status
function updateAuthUI() {
  const user = getCurrentUser();
  const authBtn = document.querySelector('.nav-btn-auth');
  const adminBtn = document.querySelector('.nav-btn-admin');
  
  if (authBtn) {
    if (user) {
      authBtn.textContent = `${user.name} ↓`;
      authBtn.onclick = () => toggleAuthMenu();
    } else {
      authBtn.textContent = 'Login';
      authBtn.onclick = () => window.location.href = 'login.html';
    }
  }
  
  if (adminBtn && user && user.role === 'admin') {
    adminBtn.style.display = 'flex';
  }
}

// Toggle auth menu
function toggleAuthMenu() {
  const menu = document.getElementById('authDropdown');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

// Logout from UI
function logout() {
  logoutUser();
  updateAuthUI();
  showToast('Logged out successfully');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}
