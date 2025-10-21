// Game State
let gameState = {
    playerName: '',
    ageGroup: 'young', // young, middle, older
    currentChallenge: 0,
    score: 0,
    talentScores: {
        creativity: 0,
        logic: 0,
        memory: 0,
        observation: 0,
        problemSolving: 0,
        // New learning disorder-specific categories
        dyscalculia: 0,
        dysphasia: 0,
        dysgraphia: 0
    },
    challenges: [],
    accessibility: {
        largeFont: false,
        highContrast: false,
        dyslexiaFont: false,
        readingGuide: false
    },
    speechSynthesis: null,
    preferredVoice: null,
    // Add disorder assessment tracking
    disorderAssessment: {
        dyscalculiaScore: 0,
        dysphasiaScore: 0,
        dysgraphiaScore: 0,
        totalDyscalculiaChallenges: 0,
        totalDysphasiaChallenges: 0,
        totalDysgraphiaChallenges: 0
    }
};

// Cached handlers for reading guide events
let readingGuideMouseMoveHandler = null;
let readingGuideFocusHandler = null;

// Try to pick a friendly female English voice that kids enjoy
function selectPreferredVoice(voices) {
    if (!voices || voices.length === 0) return null;
    const priorityNames = [
        'Microsoft Aria',
        'Microsoft Jenny',
        'Microsoft Zira',
        'Google UK English Female',
        'Google US English',
        'Samantha',
        'Karen',
        'Victoria'
    ];
    for (const name of priorityNames) {
        const match = voices.find(v => v.name && v.name.toLowerCase().includes(name.toLowerCase()));
        if (match) return match;
    }
    const englishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    return englishVoices[0] || voices[0] || null;
}

// Age-appropriate challenge data with learning disorder focus
const challengesByAge = {
    young: [
        // Dyscalculia Challenges (Math difficulties)
        {
            id: 1,
            title: "🔢 Number Recognition Challenge",
            description: "Look at these numbers and tell me which one is the largest!",
            type: "dyscalculia",
            content: "Which number is the largest?\n\n🔢 7  🔢 12  🔢 5  🔢 9",
            options: ["7", "12", "5", "9"],
            correctAnswer: 1,
            maxScore: 10,
            typeLabel: "Dyscalculia Support"
        },
        {
            id: 2,
            title: "🧮 Simple Addition Puzzle",
            description: "Count the objects and add them together!",
            type: "dyscalculia",
            content: "🍎🍎🍎 + 🍌🍌 = ?\n\nHow many fruits are there in total?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 2,
            maxScore: 10,
            typeLabel: "Dyscalculia Support"
        },
        // Dysphasia Challenges (Language difficulties)
        {
            id: 3,
            title: "🗣️ Word Association Game",
            description: "Find the word that goes best with the picture!",
            type: "dysphasia",
            content: "🐕 What word best describes this animal?",
            options: ["Cat", "Dog", "Bird", "Fish"],
            correctAnswer: 1,
            maxScore: 10,
            typeLabel: "Dysphasia Support"
        },
        {
            id: 4,
            title: "📝 Sentence Completion",
            description: "Complete the sentence with the right word!",
            type: "dysphasia",
            content: "The sky is _____ today.\n\nWhat color is the sky usually?",
            options: ["Green", "Blue", "Red", "Yellow"],
            correctAnswer: 1,
            maxScore: 10,
            typeLabel: "Dysphasia Support"
        },
        // Dysgraphia Challenges (Writing difficulties)
        {
            id: 5,
            title: "✏️ Letter Recognition",
            description: "Find the letter that matches the sound!",
            type: "dysgraphia",
            content: "Which letter makes the 'sss' sound?\n\n🔤 A  🔤 B  🔤 C  🔤 S",
            options: ["A", "B", "C", "S"],
            correctAnswer: 3,
            maxScore: 10,
            typeLabel: "Dysgraphia Support"
        },
        {
            id: 6,
            title: "📖 Word Building",
            description: "Put the letters together to make a word!",
            type: "dysgraphia",
            content: "C + A + T = ?\n\nWhat word do these letters spell?",
            options: ["Dog", "Cat", "Hat", "Bat"],
            correctAnswer: 1,
            maxScore: 10,
            typeLabel: "Dysgraphia Support"
        }
    ],
    middle: [
        // Dyscalculia Challenges (Harder)
        {
            id: 1,
            title: "🧮 Multi-Step Math Problem",
            description: "Solve this step-by-step math problem!",
            type: "dyscalculia",
            content: "If you have 15 apples and give away 3, then buy 7 more, how many do you have?",
            options: ["16", "19", "22", "25"],
            correctAnswer: 1,
            maxScore: 15,
            typeLabel: "Dyscalculia Support"
        },
        {
            id: 2,
            title: "⏰ Time Calculation Challenge",
            description: "Calculate the time difference!",
            type: "dyscalculia",
            content: "If it's 2:30 PM now, what time will it be in 2 hours and 45 minutes?",
            options: ["4:15 PM", "5:15 PM", "5:30 PM", "6:15 PM"],
            correctAnswer: 1,
            maxScore: 15,
            typeLabel: "Dyscalculia Support"
        },
        // Dysphasia Challenges (Harder)
        {
            id: 3,
            title: "📚 Complex Word Meanings",
            description: "Choose the word that means the opposite!",
            type: "dysphasia",
            content: "What is the opposite of 'happy'?",
            options: ["Joyful", "Sad", "Excited", "Calm"],
            correctAnswer: 1,
            maxScore: 15,
            typeLabel: "Dysphasia Support"
        },
        {
            id: 4,
            title: "🔤 Grammar Challenge",
            description: "Complete the sentence with the correct grammar!",
            type: "dysphasia",
            content: "She _____ to the store yesterday.\n\nWhich word fits best?",
            options: ["go", "goes", "went", "going"],
            correctAnswer: 2,
            maxScore: 15,
            typeLabel: "Dysphasia Support"
        },
        // Dysgraphia Challenges (Harder)
        {
            id: 5,
            title: "📝 Spelling Challenge",
            description: "Choose the correctly spelled word!",
            type: "dysgraphia",
            content: "Which word is spelled correctly?",
            options: ["Recieve", "Receive", "Receeve", "Receve"],
            correctAnswer: 1,
            maxScore: 15,
            typeLabel: "Dysgraphia Support"
        },
        {
            id: 6,
            title: "🔤 Word Pattern Recognition",
            description: "Find the word that follows the same pattern!",
            type: "dysgraphia",
            content: "If 'run' becomes 'running', what does 'jump' become?",
            options: ["Jumping", "Jumpping", "Jumped", "Jumps"],
            correctAnswer: 0,
            maxScore: 15,
            typeLabel: "Dysgraphia Support"
        }
    ],
    older: [
        // Dyscalculia Challenges (Advanced)
        {
            id: 1,
            title: "🧮 Fraction and Decimal Challenge",
            description: "Convert between fractions and decimals!",
            type: "dyscalculia",
            content: "What is 3/4 as a decimal?",
            options: ["0.25", "0.5", "0.75", "0.8"],
            correctAnswer: 2,
            maxScore: 20,
            typeLabel: "Dyscalculia Support"
        },
        {
            id: 2,
            title: "📊 Percentage Problem",
            description: "Calculate the percentage!",
            type: "dyscalculia",
            content: "If 20% of a number is 40, what is the number?",
            options: ["80", "100", "200", "400"],
            correctAnswer: 2,
            maxScore: 20,
            typeLabel: "Dyscalculia Support"
        },
        // Dysphasia Challenges (Advanced)
        {
            id: 3,
            title: "📖 Reading Comprehension",
            description: "Read the passage and answer the question!",
            type: "dysphasia",
            content: "The weather was cold and rainy. Sarah decided to stay inside and read a book. She made hot chocolate and curled up on the couch.\n\nWhat did Sarah do because of the weather?",
            options: ["Went outside", "Stayed inside", "Went shopping", "Called friends"],
            correctAnswer: 1,
            maxScore: 20,
            typeLabel: "Dysphasia Support"
        },
        {
            id: 4,
            title: "🔤 Vocabulary Challenge",
            description: "Choose the word that best fits the context!",
            type: "dysphasia",
            content: "The mountain was so _____ that it took hours to climb to the top.",
            options: ["Small", "Steep", "Wide", "Short"],
            correctAnswer: 1,
            maxScore: 20,
            typeLabel: "Dysphasia Support"
        },
        // Dysgraphia Challenges (Advanced)
        {
            id: 5,
            title: "📝 Complex Spelling",
            description: "Identify the misspelled word!",
            type: "dysgraphia",
            content: "Which word is misspelled?\n\nBeautiful, Neccessary, Important, Different",
            options: ["Beautiful", "Neccessary", "Important", "Different"],
            correctAnswer: 1,
            maxScore: 20,
            typeLabel: "Dysgraphia Support"
        },
        {
            id: 6,
            title: "🔤 Word Formation",
            description: "Create a new word from the given letters!",
            type: "dysgraphia",
            content: "Using the letters in 'EDUCATION', can you make the word 'CAT'?",
            options: ["Yes", "No", "Maybe", "I don't know"],
            correctAnswer: 0,
            maxScore: 20,
            typeLabel: "Dysgraphia Support"
        }
    ]
};

// DOM Elements
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultsScreen: document.getElementById('results-screen'),
    playerName: document.getElementById('player-name'),
    startGame: document.getElementById('start-game'),
    currentPlayer: document.getElementById('current-player'),
    currentScore: document.getElementById('current-score'),
    progressFill: document.getElementById('progress-fill'),
    challengeTitle: document.getElementById('challenge-title'),
    challengeDescription: document.getElementById('challenge-description'),
    challengeContent: document.getElementById('challenge-content'),
    challengeOptions: document.getElementById('challenge-options'),
    challengeType: document.getElementById('challenge-type'),
    nextChallenge: document.getElementById('next-challenge'),
    restartGame: document.getElementById('restart-game'),
    finalScore: document.getElementById('final-score'),
    talentResults: document.getElementById('talent-results'),
    playAgain: document.getElementById('play-again'),
    backToWelcome: document.getElementById('back-to-welcome'),
    viewProgress: document.getElementById('view-progress'),
    // Accessibility elements
    fontSizeToggle: document.getElementById('font-size-toggle'),
    highContrastToggle: document.getElementById('high-contrast-toggle'),
    dyslexiaFontToggle: document.getElementById('dyslexia-font-toggle'),
    readingGuideToggle: document.getElementById('reading-guide-toggle'),
    readingGuide: document.getElementById('reading-guide')
};

// Initialize Game
function initGame() {
    // Initialize challenges based on default age group
    gameState.challenges = [...challengesByAge[gameState.ageGroup]].sort(() => Math.random() - 0.5);
    
    // Initialize speech synthesis
    initSpeechSynthesis();
    
    // Event Listeners
    elements.startGame.addEventListener('click', startGame);
    elements.nextChallenge.addEventListener('click', nextChallenge);
    elements.restartGame.addEventListener('click', restartGame);
    elements.playAgain.addEventListener('click', playAgain);
    elements.backToWelcome.addEventListener('click', backToWelcome);
    if (elements.viewProgress) {
        elements.viewProgress.addEventListener('click', viewProgress);
    }
    
    // Age group selection
    document.querySelectorAll('.age-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.age-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameState.ageGroup = e.target.dataset.age;
            gameState.challenges = [...challengesByAge[gameState.ageGroup]].sort(() => Math.random() - 0.5);
        });
    });
    
    // Accessibility controls
    elements.fontSizeToggle.addEventListener('click', toggleLargeFont);
    elements.highContrastToggle.addEventListener('click', toggleHighContrast);
    elements.dyslexiaFontToggle.addEventListener('click', toggleDyslexiaFont);
    elements.readingGuideToggle.addEventListener('click', toggleReadingGuide);
    
    // Enter key for player name
    elements.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
    
    // Add student background animations
    addStudentBackgroundAnimations();
    
    // Initialize accessibility features
    initAccessibility();
}

// Navigate to Progress Page
function viewProgress() {
    try {
        // Ensure the latest player name is stored for filtering on progress page
        if (gameState.playerName && typeof gameState.playerName === 'string') {
            localStorage.setItem('userName', gameState.playerName);
        }
    } catch (e) {
        console.warn('Unable to sync userName to localStorage before navigating to progress page.', e);
    }
    window.location.href = '../progress.html';
}

// Initialize speech synthesis
function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
        gameState.speechSynthesis = window.speechSynthesis;
        const assignVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) {
                gameState.preferredVoice = selectPreferredVoice(voices);
            }
        };
        // Some browsers load voices asynchronously
        window.speechSynthesis.onvoiceschanged = assignVoices;
        assignVoices();
    } else {
        console.log('Speech synthesis not supported');
    }
}

// Speak text function
function speakText(text, rate = 0.9, pitch = 1.1) {
    if (!gameState.speechSynthesis) return;
    // Cancel any ongoing speech
    gameState.speechSynthesis.cancel();

    const attemptSpeak = (retriesLeft = 3) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;
        utterance.lang = 'en-US';

        const voices = gameState.speechSynthesis.getVoices();
        if ((!voices || voices.length === 0) && retriesLeft > 0) {
            setTimeout(() => attemptSpeak(retriesLeft - 1), 300);
            return;
        }
        if (!gameState.preferredVoice && voices && voices.length) {
            gameState.preferredVoice = selectPreferredVoice(voices);
        }
        if (gameState.preferredVoice) {
            utterance.voice = gameState.preferredVoice;
        }
        gameState.speechSynthesis.speak(utterance);
    };
    attemptSpeak(3);
}

// Initialize accessibility features
function initAccessibility() {
    // Check for saved preferences
    const savedPrefs = localStorage.getItem('studentGameAccessibility');
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        gameState.accessibility = { ...gameState.accessibility, ...prefs };
        applyAccessibilitySettings();
    }
}

// Apply accessibility settings
function applyAccessibilitySettings() {
    const body = document.body;
    
    // Large font
    if (gameState.accessibility.largeFont) {
        body.classList.add('large-font');
        elements.fontSizeToggle.classList.add('active');
    } else {
        body.classList.remove('large-font');
        elements.fontSizeToggle.classList.remove('active');
    }
    
    // High contrast
    if (gameState.accessibility.highContrast) {
        body.classList.add('high-contrast');
        elements.highContrastToggle.classList.add('active');
    } else {
        body.classList.remove('high-contrast');
        elements.highContrastToggle.classList.remove('active');
    }
    
    // Dyslexia font
    if (gameState.accessibility.dyslexiaFont) {
        body.classList.add('dyslexia-font');
        elements.dyslexiaFontToggle.classList.add('active');
    } else {
        body.classList.remove('dyslexia-font');
        elements.dyslexiaFontToggle.classList.remove('active');
    }
    
    // Reading guide
    if (gameState.accessibility.readingGuide) {
        elements.readingGuide.classList.add('active');
        elements.readingGuideToggle.classList.add('active');
    } else {
        elements.readingGuide.classList.remove('active');
        elements.readingGuideToggle.classList.remove('active');
    }
    
    // Save preferences
    localStorage.setItem('studentGameAccessibility', JSON.stringify(gameState.accessibility));
}

// Toggle large font
function toggleLargeFont() {
    gameState.accessibility.largeFont = !gameState.accessibility.largeFont;
    applyAccessibilitySettings();
}

// Toggle high contrast
function toggleHighContrast() {
    gameState.accessibility.highContrast = !gameState.accessibility.highContrast;
    applyAccessibilitySettings();
}

// Toggle dyslexia font
function toggleDyslexiaFont() {
    gameState.accessibility.dyslexiaFont = !gameState.accessibility.dyslexiaFont;
    applyAccessibilitySettings();
}

// Toggle reading guide with speech
function toggleReadingGuide() {
    gameState.accessibility.readingGuide = !gameState.accessibility.readingGuide;
    applyAccessibilitySettings();
    
    // If reading guide is activated, speak the current challenge
    if (gameState.accessibility.readingGuide && gameState.currentChallenge < gameState.challenges.length) {
        const challenge = gameState.challenges[gameState.currentChallenge];
        const textToSpeak = `${challenge.title}. ${challenge.description}. ${challenge.content}`;
        speakText(textToSpeak, 0.9, 1.1);
        
        // Enable reading guide line with focus only (no mouse tracking)
        if (!readingGuideFocusHandler) {
            readingGuideFocusHandler = (e) => {
                if (!e || !e.target || !elements.readingGuide) return;
                const rect = e.target.getBoundingClientRect?.();
                if (rect) {
                    const midY = rect.top + rect.height / 2;
                    elements.readingGuide.style.top = `${Math.max(0, midY)}px`;
                }
            };
        }
        document.addEventListener('focusin', readingGuideFocusHandler, true);
        // Allow quick toggle off with Escape key
        const onEsc = (e) => {
            if (e.key === 'Escape') {
                gameState.accessibility.readingGuide = false;
                applyAccessibilitySettings();
                document.removeEventListener('focusin', readingGuideFocusHandler, true);
                document.removeEventListener('keydown', onEsc, true);
            }
        };
        document.addEventListener('keydown', onEsc, true);
    } else {
        // Disable movement listeners when guide is off
        if (readingGuideFocusHandler) {
            document.removeEventListener('focusin', readingGuideFocusHandler, true);
        }
    }
}

// Add student background animations
function addStudentBackgroundAnimations() {
    const studentIcons = document.querySelectorAll('.floating-student-icon');
    
    studentIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
    });
}

// Create celebration effect
function createCelebration() {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            border-radius: 50%;
            animation: confetti-fall 3s linear infinite;
            z-index: 1000;
            pointer-events: none;
        `;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 6000);
    }
}

// Start Game
function startGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        showMessage('Please enter your name to start your learning adventure!', 'warning');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.currentChallenge = 0;
    gameState.score = 0;
    gameState.talentScores = {
        creativity: 0,
        logic: 0,
        memory: 0,
        observation: 0,
        problemSolving: 0,
        dyscalculia: 0,
        dysphasia: 0,
        dysgraphia: 0
    };
    
    // Reset disorder assessment
    gameState.disorderAssessment = {
        dyscalculiaScore: 0,
        dysphasiaScore: 0,
        dysgraphiaScore: 0,
        totalDyscalculiaChallenges: 0,
        totalDysphasiaChallenges: 0,
        totalDysgraphiaChallenges: 0
    };
    
    // Shuffle challenges for this session
    gameState.challenges = [...challengesByAge[gameState.ageGroup]].sort(() => Math.random() - 0.5);
    
    showScreen('game-screen');
    updateGameUI();
    displayChallenge();
    
    // Create celebration for starting
    createCelebration();
}

// Show Screen
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
}

// Update Game UI
function updateGameUI() {
    elements.currentPlayer.textContent = gameState.playerName;
    elements.currentScore.textContent = gameState.score;
    
    const progress = ((gameState.currentChallenge + 1) / gameState.challenges.length) * 100;
    elements.progressFill.style.width = progress + '%';
}

// Display Challenge
function displayChallenge() {
    if (gameState.currentChallenge >= gameState.challenges.length) {
        showResults();
        return;
    }
    
    const challenge = gameState.challenges[gameState.currentChallenge];
    
    elements.challengeTitle.textContent = challenge.title;
    elements.challengeDescription.textContent = challenge.description;
    elements.challengeContent.innerHTML = challenge.content;
    elements.challengeType.textContent = challenge.typeLabel;
    
    // Clear previous options
    elements.challengeOptions.innerHTML = '';
    
    if (challenge.options) {
        challenge.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => selectAnswer(index));
            elements.challengeOptions.appendChild(button);
        });
    } else {
        // For creativity challenges without options - Dyslexia-friendly textarea
        const input = document.createElement('textarea');
        input.placeholder = 'Describe your creative answer here...';
        input.style.cssText = `
            width: 100%;
            height: 150px;
            padding: 20px;
            border-radius: 15px;
            border: 3px solid var(--border-light);
            font-family: inherit;
            font-size: 1.1rem;
            resize: none;
            background: white;
            box-shadow: 0 5px 15px var(--shadow-light);
            line-height: 1.5;
            letter-spacing: 0.02em;
            color: var(--text-dark);
        `;
        elements.challengeOptions.appendChild(input);
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'option-btn';
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Your Answer';
        submitBtn.style.marginTop = '15px';
        submitBtn.addEventListener('click', () => submitCreativeAnswer(input.value));
        elements.challengeOptions.appendChild(submitBtn);
    }
    
    updateGameUI();
    
    // If reading guide is active, speak the challenge
    if (gameState.accessibility.readingGuide) {
        const textToSpeak = `${challenge.title}. ${challenge.description}. ${challenge.content}`;
        speakText(textToSpeak, 0.7, 1);
    }
}

// Select Answer
function selectAnswer(selectedIndex) {
    const challenge = gameState.challenges[gameState.currentChallenge];
    const buttons = elements.challengeOptions.querySelectorAll('.option-btn');
    
    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);
    
    // Track disorder-specific performance
    if (challenge.type === 'dyscalculia') {
        gameState.disorderAssessment.totalDyscalculiaChallenges++;
        if (selectedIndex === challenge.correctAnswer) {
            gameState.disorderAssessment.dyscalculiaScore += challenge.maxScore;
        }
    } else if (challenge.type === 'dysphasia') {
        gameState.disorderAssessment.totalDysphasiaChallenges++;
        if (selectedIndex === challenge.correctAnswer) {
            gameState.disorderAssessment.dysphasiaScore += challenge.maxScore;
        }
    } else if (challenge.type === 'dysgraphia') {
        gameState.disorderAssessment.totalDysgraphiaChallenges++;
        if (selectedIndex === challenge.correctAnswer) {
            gameState.disorderAssessment.dysgraphiaScore += challenge.maxScore;
        }
    }
    
    if (selectedIndex === challenge.correctAnswer) {
        buttons[selectedIndex].classList.add('correct');
        gameState.score += challenge.maxScore;
        gameState.talentScores[challenge.type] += challenge.maxScore;
        
        // Show success message with celebration
        showMessage('🎉 Correct! Excellent work! 🎉', 'success');
        createCelebration();
        
        // Speak success message
        if (gameState.accessibility.readingGuide) {
            speakText('Correct! Excellent work!', 0.8, 1.2);
        }
    } else {
        buttons[selectedIndex].classList.add('incorrect');
        buttons[challenge.correctAnswer].classList.add('correct');
        
        // Show encouraging feedback
        showMessage('💡 Great try! The correct answer was highlighted. Keep going! 💪', 'info');
        
        // Speak feedback
        if (gameState.accessibility.readingGuide) {
            speakText('Great try! The correct answer was highlighted. Keep going!', 0.8, 1);
        }
    }
    
    // Enable next challenge button
    elements.nextChallenge.disabled = false;
}

// Submit Creative Answer
function submitCreativeAnswer(answer) {
    const challenge = gameState.challenges[gameState.currentChallenge];
    
    if (answer.trim()) {
        // For creativity challenges, give points for participation and effort
        const score = Math.min(challenge.maxScore, Math.floor(answer.length / 10) + 5);
        gameState.score += score;
        gameState.talentScores[challenge.type] += score;
        
        showMessage(`🎨 Creative answer! You earned ${score} points! ✨`, 'success');
        createCelebration();
        
        // Speak success message
        if (gameState.accessibility.readingGuide) {
            speakText(`Creative answer! You earned ${score} points!`, 0.8, 1.2);
        }
    } else {
        showMessage('Please write something creative and thoughtful!', 'warning');
        
        // Speak warning
        if (gameState.accessibility.readingGuide) {
            speakText('Please write something creative and thoughtful!', 0.8, 1);
        }
        return;
    }
    
    elements.nextChallenge.disabled = false;
}

// Show Message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        padding: 20px 25px;
        border-radius: 15px;
        color: white;
        font-weight: 600;
        font-size: 1.1rem;
        z-index: 1000;
        animation: slideInRight 0.6s ease;
        box-shadow: 0 10px 30px var(--shadow-medium);
        max-width: 400px;
        text-align: center;
        line-height: 1.4;
        letter-spacing: 0.02em;
    `;
    
    switch (type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(45deg, var(--accent-green), var(--accent-purple))';
            break;
        case 'info':
            messageDiv.style.background = 'linear-gradient(45deg, var(--primary-blue), var(--secondary-blue))';
            break;
        case 'warning':
            messageDiv.style.background = 'linear-gradient(45deg, var(--accent-orange), #f97316)';
            break;
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.6s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 600);
    }, 4000);
}

// Next Challenge
function nextChallenge() {
    gameState.currentChallenge++;
    elements.nextChallenge.disabled = true;
    displayChallenge();
}

// Assess learning disorders
function assessLearningDisorders() {
    const assessment = gameState.disorderAssessment;
    const disorders = [];
    
    // Calculate percentages for each disorder type
    const dyscalculiaPercentage = assessment.totalDyscalculiaChallenges > 0 ? 
        (assessment.dyscalculiaScore / (assessment.totalDyscalculiaChallenges * 15)) * 100 : 0;
    
    const dysphasiaPercentage = assessment.totalDysphasiaChallenges > 0 ? 
        (assessment.dysphasiaScore / (assessment.totalDysphasiaChallenges * 15)) * 100 : 0;
    
    const dysgraphiaPercentage = assessment.totalDysgraphiaChallenges > 0 ? 
        (assessment.dysgraphiaScore / (assessment.totalDysgraphiaChallenges * 15)) * 100 : 0;
    
    // Determine potential disorders based on performance thresholds
    if (dyscalculiaPercentage < 60 && assessment.totalDyscalculiaChallenges >= 2) {
        disorders.push({
            name: 'Dyscalculia',
            description: 'Difficulty with numbers and mathematical concepts',
            percentage: Math.round(dyscalculiaPercentage),
            severity: dyscalculiaPercentage < 40 ? 'High' : 'Moderate',
            icon: '🔢'
        });
    }
    
    if (dysphasiaPercentage < 60 && assessment.totalDysphasiaChallenges >= 2) {
        disorders.push({
            name: 'Dysphasia',
            description: 'Language processing and communication difficulties',
            percentage: Math.round(dysphasiaPercentage),
            severity: dysphasiaPercentage < 40 ? 'High' : 'Moderate',
            icon: '🗣️'
        });
    }
    
    if (dysgraphiaPercentage < 60 && assessment.totalDysgraphiaChallenges >= 2) {
        disorders.push({
            name: 'Dysgraphia',
            description: 'Writing and spelling difficulties',
            percentage: Math.round(dysgraphiaPercentage),
            severity: dysgraphiaPercentage < 40 ? 'High' : 'Moderate',
            icon: '✏️'
        });
    }
    
    return disorders;
}

// Show Results
function showResults() {
    const totalPossible = gameState.challenges.length * 15; // Average score across new difficulties
    const percentage = Math.round((gameState.score / totalPossible) * 100);
    
    // Create celebration effect
    createCelebration();
    
    elements.finalScore.textContent = `Final Score: ${gameState.score}/${totalPossible} (${percentage}%)`;
    
    // Display talent breakdown
    elements.talentResults.innerHTML = '';
    Object.entries(gameState.talentScores).forEach(([talent, score]) => {
        if (score > 0) { // Only show categories with scores
            const talentItem = document.createElement('div');
            talentItem.className = 'talent-item';
            
            const talentName = document.createElement('span');
            talentName.className = 'talent-name';
            talentName.textContent = getTalentDisplayName(talent);
            
            const talentScore = document.createElement('span');
            talentScore.className = 'talent-score';
            talentScore.textContent = `${score} points`;
            
            talentItem.appendChild(talentName);
            talentItem.appendChild(talentScore);
            elements.talentResults.appendChild(talentItem);
        }
    });
    
    // Add learning disorder assessment
    const disorders = assessLearningDisorders();
    if (disorders.length > 0) {
        const disorderSection = document.createElement('div');
        disorderSection.className = 'disorder-assessment';
        disorderSection.style.cssText = `
            margin-top: 30px;
            padding: 25px;
            background: linear-gradient(45deg, #fef3c7, #fde68a);
            border-radius: 20px;
            border: 2px solid #f59e0b;
        `;
        
        const disorderTitle = document.createElement('h3');
        disorderTitle.textContent = '🎯 Learning Assessment Results';
        disorderTitle.style.cssText = `
            color: #92400e;
            font-size: 1.5rem;
            margin-bottom: 20px;
            text-align: center;
        `;
        disorderSection.appendChild(disorderTitle);
        
        const disorderDescription = document.createElement('p');
        disorderDescription.textContent = 'Based on your performance, you may benefit from additional support in these areas:';
        disorderDescription.style.cssText = `
            color: #92400e;
            text-align: center;
            margin-bottom: 20px;
            font-size: 1.1rem;
        `;
        disorderSection.appendChild(disorderDescription);
        
        disorders.forEach(disorder => {
            const disorderCard = document.createElement('div');
            disorderCard.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 15px;
                margin: 15px 0;
                border: 2px solid #f59e0b;
                box-shadow: 0 5px 15px rgba(245, 158, 11, 0.2);
            `;
            
            const disorderHeader = document.createElement('div');
            disorderHeader.style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 10px;
            `;
            
            const disorderIcon = document.createElement('span');
            disorderIcon.textContent = disorder.icon;
            disorderIcon.style.fontSize = '2rem';
            
            const disorderName = document.createElement('h4');
            disorderName.textContent = disorder.name;
            disorderName.style.cssText = `
                color: #92400e;
                font-size: 1.3rem;
                margin: 0;
            `;
            
            const severityBadge = document.createElement('span');
            severityBadge.textContent = disorder.severity;
            severityBadge.style.cssText = `
                background: ${disorder.severity === 'High' ? '#ef4444' : '#f59e0b'};
                color: white;
                padding: 5px 10px;
                border-radius: 10px;
                font-size: 0.9rem;
                font-weight: 600;
                margin-left: auto;
            `;
            
            disorderHeader.appendChild(disorderIcon);
            disorderHeader.appendChild(disorderName);
            disorderHeader.appendChild(severityBadge);
            disorderCard.appendChild(disorderHeader);
            
            const disorderDesc = document.createElement('p');
            disorderDesc.textContent = disorder.description;
            disorderDesc.style.cssText = `
                color: #6b7280;
                margin: 10px 0;
                font-size: 1rem;
            `;
            disorderCard.appendChild(disorderDesc);
            
            const performanceBar = document.createElement('div');
            performanceBar.style.cssText = `
                background: #e5e7eb;
                height: 10px;
                border-radius: 5px;
                overflow: hidden;
                margin: 10px 0;
            `;
            
            const performanceFill = document.createElement('div');
            performanceFill.style.cssText = `
                background: linear-gradient(45deg, #f59e0b, #ef4444);
                height: 100%;
                width: ${disorder.percentage}%;
                transition: width 1s ease;
            `;
            
            performanceBar.appendChild(performanceFill);
            disorderCard.appendChild(performanceBar);
            
            const performanceText = document.createElement('p');
            performanceText.textContent = `Performance: ${disorder.percentage}%`;
            performanceText.style.cssText = `
                color: #92400e;
                font-weight: 600;
                margin: 5px 0 0 0;
                font-size: 0.9rem;
            `;
            disorderCard.appendChild(performanceText);
            
            disorderSection.appendChild(disorderCard);
        });
        
        const recommendation = document.createElement('div');
        recommendation.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            border: 2px solid #10b981;
        `;
        
        const recommendationText = document.createElement('p');
        recommendationText.innerHTML = `<strong>💡 Recommendation:</strong> Consider consulting with an educational specialist for a comprehensive assessment. This game is designed for educational purposes and should not replace professional diagnosis.`;
        recommendationText.style.cssText = `
            color: #065f46;
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.4;
        `;
        
        recommendation.appendChild(recommendationText);
        disorderSection.appendChild(recommendation);
        
        elements.talentResults.appendChild(disorderSection);
    }
    
    // Save game results automatically
    saveGameResults(totalPossible, percentage, disorders);
    
    showScreen('results-screen');
    
    // Speak results if reading guide is active
    if (gameState.accessibility.readingGuide) {
        let resultsText = `Congratulations! You completed your learning adventure with a score of ${gameState.score} out of ${totalPossible}. That's ${percentage} percent!`;
        
        if (disorders.length > 0) {
            resultsText += ` Based on your performance, you may benefit from additional support in ${disorders.length} area${disorders.length > 1 ? 's' : ''}. Please consult with an educational specialist for a comprehensive assessment.`;
        }
        
        speakText(resultsText, 0.7, 1);
    }
}

// Save game results to localStorage
function saveGameResults(totalPossible, percentage, disorders) {
    const gameResult = {
        id: Date.now(),
        date: new Date().toISOString(),
        playerName: gameState.playerName,
        ageGroup: gameState.ageGroup,
        score: gameState.score,
        totalPossible: totalPossible,
        percentage: percentage,
        talentScores: { ...gameState.talentScores },
        disorders: disorders,
        challengesCompleted: gameState.challenges.length,
        accessibility: { ...gameState.accessibility }
    };
    
    // Get existing results or create new array
    const existingResults = JSON.parse(localStorage.getItem('gameResults') || '[]');
    
    // Add new result
    existingResults.push(gameResult);
    
    // Keep only last 50 results to prevent localStorage overflow
    if (existingResults.length > 50) {
        existingResults.splice(0, existingResults.length - 50);
    }
    
    // Save back to localStorage
    localStorage.setItem('gameResults', JSON.stringify(existingResults));
    
    console.log('Game results saved:', gameResult);
}

// Get Talent Display Name
function getTalentDisplayName(talent) {
    const names = {
        creativity: '🎨 Creativity',
        logic: '🧩 Logic',
        memory: '🧠 Memory',
        observation: '🔍 Observation',
        problemSolving: '💡 Problem Solving',
        dyscalculia: '🔢 Dyscalculia Support',
        dysphasia: '🗣️ Dysphasia Support',
        dysgraphia: '✏️ Dysgraphia Support'
    };
    return names[talent] || talent;
}

// Restart Game
function restartGame() {
    if (confirm('Are you sure you want to restart your learning adventure?')) {
        gameState.currentChallenge = 0;
        gameState.score = 0;
        gameState.talentScores = {
            creativity: 0,
            logic: 0,
            memory: 0,
            observation: 0,
            problemSolving: 0,
            dyscalculia: 0,
            dysphasia: 0,
            dysgraphia: 0
        };
        
        // Reset disorder assessment
        gameState.disorderAssessment = {
            dyscalculiaScore: 0,
            dysphasiaScore: 0,
            dysgraphiaScore: 0,
            totalDyscalculiaChallenges: 0,
            totalDysphasiaChallenges: 0,
            totalDysgraphiaChallenges: 0
        };
        
        updateGameUI();
        displayChallenge();
    }
}

// Play Again
function playAgain() {
    gameState.currentChallenge = 0;
    gameState.score = 0;
    gameState.talentScores = {
        creativity: 0,
        logic: 0,
        memory: 0,
        observation: 0,
        problemSolving: 0,
        dyscalculia: 0,
        dysphasia: 0,
        dysgraphia: 0
    };
    
    // Reset disorder assessment
    gameState.disorderAssessment = {
        dyscalculiaScore: 0,
        dysphasiaScore: 0,
        dysgraphiaScore: 0,
        totalDyscalculiaChallenges: 0,
        totalDysphasiaChallenges: 0,
        totalDysgraphiaChallenges: 0
    };
    
    // Shuffle challenges again
    gameState.challenges = [...challengesByAge[gameState.ageGroup]].sort(() => Math.random() - 0.5);
    
    showScreen('game-screen');
    updateGameUI();
    displayChallenge();
    
    // Create celebration for new game
    createCelebration();
}

// Back to Welcome / Navigate to Level 2
function backToWelcome() {
    // Navigate to Level 2 folder
    window.location.href = '../level 2/index.html';
}

// Add CSS for enhanced animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes confetti-fall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame); 