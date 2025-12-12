// Initialize particles
function initParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
    particlesContainer.appendChild(particle);
  }
}

// Get user information
function getUserInfo() {
  const userRole = localStorage.getItem('userRole') || 'student';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userName = localStorage.getItem('userName') || 'User';

  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  if (nameEl) nameEl.textContent = `Welcome, ${userName}!`;
  if (roleEl) roleEl.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return userRole;
}

// Generate dashboard cards based on user role
function generateDashboardCards(userRole) {
  const dashboardGrid = document.getElementById('dashboardGrid');
  if (!dashboardGrid) return;

  if (userRole === 'student') {
    dashboardGrid.innerHTML = `
      <div class="dashboard-card" onclick="navigateToGame()">
        <div class="card-icon">
          <i class="fas fa-gamepad"></i>
        </div>
        <h3 class="card-title">Interactive Learning Games</h3>
        <p class="card-description">
          Engage with our comprehensive learning platform featuring dyslexia-friendly design, 
          text-to-speech support, and personalized learning paths for optimal educational experience.
        </p>
        <button class="card-btn">
          <i class="fas fa-play"></i>
          Start Learning Adventure
        </button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h3 class="card-title">Progress Analytics</h3>
        <p class="card-description">
          Track your learning journey with detailed analytics, performance insights, and 
          personalized recommendations to enhance your educational growth.
        </p>
        <button class="card-btn" onclick="viewProgress()">
          <i class="fas fa-chart-bar"></i>
          View Progress
        </button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-medal"></i>
        </div>
        <h3 class="card-title">Achievements & Certificates</h3>
        <p class="card-description">
          Earn badges, certificates, and recognition for your accomplishments. 
          Showcase your skills and celebrate your learning milestones.
        </p>
        <button class="card-btn">
          <i class="fas fa-trophy"></i>
          View Achievements
        </button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3 class="card-title">Learning Community</h3>
        <p class="card-description">
          Connect with peers, participate in group activities, and collaborate on 
          projects. Join a supportive community of learners.
        </p>
        <button class="card-btn">
          <i class="fas fa-comments"></i>
          Join Community
        </button>
      </div>
    `;
  } else if (userRole === 'teacher') {
    dashboardGrid.innerHTML = `
      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-chalkboard"></i>
        </div>
        <h3 class="card-title">Class Management</h3>
        <p class="card-description">
          Manage your classes, track student progress, and create engaging learning 
          experiences with our comprehensive teaching tools.
        </p>
        <button class="card-btn">
          <i class="fas fa-cog"></i>
          Manage Classes
        </button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <h3 class="card-title">Analytics Dashboard</h3>
        <p class="card-description">
          Access detailed analytics and reports on student performance, engagement 
          metrics, and learning outcomes to optimize your teaching strategies.
        </p>
        <button class="card-btn">
          <i class="fas fa-analytics"></i>
          View Analytics
        </button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-edit"></i>
        </div>
        <h3 class="card-title">Content Creation</h3>
        <p class="card-description">
          Create interactive learning materials, assessments, and educational content 
          tailored to your students' needs and learning objectives.
        </p>
        <button class="card-btn">
          <i class="fas fa-plus"></i>
          Create Content
        </button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">
          <i class="fas fa-bell"></i>
        </div>
        <h3 class="card-title">Notifications</h3>
        <p class="card-description">
          Stay updated with real-time notifications about student progress, 
          assignments, and important announcements.
        </p>
        <button class="card-btn">
          <i class="fas fa-envelope"></i>
          View Notifications
        </button>
      </div>
    `;
  }
}

// Navigation functions
function navigateToGame() {
  window.location.href = 'game/index.html';
}

function viewProgress() {
  window.location.href = 'progress.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}

// Initialize page
window.onload = function () {
  // Hide loading screen
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
  }, 1000);

  initParticles();
  const userRole = getUserInfo();
  generateDashboardCards(userRole);

  // Attach logout event listener (CSP-compliant)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
};
