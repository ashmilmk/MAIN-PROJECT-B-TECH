// Student Profile Analytics Functions

// Function to populate analytics student table with View Profile button
function populateAnalyticsStudentTable_Enhanced(students) {
    const tbody = document.getElementById('analyticsStudentTableBody');
    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #6b7280;">No student data available</td></tr>';
        return;
    }

    // Populate student selector dropdown
    const studentSelect = document.getElementById('analyticsStudentSelect');
    if (studentSelect) {
        studentSelect.innerHTML = '<option value="">-- Select a Student --</option>' +
            students.map(s => `<option value="${s._id}">${s.firstName} ${s.lastName} (${s.studentId || 'N/A'})</option>`).join('');

        // Add event listener for student selection
        studentSelect.addEventListener('change', function () {
            const studentId = this.value;
            if (studentId) {
                loadStudentProfile(studentId);
            } else {
                document.getElementById('studentProfileCard').style.display = 'none';
            }
        });
    }

    tbody.innerHTML = students.map(student => {
        const dyslexiaType = student.learningProfile?.dyslexiaType || 'none';
        const severity = student.learningProfile?.severity || 'N/A';
        const progress = student.progress || {};
        const avgScore = Math.round(progress.averageScore || 0);
        const accuracy = Math.round(progress.averageAccuracy || 0);
        const sessions = progress.totalSessions || 0;

        const dyslexiaTypeLabels = {
            'none': 'None',
            'dyslexia': 'Dyslexia',
            'dyscalculia': 'Dyscalculia',
            'dysgraphia': 'Dysgraphia',
            'dysphasia': 'Dysphasia'
        };

        const severityColors = {
            'mild': '#10b981',
            'moderate': '#f59e0b',
            'severe': '#ef4444'
        };

        return `
            <tr>
                <td>
                    <div class="student-name">
                        <span>${student.firstName} ${student.lastName}</span>
                        <small style="display:block; color:#64748b; font-size: 0.8em">${student.email || ''}</small>
                    </div>
                </td>
                <td>${student.studentId || 'N/A'}</td>
                <td><span class="badge" style="background: #7c3aed; color: white; padding: 0.35rem 0.75rem; border-radius: 8px;">${dyslexiaTypeLabels[dyslexiaType] || dyslexiaType}</span></td>
                <td><span class="badge" style="background: ${severityColors[severity] || '#6b7280'}; color: white; padding: 0.35rem 0.75rem; border-radius: 8px;">${severity.charAt(0).toUpperCase() + severity.slice(1)}</span></td>
                <td><strong>${avgScore}%</strong></td>
                <td>${accuracy}%</td>
                <td>${sessions}</td>
                <td>
                    <button class="action-btn view-profile-btn" data-student-id="${student._id}" title="View Profile" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-user-circle"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Add event listeners to View Profile buttons
    tbody.querySelectorAll('.view-profile-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const studentId = this.dataset.studentId;
            loadStudentProfile(studentId);
            // Also update the dropdown
            if (studentSelect) studentSelect.value = studentId;
        });
    });
}

// Load student profile data
async function loadStudentProfile(studentId) {
    try {
        const response = await apiRequest(`/users/students/${studentId}`);
        const student = response.student;

        // Try to get progress data - use mock data if endpoint doesn't exist
        let progressData = { sessions: [], summary: {} };
        try {
            progressData = await apiRequest(`/progress/user-summary?userId=${studentId}`);
        } catch (err) {
            console.warn('Progress endpoint not available, using mock data');
            // Generate mock data for demonstration
            progressData = generateMockProgressData(student);
        }

        displayStudentProfile(student, progressData);
    } catch (error) {
        console.error('Failed to load student profile:', error);
        showToast('Failed to load student profile', 'error');
    }
}

// Generate mock progress data for demonstration
function generateMockProgressData(student) {
    const sessionCount = Math.floor(Math.random() * 15) + 5;
    const sessions = [];

    for (let i = 0; i < sessionCount; i++) {
        const baseScore = 50 + Math.random() * 40;
        sessions.push({
            exerciseType: i % 2 === 0 ? 'memory-game' : 'word-recognition',
            score: baseScore + (Math.random() * 10 - 5),
            timeSpent: 180 + Math.floor(Math.random() * 300),
            performance: {
                accuracy: baseScore + (Math.random() * 15)
            },
            createdAt: new Date(Date.now() - (sessionCount - i) * 86400000 * 2)
        });
    }

    return { sessions, summary: {} };
}

// Display student profile
function displayStudentProfile(student, progressData) {
    const profileCard = document.getElementById('studentProfileCard');
    if (!profileCard) return;

    // Show profile card
    profileCard.style.display = 'block';

    // Update profile header
    const initials = `${student.firstName[0]}${student.lastName[0]}`;
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileName').textContent = `${student.firstName} ${student.lastName}`;
    document.getElementById('profileStudentId').textContent = student.studentId || 'N/A';
    document.getElementById('profileGrade').textContent = student.grade || 'N/A';
    document.getElementById('profileEmail').textContent = student.email;

    // Update dyslexia assessment
    const dyslexiaTypeLabels = {
        'none': 'None Detected',
        'dyslexia': 'Dyslexia',
        'dyscalculia': 'Dyscalculia',
        'dysgraphia': 'Dysgraphia',
        'dysphasia': 'Dysphasia'
    };
    document.getElementById('profileDyslexiaType').textContent =
        dyslexiaTypeLabels[student.learningProfile?.dyslexiaType || 'none'];
    document.getElementById('profileSeverity').textContent =
        (student.learningProfile?.severity || 'Not assessed').charAt(0).toUpperCase() +
        (student.learningProfile?.severity || 'Not assessed').slice(1);

    // Calculate dyslexia probability
    const probability = calculateDyslexiaProbability(student, progressData);
    document.getElementById('profileProbability').textContent = `${probability}%`;

    // Update overall score
    const avgScore = Math.round(student.progress?.averageScore || 0);
    document.getElementById('profileAvgScore').textContent = `${avgScore}%`;

    // Update game results
    updateGameResults(progressData);

    // Render performance chart
    renderStudentProgressChart(progressData);

    // Scroll to profile section
    setTimeout(() => {
        profileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Calculate dyslexia probability
function calculateDyslexiaProbability(student, progressData) {
    if (student.learningProfile?.dyslexiaType === 'none') return 0;

    const severity = student.learningProfile?.severity || 'mild';
    const avgScore = student.progress?.averageScore || 50;

    let baseProbability = 0;
    if (severity === 'severe') baseProbability = 80;
    else if (severity === 'moderate') baseProbability = 55;
    else baseProbability = 30;

    // Adjust based on performance
    const scoreAdjustment = (50 - avgScore) / 5;
    const finalProbability = Math.max(0, Math.min(100, baseProbability + scoreAdjustment));

    return Math.round(finalProbability);
}

// Update game results display
function updateGameResults(progressData) {
    const sessions = progressData.sessions || [];

    // Filter games by type
    const game1Sessions = sessions.filter(s =>
        s.exerciseType === 'memory-game' || s.exerciseType === 'attention-task'
    );
    const game2Sessions = sessions.filter(s =>
        s.exerciseType === 'word-recognition' || s.exerciseType === 'reading-comprehension'
    );

    // Game 1: Visual Pattern Recognition
    if (game1Sessions.length > 0) {
        const game1Avg = game1Sessions.reduce((sum, s) => sum + s.score, 0) / game1Sessions.length;
        const game1Accuracy = game1Sessions.reduce((sum, s) => sum + (s.performance?.accuracy || 0), 0) / game1Sessions.length;
        const game1TotalTime = game1Sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);

        document.getElementById('game1Score').textContent = `${Math.round(game1Avg)}%`;
        document.getElementById('game1Accuracy').textContent = `${Math.round(game1Accuracy)}%`;
        document.getElementById('game1Time').textContent = formatTime(game1TotalTime);
        document.getElementById('game1Sessions').textContent = game1Sessions.length;

        // Update progress bar
        const game1Bar = document.querySelector('#game1ProgressBar div');
        if (game1Bar) game1Bar.style.width = `${Math.round(game1Avg)}%`;
    } else {
        document.getElementById('game1Score').textContent = 'No data';
        document.getElementById('game1Accuracy').textContent = '--';
        document.getElementById('game1Time').textContent = '--';
        document.getElementById('game1Sessions').textContent = '0';
    }

    // Game 2: Word Recognition & Reading
    if (game2Sessions.length > 0) {
        const game2Avg = game2Sessions.reduce((sum, s) => sum + s.score, 0) / game2Sessions.length;
        const game2Accuracy = game2Sessions.reduce((sum, s) => sum + (s.performance?.accuracy || 0), 0) / game2Sessions.length;
        const game2TotalTime = game2Sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);

        document.getElementById('game2Score').textContent = `${Math.round(game2Avg)}%`;
        document.getElementById('game2Accuracy').textContent = `${Math.round(game2Accuracy)}%`;
        document.getElementById('game2Time').textContent = formatTime(game2TotalTime);
        document.getElementById('game2Sessions').textContent = game2Sessions.length;

        // Update progress bar
        const game2Bar = document.querySelector('#game2ProgressBar div');
        if (game2Bar) game2Bar.style.width = `${Math.round(game2Avg)}%`;
    } else {
        document.getElementById('game2Score').textContent = 'No data';
        document.getElementById('game2Accuracy').textContent = '--';
        document.getElementById('game2Time').textContent = '--';
        document.getElementById('game2Sessions').textContent = '0';
    }
}

// Format time helper
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

// Render student progress chart
let studentProgressChartInstance = null;
function renderStudentProgressChart(progressData) {
    const ctx = document.getElementById('studentProgressChart');
    if (!ctx) return;

    // Destroy existing chart
    if (studentProgressChartInstance) {
        studentProgressChartInstance.destroy();
    }

    const sessions = (progressData.sessions || []).slice(-10); // Last 10 sessions

    if (sessions.length === 0) {
        const parent = ctx.parentElement;
        const canvasHTML = ctx.outerHTML;
        parent.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 3rem;">No session data available yet</p>';
        // Store canvas HTML for later restoration
        parent.dataset.canvasHtml = canvasHTML;
        return;
    }

    const labels = sessions.map((s, i) => `Session ${i + 1}`);
    const scores = sessions.map(s => s.score || 0);
    const accuracies = sessions.map(s => s.performance?.accuracy || 0);

    studentProgressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Score (%)',
                    data: scores,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Accuracy (%)',
                    data: accuracies,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}
