const API_BASE = ''; // same-origin calls; change to 'http://localhost:5000' if needed
let currentRole = 'student';
let currentMode = 'login';

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
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

function persistUserSession(payload) {
  localStorage.setItem('token', payload.token);
  localStorage.setItem('userRole', payload.user.role);
  localStorage.setItem('userEmail', payload.user.email);
  localStorage.setItem('userName', payload.user.firstName || 'User');
}

function showForm(role) {
  currentRole = role;
  const studentForm = document.getElementById("studentForm");
  const teacherForm = document.getElementById("teacherForm");
  const studentBtn = document.getElementById("studentBtn");
  const teacherBtn = document.getElementById("teacherBtn");

  if (role === "student") {
    studentForm.classList.add("active");
    teacherForm.classList.remove("active");
    studentBtn.classList.add("active");
    teacherBtn.classList.remove("active");
  } else {
    teacherForm.classList.add("active");
    studentForm.classList.remove("active");
    teacherBtn.classList.add("active");
    studentBtn.classList.remove("active");
  }
}

function switchToRegister(role) {
  currentRole = role;
  currentMode = 'register';
  
  document.querySelectorAll('.login-box, .register-box').forEach(form => {
    form.classList.remove('active');
  });
  
  document.getElementById(role + 'RegisterForm').classList.add('active');
}

function switchToLogin(role) {
  currentRole = role;
  currentMode = 'login';
  
  document.querySelectorAll('.login-box, .register-box').forEach(form => {
    form.classList.remove('active');
  });
  
  document.getElementById(role + 'Form').classList.add('active');
}

function togglePassword(id) {
  const field = document.getElementById(id);
  field.type = field.type === "password" ? "text" : "password";
}

function showSuccessMessage(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 3000);
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Student Login Form Handler
document.getElementById('studentLoginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('studentEmail').value;
  const password = document.getElementById('studentPassword').value;
  try {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    persistUserSession(data);
    showSuccessMessage('Student login successful!');
    setTimeout(() => (window.location.href = 'index.html'), 800);
  } catch (err) {
    alert(err.message || 'Login failed');
  }
});

// Teacher Login Form Handler
document.getElementById('teacherLoginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('teacherEmail').value;
  const password = document.getElementById('teacherPassword').value;
  try {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    persistUserSession(data);
    showSuccessMessage('Teacher login successful!');
    setTimeout(() => (window.location.href = 'index.html'), 800);
  } catch (err) {
    alert(err.message || 'Login failed');
  }
});

// Student Registration Form Handler
document.getElementById('studentRegisterFormSubmit').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('studentFirstName').value;
  const lastName = document.getElementById('studentLastName').value;
  const email = document.getElementById('studentRegEmail').value;
  const studentId = document.getElementById('studentId').value;
  const password = document.getElementById('studentRegPassword').value;
  const confirmPassword = document.getElementById('studentConfirmPassword').value;

  if (!validateEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }
  if (!validatePassword(password)) {
    alert('Password must be at least 8 characters with uppercase, lowercase, and number');
    return;
  }
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const data = await apiRequest('/auth/register', 'POST', {
      firstName,
      lastName,
      email,
      studentId,
      password,
      role: 'student'
    });
    showSuccessMessage('Student account created successfully!');
    document.getElementById('studentRegisterFormSubmit').reset();
    persistUserSession(data);
    setTimeout(() => (window.location.href = 'index.html'), 800);
  } catch (err) {
    alert(err.message || 'Registration failed');
  }
});

// Teacher Registration Form Handler
document.getElementById('teacherRegisterFormSubmit').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('teacherFirstName').value;
  const lastName = document.getElementById('teacherLastName').value;
  const email = document.getElementById('teacherRegEmail').value;
  const department = document.getElementById('teacherDepartment').value;
  const employeeId = document.getElementById('teacherEmployeeId').value;
  const password = document.getElementById('teacherRegPassword').value;
  const confirmPassword = document.getElementById('teacherConfirmPassword').value;

  if (!validateEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }
  if (!validatePassword(password)) {
    alert('Password must be at least 8 characters with uppercase, lowercase, and number');
    return;
  }
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const data = await apiRequest('/auth/register', 'POST', {
      firstName,
      lastName,
      email,
      department,
      employeeId,
      password,
      role: 'teacher'
    });
    showSuccessMessage('Teacher account created successfully!');
    document.getElementById('teacherRegisterFormSubmit').reset();
    persistUserSession(data);
    setTimeout(() => (window.location.href = 'index.html'), 800);
  } catch (err) {
    alert(err.message || 'Registration failed');
  }
});

// Switcher links and buttons (avoid inline handlers to satisfy CSP)
function attachSwitchers() {
  const studentBtn = document.getElementById('studentBtn');
  const teacherBtn = document.getElementById('teacherBtn');
  const studentRegisterLink = document.getElementById('studentRegisterLink');
  const teacherRegisterLink = document.getElementById('teacherRegisterLink');
  const studentLoginLink = document.getElementById('studentLoginLink');
  const teacherLoginLink = document.getElementById('teacherLoginLink');

  if (studentBtn) studentBtn.addEventListener('click', () => showForm('student'));
  if (teacherBtn) teacherBtn.addEventListener('click', () => showForm('teacher'));
  if (studentRegisterLink) studentRegisterLink.addEventListener('click', () => switchToRegister('student'));
  if (teacherRegisterLink) teacherRegisterLink.addEventListener('click', () => switchToRegister('teacher'));
  if (studentLoginLink) studentLoginLink.addEventListener('click', () => switchToLogin('student'));
  if (teacherLoginLink) teacherLoginLink.addEventListener('click', () => switchToLogin('teacher'));
}

// Ensure handlers are attached after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  attachSwitchers();
});

