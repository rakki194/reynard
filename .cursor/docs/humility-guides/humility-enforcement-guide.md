# Humility Enforcement Guide

## Overview

This guide provides comprehensive instructions for systematically enforcing humble communication throughout the Reynard project using automated tools, manual processes, and cultural practices.

## Quick Start

### 1. Install the Humility Tools

```bash
# Make the enforcer script executable
chmod +x scripts/humility/humility-enforcer.sh

# Install pre-commit hook
./scripts/humility/humility-enforcer.sh install-hook

# Test the detector
python3 scripts/humility/humility-detector.py README.md
```

### 2. Run Your First Scan

```bash
# Scan the entire project
./scripts/humility/humility-enforcer.sh scan

# Scan with auto-fix
./scripts/humility/humility-enforcer.sh scan . true

# Scan specific files
python3 scripts/humility/humility-detector.py docs/ --min-severity high
```

## Tool Overview

### Humility Detector (`humility-detector.py`)

**Purpose**: Scans text files for boastful language patterns and suggests humble alternatives.

**Features**:
- Pattern-based detection of boastful language
- Severity classification (low, medium, high, critical)
- Confidence scoring for each detection
- Multiple output formats (text, JSON)
- Humility score calculation
- Configurable file extensions and severity thresholds

**Usage Examples**:
```bash
# Basic scan
python3 scripts/humility/humility-detector.py README.md

# Scan with specific severity threshold
python3 scripts/humility/humility-detector.py . --min-severity high

# Generate JSON report
python3 scripts/humility/humility-detector.py docs/ --format json --output report.json

# Calculate humility score
python3 scripts/humility/humility-detector.py . --score
```

### Humility Enforcer (`humility-enforcer.sh`)

**Purpose**: Comprehensive enforcement system with CI integration, pre-commit hooks, and automated fixes.

**Features**:
- Pre-commit hook installation
- CI integration
- Auto-fix capabilities
- Configuration management
- Logging and reporting
- Batch processing

**Usage Examples**:
```bash
# Install pre-commit hook
./scripts/humility/humility-enforcer.sh install-hook

# Run CI check
./scripts/humility/humility-enforcer.sh ci-check

# Scan with auto-fix
./scripts/humility/humility-enforcer.sh scan . true

# View configuration
./scripts/humility/humility-enforcer.sh config
```

## Configuration

### Configuration File (`humility-config.json`)

The enforcer uses a JSON configuration file for customization:

```json
{
    "enabled": true,
    "severity_threshold": "medium",
    "file_extensions": [".md", ".txt", ".py", ".js", ".ts", ".tsx", ".jsx", ".json"],
    "exclude_patterns": [
        "node_modules/",
        ".git/",
        "dist/",
        "build/",
        "coverage/",
        "*.min.js",
        "*.bundle.js"
    ],
    "auto_fix": false,
    "pre_commit_hook": true,
    "ci_integration": true
}
```

**Configuration Options**:

- `enabled`: Enable/disable humility enforcement
- `severity_threshold`: Minimum severity level to report (low, medium, high, critical)
- `file_extensions`: File types to scan
- `exclude_patterns`: Patterns to exclude from scanning
- `auto_fix`: Enable automatic fixing of common issues
- `pre_commit_hook`: Install pre-commit hook automatically
- `ci_integration`: Enable CI integration features

## Integration Methods

### 1. Pre-Commit Hooks

**Installation**:
```bash
./scripts/humility/humility-enforcer.sh install-hook
```

**What it does**:
- Runs humility detector before each commit
- Prevents commits with boastful language
- Provides feedback on detected issues
- Can be configured for different severity levels

**Customization**:
Edit `.git/hooks/pre-commit` to modify behavior:
```bash
#!/bin/bash
# Custom pre-commit hook

# Run humility detector with custom settings
if ! python3 scripts/humility/humility-detector.py . --min-severity high; then
    echo "❌ High-severity boastful language detected."
    echo "Run 'python3 scripts/humility/humility-detector.py' for details."
    exit 1
fi

echo "✅ Humility check passed."
```

### 2. CI/CD Integration

**GitHub Actions Example**:
```yaml
name: Humility Check
on: [push, pull_request]

jobs:
  humility-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install jq
      - name: Run humility check
        run: |
          chmod +x scripts/humility/humility-enforcer.sh
          ./scripts/humility/humility-enforcer.sh ci-check
```

**GitLab CI Example**:
```yaml
humility_check:
  stage: test
  script:
    - chmod +x scripts/humility/humility-enforcer.sh
    - ./scripts/humility/humility-enforcer.sh ci-check
  only:
    - merge_requests
    - main
```

### 3. VS Code Integration

**Extension Configuration**:
```json
{
    "humility-checker.enabled": true,
    "humility-checker.severity": "warning",
    "humility-checker.autoFix": false,
    "humility-checker.fileExtensions": [".md", ".txt", ".py", ".js", ".ts"]
}
```

**Task Configuration**:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Humility Check",
            "type": "shell",
            "command": "python3",
            "args": ["scripts/humility/humility-detector.py", "${workspaceFolder}"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

## Workflow Integration

### 1. Development Workflow

**Daily Development**:
1. Run humility check before committing
2. Address any detected issues
3. Use auto-fix for common patterns
4. Review changes before committing

**Code Review Process**:
1. Include humility check in review checklist
2. Review language tone and modesty
3. Ensure user-focused rather than system-focused language
4. Verify acknowledgment of limitations

### 2. Documentation Workflow

**Writing Process**:
1. Start with humble language from the beginning
2. Focus on user value rather than system capabilities
3. Acknowledge limitations and alternatives
4. Use collaborative rather than competitive language

**Review Process**:
1. Run humility detector on all documentation
2. Check for boastful language patterns
3. Verify humble tone and modesty
4. Ensure inclusive and respectful language

### 3. Release Process

**Pre-Release Checklist**:
- [ ] Run full humility scan
- [ ] Review all documentation for boastful language
- [ ] Check release notes for humble tone
- [ ] Verify user-focused messaging
- [ ] Test auto-fix functionality

## Best Practices

### 1. Language Guidelines

**Do Use**:
- "This approach aims to..."
- "We attempt to provide..."
- "This system is designed to..."
- "Users can benefit from..."
- "This tool assists with..."

**Don't Use**:
- "This approach achieves..."
- "We provide the best..."
- "This system is revolutionary..."
- "We offer superior..."
- "This tool is powerful..."

### 2. Content Structure

**Lead with User Value**:
- Start with what users can accomplish
- Focus on problems solved rather than features
- Emphasize benefits over capabilities
- Use "you" language when appropriate

**Acknowledge Limitations**:
- Mention what the system doesn't do
- Suggest alternative approaches
- Be honest about trade-offs
- Provide realistic expectations

### 3. Tone and Style

**Collaborative Language**:
- "We work together to..."
- "This approach builds on..."
- "Users contribute to..."
- "The community helps..."

**Modest Claims**:
- "This may help with..."
- "This approach could..."
- "This system attempts to..."
- "This tool aims to..."

## Troubleshooting

### Common Issues

**False Positives**:
- Adjust severity thresholds
- Add exceptions to patterns
- Review context for legitimate use
- Update replacement suggestions

**Missing Detections**:
- Add new patterns to detector
- Review edge cases
- Update confidence scores
- Improve context analysis

**Performance Issues**:
- Exclude large directories
- Use file extension filters
- Run scans incrementally
- Optimize pattern matching

### Debugging

**Enable Verbose Logging**:
```bash
# Add debug output to detector
python3 scripts/humility/humility-detector.py . --verbose

# Check enforcer logs
tail -f .humility-enforcer.log
```

**Test Specific Patterns**:
```python
# Test individual patterns
from scripts.humility.humility_detector import HumilityDetector

detector = HumilityDetector()
test_text = "This is the best solution ever!"
findings = detector.scan_text(test_text)
print(f"Found {len(findings)} issues")
```

## Advanced Usage

### 1. Custom Patterns

**Adding New Patterns**:
```python
# Add to patterns dictionary in humility-detector.py
'custom_category': [
    {
        'pattern': r'\b(your_pattern)\b',
        'severity': SeverityLevel.MEDIUM,
        'confidence': 0.8
    }
]
```

**Custom Replacements**:
```python
# Add to replacements dictionary
'your_word': 'humble_alternative'
```

### 2. Batch Processing

**Process Multiple Projects**:
```bash
#!/bin/bash
# Process multiple repositories

repos=("project1" "project2" "project3")

for repo in "${repos[@]}"; do
    echo "Processing $repo..."
    cd "$repo"
    ./scripts/humility/humility-enforcer.sh scan
    cd ..
done
```

### 3. Integration with Other Tools

**Combine with Linters**:
```bash
# Run multiple checks together
npm run lint && \
python3 scripts/humility/humility-detector.py . && \
npm run test
```

**Custom CI Pipeline**:
```yaml
- name: Code Quality Checks
  run: |
    npm run lint
    python3 scripts/humility/humility-detector.py .
    npm run test
    npm run build
```

## Metrics and Reporting

### 1. Humility Score

The detector calculates a humility score (0-100) based on:
- Number of findings
- Severity levels
- Confidence scores
- Pattern types

**Interpreting Scores**:
- 90-100: Excellent humility
- 80-89: Good humility
- 70-79: Acceptable humility
- 60-69: Needs improvement
- Below 60: Significant issues

### 2. Trend Analysis

**Track Progress Over Time**:
```bash
# Generate weekly reports
python3 scripts/humility/humility-detector.py . --format json --output "humility-report-$(date +%Y-%m-%d).json"
```

**Compare Across Versions**:
```bash
# Compare current with previous version
diff humility-report-old.json humility-report-new.json
```

### 3. Team Metrics

**Individual Contributions**:
- Track changes by author
- Monitor improvement over time
- Identify training needs
- Recognize positive changes

**Project Health**:
- Overall humility score trends
- Category-specific improvements
- File-level analysis
- Release impact assessment

## Conclusion

The humility enforcement system provides comprehensive tools for maintaining humble, respectful communication throughout the Reynard project. By combining automated detection with manual review processes, we can systematically identify and address boastful language while fostering a culture of modesty and collaboration.

The key to success is integrating these tools into your daily workflow, using them consistently, and continuously improving based on feedback and results. Remember that the goal is not to eliminate all positive language, but to ensure that our communication is honest, modest, and focused on user value rather than self-promotion.

---

*This guide is part of the Reynard project's commitment to humble and respectful communication in technology development.*
