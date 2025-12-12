// Consultant Dashboard JavaScript
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
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Get user info
function getUserInfo() {
    const userName = localStorage.getItem('userName') || 'Consultant';
    const userRole = localStorage.getItem('userRole') || 'teacher';

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = userName;

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

        const totalEl = document.getElementById('totalStudents');
        const activeEl = document.getElementById('activeStudents');
        const needingEl = document.getElementById('needingSupport');

        if (totalEl) totalEl.innerHTML = `${analytics.totalStudents || 0} <span class="stat-badge positive">+${Math.floor(Math.random() * 10) + 1}</span>`;
        if (activeEl) activeEl.textContent = analytics.activeStudents || 0;
        if (needingEl) needingEl.textContent = analytics.studentsNeedingSupport || 0;

        // Update dyslexia distribution
        const breakdown = analytics.dyslexiaBreakdown || {};
        updateDyslexiaDistribution(breakdown);

    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
}

// Update dyslexia distribution in sidebar
function updateDyslexiaDistribution(breakdown) {
    const dyslexiaEl = document.getElementById('countDyslexia');
    const dyscalculiaEl = document.getElementById('countDyscalculia');
    const dysgraphiaEl = document.getElementById('countDysgraphia');
    const dysphasiaEl = document.getElementById('countDysphasia');

    if (dyslexiaEl) dyslexiaEl.textContent = `${breakdown.dyslexia || 0} students`;
    if (dyscalculiaEl) dyscalculiaEl.textContent = `${breakdown.dyscalculia || 0} students`;
    if (dysgraphiaEl) dysgraphiaEl.textContent = `${breakdown.dysgraphia || 0} students`;
    if (dysphasiaEl) dysphasiaEl.textContent = `${breakdown.dysphasia || 0} students`;
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
            if (emptyState) emptyState.style.display = 'block';
            if (tableContainer) tableContainer.style.display = 'none';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            if (tableContainer) tableContainer.style.display = 'block';

            if (tbody) {
                tbody.innerHTML = students.map(student => `
          <tr>
            <td>
              <div class="student-name">
                <div class="student-avatar">${student.firstName[0]}${student.lastName[0]}</div>
                <span>${student.firstName} ${student.lastName}</span>
              </div>
            </td>
            <td>${student.studentId || '-'}</td>
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
              <button class="action-btn btn-edit" data-action="edit" data-id="${student._id}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn btn-test" data-action="test" data-id="${student._id}" data-name="${student.firstName} ${student.lastName}" title="Start Game">
                <i class="fas fa-clipboard-check"></i>
              </button>
              <button class="action-btn btn-delete" data-action="delete" data-id="${student._id}" data-name="${student.firstName} ${student.lastName}" title="Deactivate">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');
            }
        }
    } catch (error) {
        console.error('Failed to load students:', error);
        showToast('Failed to load students', 'error');
    }
}

// Format dyslexia type for display
function formatDyslexiaType(type) {
    const types = {
        'none': 'None',
        'dyslexia': 'Dyslexia',
        'dyscalculia': 'Dyscalculia',
        'dysgraphia': 'Dysgraphia',
        'dysphasia': 'Dysphasia'
    };
    return types[type] || 'None';
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
            await apiRequest(`/users/students/${editingStudentId}`, 'PUT', formData);
            showToast('Student updated successfully');
        } else {
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
async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to deactivate student ${name || 'ID: ' + id}?`)) return;

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
        showToast('Test assigned! Starting game...');
        closeTestModal();

        // Redirect to game with params
        setTimeout(() => {
            window.location.href = `game/index.html?student=${studentId}&task=${testType}`;
        }, 1000);
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
    getUserInfo();
    loadAnalytics();
    loadStudents();

    // Event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const quickAddStudent = document.getElementById('quickAddStudent');
    const closeModal = document.getElementById('closeModal');
    const cancelModal = document.getElementById('cancelModal');
    const studentForm = document.getElementById('studentForm');
    const searchInput = document.getElementById('searchInput');
    const closeTestModal = document.getElementById('closeTestModal');
    const cancelTestModal = document.getElementById('cancelTestModal');
    const testForm = document.getElementById('testForm');
    const navStudents = document.getElementById('navStudents');

    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', logout);
    if (addStudentBtn) addStudentBtn.addEventListener('click', openAddStudentModal);
    if (quickAddStudent) quickAddStudent.addEventListener('click', openAddStudentModal);
    if (closeModal) closeModal.addEventListener('click', closeStudentModal);
    if (cancelModal) cancelModal.addEventListener('click', closeStudentModal);
    if (studentForm) studentForm.addEventListener('submit', submitStudentForm);
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (closeTestModal) closeTestModal.addEventListener('click', closeTestModal);
    if (cancelTestModal) cancelTestModal.addEventListener('click', closeTestModal);
    if (testForm) testForm.addEventListener('submit', submitTestForm);
    if (navStudents) navStudents.addEventListener('click', () => {
        document.getElementById('studentsSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Event delegation for table actions
    const tableBody = document.getElementById('studentTableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const name = btn.dataset.name;

            if (action === 'edit') {
                editStudent(id);
            } else if (action === 'test') {
                // Direct redirect to game as requested
                window.location.href = `game/index.html?student=${id}&name=${encodeURIComponent(name)}`;
            } else if (action === 'delete') {
                deleteStudent(id, name);
            }
        });
    }
};
