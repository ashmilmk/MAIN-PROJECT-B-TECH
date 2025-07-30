// Game State
let gameState = {
    playerName: '',
    currentChallenge: 0,
    score: 0,
    talentScores: {
        creativity: 0,
        logic: 0,
        memory: 0,
        observation: 0,
        problemSolving: 0
    },
    challenges: []
};

// Challenge Data with more engaging content
const challenges = [
    {
        id: 1,
        title: "🎨 Creative Drawing Adventure",
        description: "Look at this magical shape and draw what you think it could be! Use your imagination! ✨",
        type: "creativity",
        content: "🎨 Draw something creative based on this magical shape: ⭐",
        options: null,
        maxScore: 10
    },
    {
        id: 2,
        title: "🧩 Pattern Recognition Quest",
        description: "What comes next in this magical pattern? Look carefully! 🔍",
        type: "logic",
        content: "🔴 🔵 🔴 🔵 🔴 ?",
        options: ["🔵", "🔴", "🟡", "🟢"],
        correctAnswer: 0,
        maxScore: 10
    },
    {
        id: 3,
        title: "🎯 Memory Magic Test",
        description: "Remember these magical items for 3 seconds, then tell me what you saw! 🧠",
        type: "memory",
        content: "🍎 🚗 🌟 🎈 🐱",
        options: ["🍎 🚗 🌟", "🍎 🚗 🌟 🎈", "🍎 🚗 🌟 🎈 🐱", "🍎 🚗 🌟 🎈 🐱 🎨"],
        correctAnswer: 2,
        maxScore: 10
    },
    {
        id: 4,
        title: "🔍 Spot the Difference Challenge",
        description: "Find what's different between these two magical pictures! Look very carefully! 👀",
        type: "observation",
        content: "Look carefully at these patterns:\n🔴🔵🔴 vs 🔴🔵🟡",
        options: ["The first pattern", "The second pattern", "The third circle", "Nothing"],
        correctAnswer: 2,
        maxScore: 10
    },
    {
        id: 5,
        title: "🧩 Puzzle Time Adventure",
        description: "Solve this magical puzzle! Think carefully! 💭",
        type: "problemSolving",
        content: "If you have 3 magical apples and give away 1, how many do you have left? 🍎",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        maxScore: 10
    },
    {
        id: 6,
        title: "🎨 Color Mixing Magic",
        description: "What color do you get when you mix blue and yellow? It's like magic! ✨",
        type: "creativity",
        content: "🔵 + 🟡 = ?",
        options: ["🔴", "🟢", "🟣", "⚫"],
        correctAnswer: 1,
        maxScore: 10
    },
    {
        id: 7,
        title: "📊 Number Sequence Quest",
        description: "What number comes next in this magical sequence? Count carefully! 🔢",
        type: "logic",
        content: "2, 4, 6, 8, ?",
        options: ["9", "10", "11", "12"],
        correctAnswer: 1,
        maxScore: 10
    },
    {
        id: 8,
        title: "🎵 Sound Patterns Adventure",
        description: "Listen to this magical rhythm pattern! Can you follow along? 🎶",
        type: "memory",
        content: "Tap: tap-tap-tap, tap-tap-tap, tap-tap-tap, ?",
        options: ["tap", "tap-tap", "tap-tap-tap", "tap-tap-tap-tap"],
        correctAnswer: 2,
        maxScore: 10
    }
];

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
    nextChallenge: document.getElementById('next-challenge'),
    restartGame: document.getElementById('restart-game'),
    finalScore: document.getElementById('final-score'),
    talentResults: document.getElementById('talent-results'),
    playAgain: document.getElementById('play-again'),
    backToWelcome: document.getElementById('back-to-welcome')
};

// Initialize Game
function initGame() {
    // Shuffle challenges for variety
    gameState.challenges = [...challenges].sort(() => Math.random() - 0.5);
    
    // Event Listeners
    elements.startGame.addEventListener('click', startGame);
    elements.nextChallenge.addEventListener('click', nextChallenge);
    elements.restartGame.addEventListener('click', restartGame);
    elements.playAgain.addEventListener('click', playAgain);
    elements.backToWelcome.addEventListener('click', backToWelcome);
    
    // Enter key for player name
    elements.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
    
    // Add sparkle effects
    addSparkleEffects();
    
    // Add floating shapes animation
    addFloatingShapes();
}

// Add sparkle effects to the welcome screen
function addSparkleEffects() {
    const welcomeContent = document.querySelector('.welcome-content');
    
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        welcomeContent.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 2000);
    }, 300);
}

// Add floating shapes animation
function addFloatingShapes() {
    const shapes = ['🌟', '🎨', '🧩', '🎯', '🔍', '💡', '🎵', '🌈', '⭐', '🎪', '🎭', '🎪'];
    const container = document.querySelector('.container');
    
    setInterval(() => {
        const shape = document.createElement('div');
        shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        shape.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            font-size: ${Math.random() * 2 + 1}rem;
            opacity: 0.3;
            pointer-events: none;
            animation: float 4s ease-in-out infinite;
            z-index: -1;
        `;
        container.appendChild(shape);
        
        setTimeout(() => {
            shape.remove();
        }, 4000);
    }, 2000);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 3}s;
            animation-duration: ${Math.random() * 2 + 2}s;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Start Game
function startGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        showMessage('✨ Please enter your magical name! ✨', 'warning');
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
        problemSolving: 0
    };
    
    showScreen('game-screen');
    updateGameUI();
    displayChallenge();
    
    // Create confetti for starting
    createConfetti();
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
    elements.currentPlayer.textContent = `🌟 ${gameState.playerName}`;
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
        input.placeholder = '✨ Describe what you see or draw something magical... ✨';
        input.style.cssText = `
            width: 100%;
            height: 200px; /* Much taller for dyslexia */
            padding: 25px; /* More padding */
            border-radius: 20px;
            border: 4px solid #4a90e2; /* Thicker border */
            font-family: 'Comic Neue', 'Open Sans', 'Arial', sans-serif;
            font-size: 1.8rem; /* Much larger font for dyslexia */
            resize: none;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 30px rgba(74, 144, 226, 0.3);
            /* Dyslexia-friendly settings */
            line-height: 1.6;
            letter-spacing: 0.05em;
            word-spacing: 0.1em;
            font-weight: 500;
            color: #333; /* Higher contrast */
        `;
        elements.challengeOptions.appendChild(input);
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'option-btn';
        submitBtn.textContent = '✨ Submit Your Creative Answer ✨';
        submitBtn.style.cssText = `
            font-size: 2.2rem; /* Larger button text */
            padding: 35px 40px; /* More padding */
            margin-top: 20px; /* More spacing */
        `;
        submitBtn.addEventListener('click', () => submitCreativeAnswer(input.value));
        elements.challengeOptions.appendChild(submitBtn);
    }
    
    updateGameUI();
}

// Select Answer
function selectAnswer(selectedIndex) {
    const challenge = gameState.challenges[gameState.currentChallenge];
    const buttons = elements.challengeOptions.querySelectorAll('.option-btn');
    
    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedIndex === challenge.correctAnswer) {
        buttons[selectedIndex].classList.add('correct');
        gameState.score += challenge.maxScore;
        gameState.talentScores[challenge.type] += challenge.maxScore;
        
        // Show success message with confetti
        showMessage('🎉 Correct! Amazing job, champion! 🎉', 'success');
        createConfetti();
    } else {
        buttons[selectedIndex].classList.add('incorrect');
        buttons[challenge.correctAnswer].classList.add('correct');
        
        // Show encouraging feedback
        showMessage('💡 Great try! The correct answer was highlighted. Keep going! 💪', 'info');
    }
    
    // Enable next challenge button
    elements.nextChallenge.disabled = false;
}

// Submit Creative Answer
function submitCreativeAnswer(answer) {
    const challenge = gameState.challenges[gameState.currentChallenge];
    
    if (answer.trim()) {
        // For creativity challenges, give points for participation
        const score = Math.min(challenge.maxScore, Math.floor(answer.length / 5) + 5);
        gameState.score += score;
        gameState.talentScores[challenge.type] += score;
        
        showMessage(`🎨 Creative answer! You earned ${score} magical points! ✨`, 'success');
        createConfetti();
    } else {
        showMessage('✨ Please write something creative and magical! ✨', 'warning');
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
        padding: 25px 30px; /* More padding */
        border-radius: 20px;
        color: white;
        font-weight: bold;
        font-size: 1.4rem; /* Larger font */
        z-index: 1000;
        animation: slideInRight 0.6s ease;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        max-width: 500px; /* Wider */
        text-align: center;
        /* Dyslexia-friendly settings */
        line-height: 1.5;
        letter-spacing: 0.05em;
        word-spacing: 0.1em;
    `;
    
    switch (type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(45deg, #96ceb4, #4ecdc4)';
            break;
        case 'info':
            messageDiv.style.background = 'linear-gradient(45deg, #45b7d1, #96ceb4)';
            break;
        case 'warning':
            messageDiv.style.background = 'linear-gradient(45deg, #feca57, #ff9ff3)';
            break;
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.6s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 600);
    }, 4000); // Longer display time for dyslexia
}

// Next Challenge
function nextChallenge() {
    gameState.currentChallenge++;
    elements.nextChallenge.disabled = true;
    displayChallenge();
}

// Show Results
function showResults() {
    const totalPossible = gameState.challenges.length * 10;
    const percentage = Math.round((gameState.score / totalPossible) * 100);
    
    // Create celebration effect
    createConfetti();
    
    elements.finalScore.textContent = `🏆 Final Score: ${gameState.score}/${totalPossible} (${percentage}%) 🏆`;
    
    // Display talent breakdown with emojis
    elements.talentResults.innerHTML = '';
    Object.entries(gameState.talentScores).forEach(([talent, score]) => {
        const talentItem = document.createElement('div');
        talentItem.className = 'talent-item';
        
        const talentName = document.createElement('span');
        talentName.className = 'talent-name';
        talentName.textContent = getTalentDisplayName(talent);
        
        const talentScore = document.createElement('span');
        talentScore.className = 'talent-score';
        talentScore.textContent = `${score}/20`;
        
        talentItem.appendChild(talentName);
        talentItem.appendChild(talentScore);
        elements.talentResults.appendChild(talentItem);
    });
    
    showScreen('results-screen');
}

// Get Talent Display Name
function getTalentDisplayName(talent) {
    const names = {
        creativity: '🎨 Creativity',
        logic: '🧩 Logic',
        memory: '🧠 Memory',
        observation: '🔍 Observation',
        problemSolving: '💡 Problem Solving'
    };
    return names[talent] || talent;
}

// Restart Game
function restartGame() {
    if (confirm('🔄 Are you sure you want to restart your magical adventure?')) {
        gameState.currentChallenge = 0;
        gameState.score = 0;
        gameState.talentScores = {
            creativity: 0,
            logic: 0,
            memory: 0,
            observation: 0,
            problemSolving: 0
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
        problemSolving: 0
    };
    
    // Shuffle challenges again
    gameState.challenges = [...challenges].sort(() => Math.random() - 0.5);
    
    showScreen('game-screen');
    updateGameUI();
    displayChallenge();
    
    // Create confetti for new game
    createConfetti();
}

// Back to Welcome
function backToWelcome() {
    elements.playerName.value = '';
    showScreen('welcome-screen');
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
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame); 