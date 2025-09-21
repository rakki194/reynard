# Real Agent Genome Experiment

This experiment tests the Phoenix framework's genome-based conditioning hypothesis using real agents through Ollama integration.

## Overview

The experiment compares agent performance with and without genome data (trait-based system prompts) to validate whether:

1. Genome data improves agent performance
2. Spirit-based conditioning affects agent behavior
3. Trait manifestation can be measured in real outputs

## Prerequisites

### 1. Ollama Installation

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the Qwen model
ollama pull qwen2.5:7b
```

### 2. Python Dependencies

```bash
pip install -r real_agent_requirements.txt
```

### 3. Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return available models
```

## Usage

### Basic Experiment

```bash
cd /home/kade/runeset/reynard/experimental/phoenix/research
python real_agent_genome_experiment.py
```

### Custom Configuration

```bash
# Run with more trials
python real_agent_genome_experiment.py --trials 20

# Use different model
python real_agent_genome_experiment.py --model llama3.1:8b

# Enable verbose logging
python real_agent_genome_experiment.py --verbose
```

## Experiment Design

### Test Agents

The experiment uses 4 different agent types:

- **Fox Agent**: Strategic, cunning, analytical
- **Wolf Agent**: Loyal, protective, team-oriented
- **Otter Agent**: Playful, thorough, quality-focused
- **Lion Agent**: Confident, regal, leadership-focused

### Evaluation Tasks

Each agent performs 5 different types of tasks:

1. Software architecture analysis
2. Evolutionary algorithms explanation
3. Knowledge distillation description
4. Database design analysis
5. Distributed system planning

### Comparison Method

For each trial:

1. **With Genome**: Agent receives system prompt based on traits/spirit
2. **Without Genome**: Agent receives no system prompt (baseline)
3. **Analysis**: Response is analyzed for quality, spirit alignment, trait manifestation

## Metrics Analyzed

### Quality Metrics

- **Quality Score**: Overall response quality (0.0-1.0)
- **Technical Terms**: Count of technical terminology
- **Response Length**: Word count of response

### Spirit Alignment

- **Spirit Alignment**: How well response matches spirit characteristics
- **Trait Manifestation**: Expression of specific personality/ability traits

### Behavioral Indicators

- **Creativity Indicators**: Innovation and creative thinking
- **Leadership Indicators**: Leadership and authority expressions
- **Analytical Indicators**: Logical and systematic thinking

## Expected Results

### Hypothesis

Genome-based conditioning should show:

1. **Higher Quality Scores**: Better responses with trait-based prompts
2. **Better Spirit Alignment**: Responses more aligned with spirit characteristics
3. **Enhanced Trait Manifestation**: Stronger expression of agent traits
4. **Improved Task Performance**: Better task-specific performance

### Statistical Analysis

- **Sample Size**: Configurable (default 10 trials per condition)
- **Comparison**: Paired t-tests for each metric
- **Effect Size**: Cohen's d for practical significance
- **Significance**: p < 0.05 threshold

## Output Files

### Results JSON

```json
{
  "with_genome": [...],
  "without_genome": [...],
  "comparison_analysis": {
    "with_genome_averages": {...},
    "without_genome_averages": {...},
    "improvements_percent": {...},
    "sample_size": 10,
    "statistical_significance": "TBD"
  },
  "timestamp": "2025-09-21T..."
}
```

### Analysis Summary

- Average metrics for each condition
- Percentage improvements
- Statistical significance indicators
- Key findings and insights

## Troubleshooting

### Common Issues

#### Ollama Not Available

```bash
# Start Ollama service
ollama serve

# Check if running
ps aux | grep ollama
```

#### Model Not Found

```bash
# List available models
ollama list

# Pull specific model
ollama pull qwen2.5:7b
```

#### Connection Timeout

- Check firewall settings
- Verify Ollama is on localhost:11434
- Try different model if current one is too slow

### Debug Mode

```bash
python real_agent_genome_experiment.py --verbose
```

## Integration with Phoenix Framework

### Data Collection

The experiment collects real agent data that can be used for:

- Phoenix framework validation
- Knowledge distillation training
- Evolutionary algorithm improvement
- Trait inheritance analysis

### Genome Data Format

```json
{
  "agent_id": "test_fox_001",
  "spirit": "fox",
  "traits": {...},
  "response": "...",
  "analysis": {...}
}
```

## Future Enhancements

### Planned Features

1. **Multi-Model Support**: Test with different LLM models
2. **Advanced Statistical Analysis**: Bayesian analysis, effect size calculations
3. **Longitudinal Studies**: Track agent evolution over time
4. **Cross-Domain Validation**: Test across different task domains
5. **Real-Time Integration**: Live agent data collection

### Research Extensions

1. **Trait Inheritance**: Study how traits transfer between generations
2. **Spirit Evolution**: Track spirit-based behavior changes
3. **Performance Optimization**: Optimize genome conditioning strategies
4. **Domain Specialization**: Test domain-specific trait manifestations

## Contributing

To contribute to this experiment:

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request with results

## License

This experiment is part of the Reynard Phoenix framework research project.
