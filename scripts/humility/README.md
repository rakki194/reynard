# Enhanced Humility Detector

🦊 **Advanced Detection of Boastful Language** - Part of the Reynard project's commitment to humble communication.

## Overview

The Enhanced Humility Detector is a comprehensive, modular system that combines multiple analysis techniques to detect boastful language and promote humble communication. It represents a significant advancement over the original pattern-based approach, incorporating state-of-the-art NLP, machine learning, and psychological research.

## Key Features

### 🧠 Advanced Analysis Techniques

- **Pattern-Based Detection**: Enhanced regex patterns with 10+ categories of boastful language
- **Sentiment Analysis**: Emotional analysis to detect boastful sentiment patterns
- **HEXACO Personality Assessment**: Honesty-Humility factor evaluation from psychological research
- **Epistemic Humility Analysis**: Detection of overconfidence and certainty claims
- **LIWC Linguistic Analysis**: Comprehensive linguistic inquiry and word count analysis
- **Transformer Model Integration**: Placeholder for BERT/RoBERTa contextual analysis
- **Cultural Adaptation**: Context-aware analysis for different cultural norms

### 🎯 Detection Categories

1. **Superlatives**: "best", "most", "greatest", "unprecedented"
2. **Exaggeration**: "revolutionary", "groundbreaking", "game-changing"
3. **Self-Promotion**: "award-winning", "industry-leading", "world-class"
4. **Dismissiveness**: "unlike others", "superior to", "outperforms"
5. **Absolute Claims**: "always", "never", "all", "every"
6. **Hype Language**: "legendary", "epic", "awesome", "incredible"
7. **Competitive Language**: "beats", "defeats", "conquers"
8. **Exclusivity Claims**: "exclusive", "limited", "rare"
9. **Emotional Manipulation**: "urgent", "critical", "emergency"
10. **Authority Claims**: "expert", "authority", "specialist"
11. **Condescending Language**: "idiot-proof", "bulletproof", "so simple", "anyone can"
12. **Negative Assumptions**: "you probably don't", "most people don't", "assuming you're not"
13. **Patronizing Tone**: "clearly", "obviously", "you should know", "it's simple"

### 🌍 Cultural Context Support

- **Western**: Direct communication, moderate modesty emphasis
- **Eastern**: High modesty requirements, indirect communication
- **Nordic**: Egalitarian values, collaborative emphasis

### 📊 Comprehensive Scoring

- **Overall Humility Score**: 0-100 scale (higher is better)
- **HEXACO Honesty-Humility**: Personality-based assessment
- **Epistemic Humility**: Knowledge limitation recognition
- **Linguistic Humility**: Language pattern analysis
- **Behavioral Humility**: Action and interaction patterns
- **Cultural Adaptation**: Context-aware scoring

## Installation

```bash
# Navigate to the humility detector directory
cd scripts/humility

# Make the enhanced detector executable
chmod +x enhanced-humility-detector.py

# Install dependencies (if using advanced features)
pip install -r requirements.txt  # Future enhancement
```

## Usage

### Basic Usage

```bash
# Analyze a single file
python3 enhanced-humility-detector.py README.md

# Analyze a directory
python3 enhanced-humility-detector.py docs/

# Analyze with specific file extensions
python3 enhanced-humility-detector.py . --extensions .md .txt .py
```

### Advanced Usage

```bash
# Enable all advanced features
python3 enhanced-humility-detector.py . --enable-all-features

# Use specific cultural context
python3 enhanced-humility-detector.py . --cultural-context eastern

# Set minimum severity threshold
python3 enhanced-humility-detector.py . --min-severity high

# Generate JSON report
python3 enhanced-humility-detector.py . --format json --output report.json

# Enable parallel processing
python3 enhanced-humility-detector.py . --parallel-processing --max-workers 8
```

### Configuration

```bash
# Save current configuration
python3 enhanced-humility-detector.py . --save-config config.json

# Load configuration from file
python3 enhanced-humility-detector.py . --config config.json
```

## Architecture

### Modular Design

```
🔧 Scripts/humility/
├── enhanced-humility-detector.py    # Main entry point
├── core/                            # Core detection engine
│   ├── __init__.py
│   ├── detector.py                  # Main detector class
│   ├── models.py                    # Data models
│   └── config.py                    # Configuration management
├── analyzers/                       # Analysis modules
│   ├── __init__.py
│   ├── pattern_analyzer.py          # Pattern-based detection
│   ├── sentiment_analyzer.py        # Sentiment analysis
│   ├── hexaco_analyzer.py           # HEXACO personality analysis
│   ├── epistemic_analyzer.py        # Epistemic humility
│   ├── liwc_analyzer.py             # LIWC linguistic analysis
│   └── transformer_analyzer.py      # Transformer models (placeholder)
├── utils/                           # Utility modules
│   ├── __init__.py
│   ├── text_processor.py            # Text processing utilities
│   ├── cultural_adapter.py          # Cultural adaptation
│   ├── metrics_calculator.py        # Metrics calculation
│   └── report_generator.py          # Report generation
└── README.md                        # This file
```

### Core Components

#### EnhancedHumilityDetector

The main detection engine that orchestrates all analysis modules and combines their results.

#### Analyzers

- **PatternAnalyzer**: Enhanced regex-based pattern matching
- **SentimentAnalyzer**: Emotional analysis for boastful sentiment
- **HexacoAnalyzer**: HEXACO personality model integration
- **EpistemicHumilityAnalyzer**: Knowledge limitation recognition
- **LiwcAnalyzer**: Linguistic inquiry and word count analysis
- **TransformerAnalyzer**: Placeholder for transformer model integration

#### Utilities

- **TextProcessor**: Advanced text preprocessing and feature extraction
- **CulturalAdapter**: Cultural context adaptation
- **MetricsCalculator**: Performance metrics calculation
- **ReportGenerator**: Multi-format report generation

## Configuration Options

### Detection Settings

- `min_confidence_threshold`: Minimum confidence for findings (0.0-1.0)
- `min_severity_threshold`: Minimum severity level to report
- `max_findings_per_file`: Maximum findings per file

### Feature Toggles

- `use_transformer_models`: Enable transformer model analysis
- `use_hexaco_assessment`: Enable HEXACO personality assessment
- `use_epistemic_humility`: Enable epistemic humility evaluation
- `use_liwc_analysis`: Enable LIWC linguistic analysis
- `use_sentiment_analysis`: Enable sentiment analysis

### Advanced Features

- `enable_real_time_monitoring`: Real-time analysis monitoring
- `enable_trend_analysis`: Trend analysis over time
- `enable_cultural_adaptation`: Cultural context adaptation
- `enable_explainable_ai`: Explainable AI features

### Performance Settings

- `parallel_processing`: Enable parallel file processing
- `max_workers`: Maximum worker threads
- `cache_results`: Cache analysis results
- `max_file_size_mb`: Maximum file size limit

## Output Formats

### Text Report (Default)

Human-readable format with findings, recommendations, and metrics.

### JSON Report

Machine-readable format for programmatic processing and integration.

### HTML Report

Web-friendly format with styling and interactive elements.

### CSV Report

Tabular format for spreadsheet analysis and data processing.

## Research Foundation

This enhanced detector is based on extensive research in:

- **Psychology**: HEXACO personality model, epistemic humility research
- **Linguistics**: LIWC analysis, sentiment analysis, linguistic patterns
- **Machine Learning**: Transformer models, ensemble methods, feature selection
- **Cultural Studies**: Cross-cultural communication patterns and norms

## Future Enhancements

### Planned Features

- **Transformer Model Integration**: Full BERT/RoBERTa implementation
- **Real-time Monitoring**: Live analysis of streaming text
- **Trend Analysis**: Historical analysis and trend detection
- **Explainable AI**: SHAP integration for model interpretability
- **API Integration**: REST API for external system integration
- **GUI Interface**: Web-based user interface
- **Plugin System**: Extensible architecture for custom analyzers

### Research Integration

- **HumbleBench Integration**: Epistemic humility benchmarking
- **Multimodal Analysis**: Voice, facial expression, and behavioral analysis
- **Cross-lingual Support**: Multi-language humility detection
- **Domain Adaptation**: Specialized models for different domains

## Contributing

The Enhanced Humility Detector is part of the Reynard project's commitment to humble communication. Contributions are welcome in the following areas:

- **New Analyzers**: Additional analysis techniques
- **Cultural Contexts**: Support for more cultural norms
- **Performance Optimization**: Improved speed and accuracy
- **Research Integration**: Latest psychological and linguistic research
- **User Experience**: Better interfaces and usability

## License

Part of the Reynard project. See the main project license for details.

## Acknowledgments

This enhanced detector builds upon research from:

- **HEXACO Personality Model**: Honesty-Humility factor research
- **Epistemic Humility**: Intellectual humility and knowledge limitation studies
- **LIWC Analysis**: Linguistic inquiry and word count methodology
- **Cultural Communication**: Cross-cultural communication research
- **Machine Learning**: Transformer models and NLP advances

---

🦊 _whiskers twitch with strategic cunning_ The Enhanced Humility Detector represents a significant advancement in automated humility assessment, combining cutting-edge research with practical implementation to promote more humble and effective communication in technology development.
