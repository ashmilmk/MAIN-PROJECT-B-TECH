// Teacher Dashboard JavaScript
const API_BASE = '';

// API Helper
async function apiRequest(path, method = 'GET', body) {
    const res = await fetch(`${API_BASE}/api${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || 'Request failed');
    }
    return data;
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize particles
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Get user info
function getUserInfo() {
    const userName = localStorage.getItem('userName') || 'Teacher';
    const userRole = localStorage.getItem('userRole') || 'teacher';

    document.getElementById('userName').textContent = `Welcome, ${userName}!`;
    document.getElementById('userRole').textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    // Check if user is a teacher
    if (userRole !== 'teacher' && userRole !== 'admin') {
        window.location.href = 'dashboard.html';
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const data = await apiRequest('/users/analytics');
        const analytics = data.analytics;

        document.getElementById('totalStudents').textContent = analytics.totalStudents || 0;
        document.getElementById('activeStudents').textContent = analytics.activeStudents || 0;
        document.getElementById('needingSupport').textContent = analytics.studentsNeedingSupport || 0;
        document.getElementById('testsAssigned').textContent = '0'; // Will update when we track tests
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
}

// Load students
async function loadStudents(search = '') {
    try {
        const data = await apiRequest(`/users/students?search=${encodeURIComponent(search)}&limit=50`);
        const students = data.students || [];

        const tbody = document.getElementById('studentTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.getElementById('studentTableContainer');

        if (students.length === 0) {
            emptyState.style.display = 'block';
            tableContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableContainer.style.display = 'block';

            tbody.innerHTML = students.map(student => `
        <tr>
          <td>
            <div class="student-name">
              <div class="student-avatar">${student.firstName[0]}${student.lastName[0]}</div>
              <span>${student.firstName} ${student.lastName}</span>
            </div>
          </td>
          <td>${student.studentId || '-'}</td>
          <td>${student.email}</td>
          <td>
            <span class="badge badge-${student.learningProfile?.dyslexiaType || 'none'}">
              ${formatDyslexiaType(student.learningProfile?.dyslexiaType)}
            </span>
          </td>
          <td>
            <span class="badge badge-${student.learningProfile?.severity || 'mild'}">
              ${capitalize(student.learningProfile?.severity || 'Mild')}
            </span>
          </td>
          <td>
            <button class="action-btn btn-edit" onclick="editStudent('${student._id}')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn btn-test" onclick="openTestModal('${student._id}', '${student.firstName} ${student.lastName}')" title="Assign Test">
              <i class="fas fa-clipboard-check"></i>
            </button>
            <button class="action-btn btn-delete" onclick="deleteStudent('${student._id}')" title="Deactivate">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
        }
    } catch (error) {
        console.error('Failed to load students:', error);
        showToast('Failed to load students', 'error');
    }
}

// Format dyslexia type for display
function formatDyslexiaType(type) {
    const types = {
        'none': 'None Detected',
        'dyslexia': 'Dyslexia',
        'dyscalculia': 'Dyscalculia',
        'dysgraphia': 'Dysgraphia',
        'dysphasia': 'Dysphasia'
    };
    return types[type] || 'None Detected';
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Modal management
let editingStudentId = null;

function openAddStudentModal() {
    editingStudentId = null;
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('submitBtn').textContent = 'Add Student';
    document.getElementById('studentForm').reset();
    document.getElementById('email').disabled = false;
    document.getElementById('studentIdInput').disabled = false;
    document.getElementById('studentModal').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
    editingStudentId = null;
}

async function editStudent(id) {
    try {
        const data = await apiRequest(`/users/students/${id}`);
        const student = data.student;

        editingStudentId = id;
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('submitBtn').textContent = 'Update Student';

        document.getElementById('firstName').value = student.firstName || '';
        document.getElementById('lastName').value = student.lastName || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('email').disabled = true;
        document.getElementById('studentIdInput').value = student.studentId || '';
        document.getElementById('studentIdInput').disabled = true;
        document.getElementById('grade').value = student.grade || '';
        document.getElementById('dyslexiaType').value = student.learningProfile?.dyslexiaType || 'none';
        document.getElementById('severity').value = student.learningProfile?.severity || 'mild';

        document.getElementById('studentModal').classList.add('active');
    } catch (error) {
        showToast('Failed to load student data', 'error');
    }
}

// Submit student form
async function submitStudentForm(e) {
    e.preventDefault();

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        studentId: document.getElementById('studentIdInput').value,
        grade: document.getElementById('grade').value,
        dyslexiaType: document.getElementById('dyslexiaType').value,
        severity: document.getElementById('severity').value
    };

    try {
        if (editingStudentId) {
            // Update existing student
            await apiRequest(`/users/students/${editingStudentId}`, 'PUT', formData);
            showToast('Student updated successfully');
        } else {
            // Create new student
            await apiRequest('/users/students', 'POST', formData);
            showToast('Student created successfully');
        }

        closeStudentModal();
        loadStudents();
        loadAnalytics();
    } catch (error) {
        showToast(error.message || 'Failed to save student', 'error');
    }
}

// Delete (deactivate) student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to deactivate this student?')) return;

    try {
        await apiRequest(`/users/students/${id}`, 'DELETE');
        showToast('Student deactivated successfully');
        loadStudents();
        loadAnalytics();
    } catch (error) {
        showToast('Failed to deactivate student', 'error');
    }
}

// Test assignment
function openTestModal(studentId, studentName) {
    document.getElementById('testStudentId').value = studentId;
    document.getElementById('testStudentName').textContent = studentName;
    document.getElementById('testModal').classList.add('active');
}

function closeTestModal() {
    document.getElementById('testModal').classList.remove('active');
}

async function submitTestForm(e) {
    e.preventDefault();

    const studentId = document.getElementById('testStudentId').value;
    const testType = document.getElementById('testType').value;

    try {
        await apiRequest(`/users/students/${studentId}/assign-test`, 'POST', { testType });
        showToast('Test assigned successfully');
        closeTestModal();
    } catch (error) {
        showToast(error.message || 'Failed to assign test', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

// Search with debounce
let searchTimeout;
function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadStudents(e.target.value);
    }, 300);
}

// Initialize
window.onload = function () {
    // Hide loading
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 500);

    initParticles();
    getUserInfo();
    loadAnalytics();
    loadStudents();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('openAddStudentModal').addEventListener('click', openAddStudentModal);
    document.getElementById('addStudentBtn').addEventListener('click', openAddStudentModal);
    document.getElementById('closeModal').addEventListener('click', closeStudentModal);
    document.getElementById('cancelModal').addEventListener('click', closeStudentModal);
    document.getElementById('studentForm').addEventListener('submit', submitStudentForm);
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Test modal events
    document.getElementById('closeTestModal').addEventListener('click', closeTestModal);
    document.getElementById('cancelTestModal').addEventListener('click', closeTestModal);
    document.getElementById('testForm').addEventListener('submit', submitTestForm);

    // Scroll to students
    document.getElementById('scrollToStudents').addEventListener('click', () => {
        document.getElementById('studentsSection').scrollIntoView({ behavior: 'smooth' });
    });
};
