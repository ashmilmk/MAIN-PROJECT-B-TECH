# Dyslexia Detection Tool

A web-based tool designed to help detect signs of dyslexia in children through text reproduction analysis.

## Features

### Core Functionality
- **Text Input**: Enter custom text for children to reproduce
- **Enlarged Display**: Shows the original text in large, readable format
- **Drawing Canvas**: HTML5 Canvas for children to draw/write over the text
- **Real-time Analysis**: Analyzes drawing patterns and compares with original text
- **Accuracy Scoring**: Provides percentage-based accuracy scores
- **Dyslexia Pattern Detection**: Identifies common dyslexia indicators

### Analysis Capabilities
- **Letter Analysis**: Detects reversals, inversions, omissions, and substitutions
- **Spacing Analysis**: Analyzes word spacing, letter spacing, and line consistency
- **Drawing Metrics**: Tracks strokes, drawing time, and complexity
- **Pattern Recognition**: Identifies potential dyslexia indicators

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Touch Support**: Full touch support for drawing on mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Export Functionality**: Save test results as JSON files

## How It Works

1. **Text Input**: Enter a short text (e.g., "The quick brown fox jumps over the lazy dog")
2. **Display**: The text is shown in large format for the child to see
3. **Drawing**: The child draws/writes directly over the displayed text using the canvas
4. **Analysis**: The system analyzes the drawing patterns and compares with the original
5. **Results**: Detailed analysis including accuracy score and potential dyslexia indicators

## Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic structure with Canvas API
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No external dependencies, pure ES6+ implementation

### Analysis Methods
- **Drawing Data Collection**: Captures mouse/touch movements and timestamps
- **Pattern Recognition**: Analyzes movement patterns for dyslexia indicators
- **Statistical Analysis**: Calculates consistency, complexity, and accuracy metrics
- **Heuristic Scoring**: Uses multiple factors to determine accuracy scores

### Dyslexia Indicators Detected
- **Letter Reversals**: Backward horizontal movements
- **Letter Inversions**: Unusual vertical movement patterns
- **Spacing Issues**: Inconsistent word and letter spacing
- **Formation Difficulties**: Complex drawing patterns
- **Omissions**: Gaps in writing patterns

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and analysis
└── README.md           # This documentation file
```

## Usage Instructions

1. **Open the Application**: Open `index.html` in a web browser
2. **Enter Text**: Type or paste text into the input field
3. **Start Test**: Click "Start Test" to begin
4. **Draw Text**: Use mouse or touch to draw the text on the canvas
5. **Analyze**: Click "Analyze" to see results
6. **Review Results**: Check accuracy score and dyslexia indicators
7. **Export** (Optional): Save results as JSON file

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Full touch support

## Important Notes

### Limitations
- This is a **preliminary screening tool**, not a diagnostic instrument
- Results should **not replace professional assessment**
- The analysis is based on drawing patterns, not actual text recognition
- Accuracy may vary based on individual drawing styles

### Professional Use
- Consult with qualified specialists for comprehensive assessments
- Use results as supplementary information only
- Consider multiple testing sessions for more reliable results
- Document findings for professional review

## Future Enhancements

### Planned Features
- **OCR Integration**: Actual text recognition and comparison
- **Machine Learning**: Improved pattern recognition using ML models
- **User Accounts**: Save and track progress over time
- **Advanced Analytics**: More sophisticated analysis algorithms
- **Multi-language Support**: Support for different languages and scripts

### Technical Improvements
- **Performance Optimization**: Better handling of large drawing datasets
- **Accessibility**: Enhanced accessibility features
- **Data Privacy**: Secure data handling and storage
- **API Integration**: Connect with professional assessment tools

## Development

### Local Development
1. Clone or download the project files
2. Open `index.html` in a web browser
3. No build process or dependencies required

### Customization
- Modify `styles.css` for visual changes
- Update `script.js` for functionality changes
- Adjust analysis parameters in the `DyslexiaDetectionTool` class

## Contributing

This project is designed for educational and research purposes. Contributions are welcome for:
- Improved analysis algorithms
- Better user interface design
- Accessibility enhancements
- Performance optimizations
- Documentation improvements

## License

This project is provided for educational and research purposes. Please ensure compliance with local regulations regarding medical/educational software.

## Disclaimer

This tool is designed for preliminary screening purposes only. It should not be used as a substitute for professional medical or educational assessment. Always consult with qualified professionals for comprehensive dyslexia evaluation and support.
