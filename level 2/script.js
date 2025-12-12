// Dyslexia Detection Tool - Overlay Drawing Version

class DyslexiaDetectionTool {
    constructor() {
        this.originalText = '';
        this.drawingData = [];
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.textDisplay = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Get DOM elements
        this.textInput = document.getElementById('textInput');
        this.startTestBtn = document.getElementById('startTest');
        this.testSection = document.getElementById('testSection');
        this.originalTextDisplay = document.getElementById('originalTextDisplay');
        this.canvas = document.getElementById('drawingCanvas');
        this.clearCanvasBtn = document.getElementById('clearCanvas');
        this.analyzeTextBtn = document.getElementById('analyzeText');
        this.resultsSection = document.getElementById('resultsSection');
        this.accuracyScore = document.getElementById('accuracyScore');
        this.analysisResults = document.getElementById('analysisResults');
        this.dyslexiaIndicators = document.getElementById('dyslexiaIndicators');
        this.newTestBtn = document.getElementById('newTest');
        this.exportResultsBtn = document.getElementById('exportResults');

        // Initialize canvas context
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 20; // Much larger pen size to match text size
        this.ctx.strokeStyle = '#e53e3e'; // Red color for drawing
        this.ctx.globalAlpha = 0.8; // Semi-transparent
        
        // Make canvas transparent
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // Start test button
        this.startTestBtn.addEventListener('click', () => this.startTest());
        
        // Canvas drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Control buttons
        this.clearCanvasBtn.addEventListener('click', () => this.clearCanvas());
        this.analyzeTextBtn.addEventListener('click', () => this.analyzeText());
        this.newTestBtn.addEventListener('click', () => this.resetTest());
        this.exportResultsBtn.addEventListener('click', () => this.exportResults());
    }

    startTest() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('Please enter some text to start the test.');
            return;
        }

        this.originalText = text;
        this.originalTextDisplay.textContent = text;
        
        // Resize canvas to match text display
        this.resizeCanvasToText();
        
        this.testSection.style.display = 'block';
        this.testSection.classList.add('fade-in');
        
        // Scroll to test section
        this.testSection.scrollIntoView({ behavior: 'smooth' });
    }

    resizeCanvasToText() {
        const textDisplay = this.originalTextDisplay;
        const rect = textDisplay.getBoundingClientRect();
        
        // Set canvas size to match text display
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Reset canvas properties after resize
        this.setupCanvas();
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = e.type.includes('touch') ? this.getTouchPos(e) : this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Start new drawing path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        
        // Store drawing data
        this.drawingData.push({
            type: 'start',
            x: this.lastX,
            y: this.lastY,
            timestamp: Date.now()
        });
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        const pos = e.type.includes('touch') ? this.getTouchPos(e) : this.getMousePos(e);
        
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Store drawing data
        this.drawingData.push({
            type: 'draw',
            x: pos.x,
            y: pos.y,
            timestamp: Date.now()
        });
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();
            
            // Store end of stroke
            this.drawingData.push({
                type: 'end',
                timestamp: Date.now()
            });
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawingData = [];
    }

    analyzeText() {
        if (this.drawingData.length === 0) {
            alert('Please draw something before analyzing.');
            return;
        }

        const analysis = this.performAnalysis();
        this.displayResults(analysis);
        this.resultsSection.style.display = 'block';
        this.resultsSection.classList.add('fade-in');
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    performAnalysis() {
        const analysis = {
            accuracy: this.calculateAccuracy(),
            letterAnalysis: this.analyzeLetters(),
            spacingAnalysis: this.analyzeSpacing(),
            dyslexiaIndicators: this.detectDyslexiaPatterns(),
            drawingMetrics: this.analyzeDrawingMetrics(),
            textCoverage: this.analyzeTextCoverage()
        };

        return analysis;
    }

    calculateAccuracy() {
        // Calculate accuracy based on drawing coverage and patterns
        const coverage = this.calculateTextCoverage();
        const patternAccuracy = this.calculatePatternAccuracy();
        const consistency = this.calculateDrawingConsistency();
        
        // Weighted accuracy calculation
        const accuracy = (coverage * 0.4) + (patternAccuracy * 0.4) + (consistency * 0.2);
        return Math.round(accuracy);
    }

    calculateTextCoverage() {
        // Analyze how well the drawing covers the text area
        const textRect = this.originalTextDisplay.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Create a grid to analyze coverage
        const gridSize = 20;
        const cols = Math.floor(canvasRect.width / gridSize);
        const rows = Math.floor(canvasRect.height / gridSize);
        
        let coveredCells = 0;
        let totalCells = cols * rows;
        
        // Sample drawing data to estimate coverage
        const samplePoints = this.drawingData.filter(point => point.type === 'draw');
        const coverageMap = new Set();
        
        samplePoints.forEach(point => {
            const col = Math.floor(point.x / gridSize);
            const row = Math.floor(point.y / gridSize);
            coverageMap.add(`${col},${row}`);
        });
        
        coveredCells = coverageMap.size;
        return Math.min((coveredCells / totalCells) * 100, 100);
    }

    calculatePatternAccuracy() {
        // Analyze drawing patterns for text-like characteristics
        const patterns = this.analyzeDrawingPatterns();
        let accuracy = 0;
        
        // Check for linear patterns (like writing)
        if (patterns.linearity > 0.6) accuracy += 30;
        
        // Check for consistent stroke direction
        if (patterns.directionConsistency > 0.7) accuracy += 25;
        
        // Check for appropriate stroke density
        if (patterns.density > 0.3 && patterns.density < 0.8) accuracy += 25;
        
        // Check for text-like rhythm
        if (patterns.rhythm > 0.5) accuracy += 20;
        
        return Math.min(accuracy, 100);
    }

    calculateDrawingConsistency() {
        // Analyze consistency in drawing style
        const strokes = this.getStrokes();
        if (strokes.length < 2) return 50;
        
        const strokeLengths = strokes.map(stroke => stroke.length);
        const strokeDurations = strokes.map(stroke => stroke.duration);
        
        const lengthConsistency = this.calculateConsistency(strokeLengths);
        const durationConsistency = this.calculateConsistency(strokeDurations);
        
        return (lengthConsistency + durationConsistency) / 2;
    }

    calculateConsistency(values) {
        if (values.length < 2) return 100;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 100 - (stdDev / mean) * 100);
    }

    analyzeDrawingPatterns() {
        const patterns = {
            linearity: 0,
            directionConsistency: 0,
            density: 0,
            rhythm: 0
        };
        
        if (this.drawingData.length < 10) return patterns;
        
        // Analyze linearity (how straight the lines are)
        patterns.linearity = this.analyzeLinearity();
        
        // Analyze direction consistency
        patterns.directionConsistency = this.analyzeDirectionConsistency();
        
        // Analyze density
        patterns.density = this.analyzeDensity();
        
        // Analyze rhythm (timing patterns)
        patterns.rhythm = this.analyzeRhythm();
        
        return patterns;
    }

    analyzeLinearity() {
        const strokes = this.getStrokes();
        if (strokes.length === 0) return 0;
        
        let totalLinearity = 0;
        strokes.forEach(stroke => {
            if (stroke.points.length < 3) return;
            
            let linearity = 0;
            for (let i = 1; i < stroke.points.length - 1; i++) {
                const prev = stroke.points[i - 1];
                const curr = stroke.points[i];
                const next = stroke.points[i + 1];
                
                // Calculate angle deviation
                const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
                const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
                const deviation = Math.abs(angle1 - angle2);
                
                linearity += Math.max(0, 1 - deviation / Math.PI);
            }
            
            totalLinearity += linearity / (stroke.points.length - 2);
        });
        
        return totalLinearity / strokes.length;
    }

    analyzeDirectionConsistency() {
        const strokes = this.getStrokes();
        if (strokes.length < 2) return 0;
        
        const directions = strokes.map(stroke => {
            if (stroke.points.length < 2) return 0;
            const start = stroke.points[0];
            const end = stroke.points[stroke.points.length - 1];
            return Math.atan2(end.y - start.y, end.x - start.x);
        });
        
        // Calculate consistency of directions
        let consistency = 0;
        for (let i = 1; i < directions.length; i++) {
            const diff = Math.abs(directions[i] - directions[i - 1]);
            const normalizedDiff = Math.min(diff, 2 * Math.PI - diff) / Math.PI;
            consistency += 1 - normalizedDiff;
        }
        
        return consistency / (directions.length - 1);
    }

    analyzeDensity() {
        const totalPoints = this.drawingData.filter(point => point.type === 'draw').length;
        const canvasArea = this.canvas.width * this.canvas.height;
        return totalPoints / (canvasArea / 1000); // Normalize by area
    }

    analyzeRhythm() {
        const strokes = this.getStrokes();
        if (strokes.length < 3) return 0;
        
        const intervals = [];
        for (let i = 1; i < strokes.length; i++) {
            const interval = strokes[i].startTime - strokes[i - 1].endTime;
            intervals.push(interval);
        }
        
        return this.calculateConsistency(intervals) / 100;
    }

    getStrokes() {
        const strokes = [];
        let currentStroke = null;
        
        this.drawingData.forEach(point => {
            if (point.type === 'start') {
                if (currentStroke) {
                    strokes.push(currentStroke);
                }
                currentStroke = {
                    points: [{ x: point.x, y: point.y }],
                    startTime: point.timestamp,
                    endTime: point.timestamp
                };
            } else if (point.type === 'draw' && currentStroke) {
                currentStroke.points.push({ x: point.x, y: point.y });
                currentStroke.endTime = point.timestamp;
            } else if (point.type === 'end' && currentStroke) {
                currentStroke.endTime = point.timestamp;
                strokes.push(currentStroke);
                currentStroke = null;
            }
        });
        
        if (currentStroke) {
            strokes.push(currentStroke);
        }
        
        return strokes.map(stroke => ({
            ...stroke,
            length: this.calculateStrokeLength(stroke.points),
            duration: stroke.endTime - stroke.startTime
        }));
    }

    calculateStrokeLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    analyzeLetters() {
        // Analyze letter formation patterns
        const analysis = {
            reversals: this.detectReversals(),
            inversions: this.detectInversions(),
            omissions: this.detectOmissions(),
            substitutions: this.detectSubstitutions()
        };
        
        return analysis;
    }

    detectReversals() {
        const reversals = [];
        const strokes = this.getStrokes();
        
        // Look for patterns that might indicate letter reversals
        strokes.forEach((stroke, index) => {
            if (stroke.points.length < 3) return;
            
            // Check for backward movement patterns
            const direction = this.calculateStrokeDirection(stroke);
            if (direction < -Math.PI / 2 || direction > Math.PI / 2) {
                reversals.push({
                    strokeIndex: index,
                    direction: direction,
                    type: 'backward_movement'
                });
            }
        });
        
        return reversals;
    }

    detectInversions() {
        const inversions = [];
        const strokes = this.getStrokes();
        
        // Look for vertical inversion patterns
        strokes.forEach((stroke, index) => {
            if (stroke.points.length < 3) return;
            
            const verticalMovement = this.calculateVerticalMovement(stroke);
            if (verticalMovement < -0.5) { // Upward movement
                inversions.push({
                    strokeIndex: index,
                    verticalMovement: verticalMovement,
                    type: 'upward_movement'
                });
            }
        });
        
        return inversions;
    }

    detectOmissions() {
        const omissions = [];
        const textLength = this.originalText.length;
        const strokes = this.getStrokes();
        
        // Estimate expected strokes based on text length
        const expectedStrokes = Math.max(textLength * 0.5, 5);
        
        if (strokes.length < expectedStrokes * 0.6) {
            omissions.push({
                expected: expectedStrokes,
                actual: strokes.length,
                type: 'insufficient_strokes'
            });
        }
        
        return omissions;
    }

    detectSubstitutions() {
        const substitutions = [];
        const strokes = this.getStrokes();
        
        // Look for unusual stroke patterns that might indicate substitutions
        strokes.forEach((stroke, index) => {
            if (stroke.points.length < 5) return;
            
            const complexity = this.calculateStrokeComplexity(stroke);
            if (complexity > 0.8) {
                substitutions.push({
                    strokeIndex: index,
                    complexity: complexity,
                    type: 'high_complexity'
                });
            }
        });
        
        return substitutions;
    }

    calculateStrokeDirection(stroke) {
        if (stroke.points.length < 2) return 0;
        
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        return Math.atan2(end.y - start.y, end.x - start.x);
    }

    calculateVerticalMovement(stroke) {
        if (stroke.points.length < 2) return 0;
        
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        return (end.y - start.y) / stroke.points.length;
    }

    calculateStrokeComplexity(stroke) {
        if (stroke.points.length < 3) return 0;
        
        let directionChanges = 0;
        for (let i = 2; i < stroke.points.length; i++) {
            const p1 = stroke.points[i - 2];
            const p2 = stroke.points[i - 1];
            const p3 = stroke.points[i];
            
            const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            
            if (Math.abs(angle1 - angle2) > Math.PI / 4) {
                directionChanges++;
            }
        }
        
        return directionChanges / (stroke.points.length - 2);
    }

    analyzeSpacing() {
        const spacingAnalysis = {
            wordSpacing: this.analyzeWordSpacing(),
            letterSpacing: this.analyzeLetterSpacing(),
            lineSpacing: this.analyzeLineSpacing()
        };
        
        return spacingAnalysis;
    }

    analyzeWordSpacing() {
        const strokes = this.getStrokes();
        const gaps = this.findGapsBetweenStrokes(strokes);
        
        return {
            averageGap: gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 0,
            gapCount: gaps.length,
            consistency: this.calculateConsistency(gaps)
        };
    }

    analyzeLetterSpacing() {
        // Analyze spacing within strokes (for letters)
        const strokes = this.getStrokes();
        const internalGaps = [];
        
        strokes.forEach(stroke => {
            if (stroke.points.length < 10) return;
            
            // Look for gaps within the stroke
            for (let i = 1; i < stroke.points.length; i++) {
                const prev = stroke.points[i - 1];
                const curr = stroke.points[i];
                const distance = Math.sqrt(
                    Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
                );
                
                if (distance > 20) { // Significant gap
                    internalGaps.push(distance);
                }
            }
        });
        
        return {
            averageGap: internalGaps.length > 0 ? internalGaps.reduce((sum, gap) => sum + gap, 0) / internalGaps.length : 0,
            gapCount: internalGaps.length,
            consistency: this.calculateConsistency(internalGaps)
        };
    }

    analyzeLineSpacing() {
        const strokes = this.getStrokes();
        const lineHeights = [];
        
        // Group strokes by approximate Y position
        const lines = this.groupStrokesByLine(strokes);
        
        for (let i = 1; i < lines.length; i++) {
            const line1 = lines[i - 1];
            const line2 = lines[i];
            
            const y1 = line1.reduce((sum, stroke) => sum + this.getStrokeCenterY(stroke), 0) / line1.length;
            const y2 = line2.reduce((sum, stroke) => sum + this.getStrokeCenterY(stroke), 0) / line2.length;
            
            lineHeights.push(Math.abs(y2 - y1));
        }
        
        return {
            lineCount: lines.length,
            averageLineHeight: lineHeights.length > 0 ? lineHeights.reduce((sum, h) => sum + h, 0) / lineHeights.length : 0,
            consistency: this.calculateConsistency(lineHeights)
        };
    }

    findGapsBetweenStrokes(strokes) {
        const gaps = [];
        
        for (let i = 1; i < strokes.length; i++) {
            const prevStroke = strokes[i - 1];
            const currStroke = strokes[i];
            
            const prevEnd = prevStroke.points[prevStroke.points.length - 1];
            const currStart = currStroke.points[0];
            
            const distance = Math.sqrt(
                Math.pow(currStart.x - prevEnd.x, 2) + Math.pow(currStart.y - prevEnd.y, 2)
            );
            
            gaps.push(distance);
        }
        
        return gaps;
    }

    groupStrokesByLine(strokes) {
        const lines = [];
        const lineThreshold = 50; // Pixels
        
        strokes.forEach(stroke => {
            const centerY = this.getStrokeCenterY(stroke);
            let addedToLine = false;
            
            for (let i = 0; i < lines.length; i++) {
                const lineCenterY = lines[i].reduce((sum, s) => sum + this.getStrokeCenterY(s), 0) / lines[i].length;
                
                if (Math.abs(centerY - lineCenterY) < lineThreshold) {
                    lines[i].push(stroke);
                    addedToLine = true;
                    break;
                }
            }
            
            if (!addedToLine) {
                lines.push([stroke]);
            }
        });
        
        return lines;
    }

    getStrokeCenterY(stroke) {
        if (stroke.points.length === 0) return 0;
        
        const sumY = stroke.points.reduce((sum, point) => sum + point.y, 0);
        return sumY / stroke.points.length;
    }

    detectDyslexiaPatterns() {
        const patterns = [];
        const letterAnalysis = this.analyzeLetters();
        const spacingAnalysis = this.analyzeSpacing();
        const drawingMetrics = this.analyzeDrawingMetrics();
        
        // Letter reversals
        if (letterAnalysis.reversals.length > 0) {
            patterns.push({
                type: 'reversals',
                severity: letterAnalysis.reversals.length > 2 ? 'moderate' : 'mild',
                description: `${letterAnalysis.reversals.length} reversal pattern(s) detected`,
                details: letterAnalysis.reversals.map(r => `Backward movement in stroke ${r.strokeIndex}`)
            });
        }
        
        // Letter inversions
        if (letterAnalysis.inversions.length > 0) {
            patterns.push({
                type: 'inversions',
                severity: 'moderate',
                description: `${letterAnalysis.inversions.length} inversion pattern(s) detected`,
                details: letterAnalysis.inversions.map(i => `Upward movement in stroke ${i.strokeIndex}`)
            });
        }
        
        // Spacing issues
        if (spacingAnalysis.wordSpacing.consistency < 60) {
            patterns.push({
                type: 'spacing',
                severity: 'mild',
                description: 'Inconsistent spacing patterns detected',
                details: ['Variable spacing between strokes']
            });
        }
        
        // Drawing complexity
        if (drawingMetrics.complexity > 0.8) {
            patterns.push({
                type: 'complexity',
                severity: 'mild',
                description: 'High drawing complexity detected',
                details: ['Complex stroke patterns may indicate formation difficulties']
            });
        }
        
        return patterns;
    }

    analyzeDrawingMetrics() {
        const strokes = this.getStrokes();
        
        return {
            totalStrokes: strokes.length,
            drawingTime: this.calculateDrawingTime(),
            complexity: this.calculateOverallComplexity(strokes),
            pressureVariation: this.analyzePressureVariation(),
            speedVariation: this.analyzeSpeedVariation(strokes)
        };
    }

    calculateDrawingTime() {
        if (this.drawingData.length < 2) return 0;
        
        const startTime = this.drawingData[0].timestamp;
        const endTime = this.drawingData[this.drawingData.length - 1].timestamp;
        
        return (endTime - startTime) / 1000; // Convert to seconds
    }

    calculateOverallComplexity(strokes) {
        if (strokes.length === 0) return 0;
        
        const complexities = strokes.map(stroke => this.calculateStrokeComplexity(stroke));
        return complexities.reduce((sum, comp) => sum + comp, 0) / complexities.length;
    }

    analyzePressureVariation() {
        // Simplified pressure analysis based on drawing speed
        const strokes = this.getStrokes();
        if (strokes.length < 2) return 0.5;
        
        const speeds = strokes.map(stroke => {
            if (stroke.duration === 0) return 0;
            return stroke.length / stroke.duration;
        });
        
        return this.calculateConsistency(speeds) / 100;
    }

    analyzeSpeedVariation(strokes) {
        if (strokes.length < 2) return 0.5;
        
        const speeds = strokes.map(stroke => {
            if (stroke.duration === 0) return 0;
            return stroke.length / stroke.duration;
        });
        
        return this.calculateConsistency(speeds) / 100;
    }

    analyzeTextCoverage() {
        return {
            coverage: this.calculateTextCoverage(),
            patternAccuracy: this.calculatePatternAccuracy(),
            consistency: this.calculateDrawingConsistency()
        };
    }

    displayResults(analysis) {
        // Display accuracy score
        this.accuracyScore.textContent = `${analysis.accuracy}%`;
        
        // Update score circle color based on accuracy
        const scoreCircle = document.querySelector('.score-circle');
        if (analysis.accuracy >= 80) {
            scoreCircle.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        } else if (analysis.accuracy >= 60) {
            scoreCircle.style.background = 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)';
        } else {
            scoreCircle.style.background = 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)';
        }
        
        // Display detailed analysis
        this.displayDetailedAnalysis(analysis);
        
        // Display dyslexia indicators
        this.displayDyslexiaIndicators(analysis.dyslexiaIndicators);
    }

    displayDetailedAnalysis(analysis) {
        let html = `
            <div class="analysis-item">
                <strong>Drawing Analysis:</strong>
                <ul>
                    <li>Text Coverage: ${analysis.textCoverage.coverage.toFixed(1)}%</li>
                    <li>Pattern Accuracy: ${analysis.textCoverage.patternAccuracy.toFixed(1)}%</li>
                    <li>Drawing Consistency: ${analysis.textCoverage.consistency.toFixed(1)}%</li>
                </ul>
            </div>
            
            <div class="analysis-item">
                <strong>Letter Analysis:</strong>
                <ul>
                    <li>Reversals: ${analysis.letterAnalysis.reversals.length}</li>
                    <li>Inversions: ${analysis.letterAnalysis.inversions.length}</li>
                    <li>Omissions: ${analysis.letterAnalysis.omissions.length}</li>
                    <li>Substitutions: ${analysis.letterAnalysis.substitutions.length}</li>
                </ul>
            </div>
            
            <div class="analysis-item">
                <strong>Drawing Metrics:</strong>
                <ul>
                    <li>Total Strokes: ${analysis.drawingMetrics.totalStrokes}</li>
                    <li>Drawing Time: ${analysis.drawingMetrics.drawingTime.toFixed(1)}s</li>
                    <li>Complexity: ${(analysis.drawingMetrics.complexity * 100).toFixed(1)}%</li>
                    <li>Speed Consistency: ${(analysis.drawingMetrics.speedVariation * 100).toFixed(1)}%</li>
                </ul>
            </div>
        `;
        
        this.analysisResults.innerHTML = html;
    }

    displayDyslexiaIndicators(indicators) {
        if (indicators.length === 0) {
            this.dyslexiaIndicators.innerHTML = `
                <div class="indicator-item">
                    <strong>No significant dyslexia indicators detected.</strong>
                    <p>This is a preliminary analysis. Consult with a professional for a comprehensive assessment.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        indicators.forEach(indicator => {
            const severityClass = indicator.severity === 'mild' ? 'warning' : 'danger';
            html += `
                <div class="indicator-item ${severityClass}">
                    <strong>${indicator.description}</strong>
                    <p>Severity: ${indicator.severity}</p>
                    <ul>
                        ${indicator.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        
        html += `
            <div class="indicator-item">
                <strong>Important Note:</strong>
                <p>This is a preliminary analysis tool. These results should not replace professional assessment. 
                If concerns persist, please consult with a qualified specialist.</p>
            </div>
        `;
        
        this.dyslexiaIndicators.innerHTML = html;
    }

    resetTest() {
        // Reset all sections
        this.testSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        
        // Clear inputs and canvas
        this.textInput.value = '';
        this.clearCanvas();
        
        // Reset data
        this.originalText = '';
        this.drawingData = [];
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    exportResults() {
        if (this.drawingData.length === 0) {
            alert('No test data to export.');
            return;
        }
        
        const results = {
            originalText: this.originalText,
            timestamp: new Date().toISOString(),
            drawingData: this.drawingData,
            analysis: this.performAnalysis()
        };
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dyslexia-test-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DyslexiaDetectionTool();
});