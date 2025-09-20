# PHOENIX Agent Reconstruction Experiments

**Author**: Recognition-Grandmaster-27 (Tiger Specialist)
**Version**: 1.0.0
**Date**: 2025-09-20

## Overview

This module provides a comprehensive experimental framework for evaluating agent reconstruction using the PHOENIX evolutionary knowledge distillation system. The framework is designed with a modular architecture following the 140-line axiom, with small, focused files and orchestrators.

## Architecture

### Core Components

- **`orchestrator.py`** - Main experiment orchestrator
- **`config.py`** - Configuration management and target specifications
- **`metrics.py`** - Quantitative reconstruction success measures
- **`baseline.py`** - Baseline reconstruction methods for comparison
- **`phoenix_reconstruction.py`** - PHOENIX-based reconstruction methods
- **`evaluator.py`** - Agent evaluation framework
- **`analyzer.py`** - Statistical analysis and significance testing
- **`main.py`** - Command-line interface and experiment runner

### Design Principles

1. **Modular Architecture**: Each component has a single responsibility
2. **140-Line Axiom**: All files are under 140 lines for maintainability
3. **Async Support**: Full async/await support for scalability
4. **Statistical Rigor**: Comprehensive statistical analysis with significance testing
5. **Reproducibility**: Deterministic results with proper random seeding

## Experiment Types

### 1. Baseline Experiments

- **Random Reconstruction**: Random trait assignment
- **Average Reconstruction**: Average trait values
- **Documentation-Based**: Reconstruction from documentation

### 2. PHOENIX Evolutionary

- **Evolutionary Reconstruction**: Multi-generational evolution
- **Population-Based**: Genetic algorithm approach
- **Fitness-Driven**: Selection based on reconstruction quality

### 3. PHOENIX Direct

- **Knowledge Distillation**: Direct knowledge transfer
- **Subliminal Learning**: Hidden signal extraction
- **Genetic Material**: Trait inheritance simulation

### 4. Comparative Experiments

- **Baseline vs PHOENIX**: Comprehensive comparison
- **Method Evaluation**: Statistical significance testing
- **Effect Size Analysis**: Practical significance assessment

## Success Metrics

### Trait Accuracy Metrics

- **Trait Accuracy**: Percentage of traits within tolerance
- **Trait Precision**: Correlation-based precision
- **Trait Recall**: Correlation-based recall
- **Trait F1-Score**: Harmonic mean of precision and recall

### Performance Metrics

- **Performance Match**: Alignment with expected performance
- **Response Time Error**: Deviation from expected response time
- **Consistency Score**: Behavioral consistency measure

### Behavioral Similarity Metrics

- **Behavioral Similarity**: Response pattern matching
- **Response Correlation**: Statistical correlation of responses
- **Decision Alignment**: Decision-making pattern similarity

### Knowledge Fidelity Metrics

- **Knowledge Fidelity**: Domain expertise preservation
- **Domain Expertise Match**: Specialization accuracy
- **Specialization Accuracy**: Skill set preservation

### Overall Metrics

- **Overall Success**: Weighted combination of all metrics
- **Reconstruction Quality**: Final quality assessment

## Usage

### Command Line Interface

```bash
# Run comparative experiment
python -m experiments.main --experiment-type comparative --trials 10

# Run PHOENIX evolutionary experiment
python -m experiments.main --experiment-type phoenix_evolutionary --population-size 100

# Run baseline experiment
python -m experiments.main --experiment-type baseline --trials 5

# Run with custom parameters
python -m experiments.main \
    --experiment-type comparative \
    --trials 20 \
    --population-size 50 \
    --max-generations 30 \
    --results-dir custom_results \
    --log-level DEBUG
```

### Programmatic Usage

```python
from experiments import ExperimentConfig, ExperimentType, ExperimentOrchestrator

# Create configuration
config = ExperimentConfig(
    experiment_type=ExperimentType.COMPARATIVE,
    num_trials=10,
    population_size=50,
    max_generations=20
)

# Run experiment
orchestrator = ExperimentOrchestrator(config)
results = await orchestrator.run_experiment()
```

## Statistical Analysis

### Descriptive Statistics

- Mean, median, standard deviation
- Min, max, quartiles
- Sample size and distribution

### Comparative Analysis

- Method-to-method comparisons
- Performance differences
- Percent improvement calculations

### Significance Testing

- Independent samples t-tests
- P-value calculations
- Significance threshold (α = 0.05)

### Effect Size Analysis

- Cohen's d calculations
- Practical significance assessment
- Effect size interpretation

### Confidence Intervals

- 95% confidence intervals
- Margin of error calculations
- Statistical precision assessment

## Results Structure

### Trial Results

```json
{
  "trial_number": 0,
  "start_time": "2025-09-20T10:00:00",
  "methods": {
    "baseline": {
      "random": {
        "agent": {...},
        "metrics": {...}
      },
      "average": {...},
      "documentation": {...}
    },
    "phoenix": {
      "evolutionary": {...},
      "direct": {...}
    }
  },
  "end_time": "2025-09-20T10:30:00"
}
```

### Summary Analysis

```json
{
  "descriptive_statistics": {...},
  "comparative_analysis": {...},
  "significance_testing": {...},
  "effect_sizes": {...},
  "confidence_intervals": {...},
  "recommendations": [...]
}
```

## Target Agent: Success-Advisor-8

### Agent Specifications

- **ID**: success-advisor-8
- **Name**: Success-Advisor-8
- **Spirit**: Lion (leadership, protection, authority)
- **Style**: Foundation (strategic, systematic approach)

### Personality Traits

- **Determination**: 0.95 (high persistence)
- **Protectiveness**: 0.88 (guardian instincts)
- **Charisma**: 0.92 (inspirational leadership)
- **Leadership**: 0.90 (natural authority)
- **Confidence**: 0.94 (self-assured)
- **Strategic Thinking**: 0.89 (long-term planning)
- **Reliability**: 0.93 (dependable)
- **Excellence**: 0.91 (high standards)

### Physical Traits

- **Size**: 0.85 (imposing presence)
- **Strength**: 0.90 (physical capability)
- **Agility**: 0.75 (balanced movement)
- **Endurance**: 0.88 (sustained performance)
- **Appearance**: 0.87 (commanding presence)
- **Grace**: 0.82 (elegant movement)

### Ability Traits

- **Strategist**: 0.95 (strategic planning)
- **Leader**: 0.92 (team coordination)
- **Protector**: 0.90 (safety assurance)
- **Coordinator**: 0.88 (resource management)
- **Analyzer**: 0.85 (systematic analysis)
- **Communicator**: 0.87 (effective communication)

### Performance Expectations

- **Expected Accuracy**: 0.95
- **Expected Response Time**: 1.2 seconds
- **Expected Consistency**: 0.94

### Domain Expertise

- Release Management
- Quality Assurance
- Automation
- PHOENIX Framework
- Reynard Ecosystem

### Specializations

- Release Management
- Quality Assurance
- Automation
- Agent Development

### Achievements

- Successfully released v0.8.7
- Implemented PHOENIX framework
- Created comprehensive documentation
- Established agent state persistence

## Evaluation Scenarios

### 1. Release Management

- **Prompt**: "How would you handle a critical bug in production?"
- **Expected Traits**: Leadership, Strategic Thinking, Reliability
- **Expected Style**: Systematic and authoritative

### 2. Quality Assurance

- **Prompt**: "Describe your approach to ensuring code quality."
- **Expected Traits**: Perfectionism, Excellence, Systematic
- **Expected Style**: Detailed and thorough

### 3. Team Coordination

- **Prompt**: "How do you coordinate with team members?"
- **Expected Traits**: Charisma, Leadership, Communication
- **Expected Style**: Collaborative and inspiring

### 4. Problem Solving

- **Prompt**: "Walk through your problem-solving process."
- **Expected Traits**: Strategic Thinking, Analytical, Systematic
- **Expected Style**: Logical and structured

### 5. Crisis Management

- **Prompt**: "How do you handle high-pressure situations?"
- **Expected Traits**: Determination, Confidence, Reliability
- **Expected Style**: Calm and decisive

## Dependencies

### Core Dependencies

- `numpy` - Numerical computations
- `scipy` - Statistical analysis
- `asyncio` - Asynchronous programming
- `dataclasses` - Data structure management
- `pathlib` - File system operations
- `json` - Data serialization
- `logging` - Logging framework

### PHOENIX Dependencies

- `phoenix_framework` - Core PHOENIX system
- `knowledge_distillation` - Knowledge transfer
- `data_structures` - Agent state management

## Output Files

### Results Directory Structure

```
results/
├── experiment.log              # Experiment log file
├── intermediate_results.json   # Intermediate results
├── final_results.json         # Final experiment results
└── summary_report.txt         # Human-readable summary
```

### Log Files

- **experiment.log**: Detailed experiment execution log
- **Console Output**: Real-time progress and status updates

### Data Files

- **intermediate_results.json**: Results saved during execution
- **final_results.json**: Complete experiment results
- **summary_report.txt**: Formatted summary report

## Best Practices

### Experimental Design

1. **Randomization**: Use proper random seeding
2. **Control Groups**: Include baseline comparisons
3. **Sample Size**: Ensure adequate statistical power
4. **Multiple Trials**: Run sufficient trials for reliability

### Statistical Analysis

1. **Significance Testing**: Use appropriate statistical tests
2. **Effect Sizes**: Report practical significance
3. **Confidence Intervals**: Provide uncertainty estimates
4. **Multiple Comparisons**: Adjust for multiple testing

### Reproducibility

1. **Seed Management**: Use consistent random seeds
2. **Version Control**: Track code and configuration changes
3. **Documentation**: Document all experimental procedures
4. **Data Archival**: Preserve raw data and results

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Memory Issues**: Reduce population size or generations
3. **Timeout Errors**: Increase timeout limits
4. **File Permissions**: Check write permissions for results directory

### Performance Optimization

1. **Parallel Processing**: Use async/await for I/O operations
2. **Memory Management**: Monitor memory usage
3. **Caching**: Cache intermediate results
4. **Batch Processing**: Process data in batches

## Future Enhancements

### Planned Features

1. **Multi-Agent Experiments**: Test multiple target agents
2. **Cross-Validation**: K-fold cross-validation support
3. **Hyperparameter Tuning**: Automated parameter optimization
4. **Visualization**: Results visualization and plotting
5. **Real-Time Monitoring**: Live experiment monitoring

### Research Directions

1. **Novel Metrics**: Development of new evaluation metrics
2. **Advanced Statistics**: Bayesian analysis methods
3. **Machine Learning**: ML-based reconstruction methods
4. **Scalability**: Large-scale experiment support

## Contributing

### Development Guidelines

1. **Code Style**: Follow PEP 8 and project conventions
2. **Testing**: Write comprehensive tests
3. **Documentation**: Update documentation for changes
4. **Review Process**: Submit pull requests for review

### Testing

```bash
# Run unit tests
python -m pytest tests/

# Run integration tests
python -m pytest tests/integration/

# Run with coverage
python -m pytest --cov=experiments tests/
```

## License

This experimental framework is part of the PHOENIX project and follows the same licensing terms.

## Contact

For questions or issues related to the experimental framework, please contact the development team or create an issue in the project repository.
