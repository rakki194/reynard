#!/bin/bash
# Big ECS World Evolution Simulation Runner
# Runs a large-scale simulation with comprehensive analysis and visualization

echo "🦊 Big ECS World Evolution Simulation"
echo "====================================="
echo "Running large-scale simulation with comprehensive analysis"
echo "====================================="

# Change to the ecs-world package directory
cd "$(dirname "$0")"

echo "📁 Working directory: $(pwd)"
echo "🐍 Python path: $(which python3)"

# Check if matplotlib is available
echo ""
echo "🔍 Checking dependencies..."
bash -c "source ~/venv/bin/activate && python -c \"
import matplotlib
import numpy as np
print('✅ matplotlib available:', matplotlib.__version__)
print('✅ numpy available:', np.__version__)
\""

if [ $? -ne 0 ]; then
    echo "❌ Missing dependencies. Installing matplotlib and numpy..."
    bash -c "source ~/venv/bin/activate && pip install matplotlib numpy"
fi

# Run the big simulation
echo ""
echo "🌍 Running Big Evolution Simulation..."
echo "--------------------------------------"

bash -c "source ~/venv/bin/activate && python big_evolution_simulation.py"

if [ $? -eq 0 ]; then
    echo "✅ Big simulation completed successfully!"
else
    echo "❌ Big simulation failed!"
    exit 1
fi

# Run the analysis
echo ""
echo "📊 Running Evolution Data Analysis..."
echo "------------------------------------"

bash -c "source ~/venv/bin/activate && python analyze_evolution_data.py"

if [ $? -eq 0 ]; then
    echo "✅ Analysis completed successfully!"
else
    echo "❌ Analysis failed!"
    exit 1
fi

# Display results summary
echo ""
echo "📋 Simulation Results Summary"
echo "============================="

if [ -f "temp_simulation_data/evolution_simulation_data.json" ]; then
    echo "📁 Simulation data: temp_simulation_data/evolution_simulation_data.json"
    
    # Extract key statistics
    bash -c "source ~/venv/bin/activate && python -c \"
import json
with open('temp_simulation_data/evolution_simulation_data.json', 'r') as f:
    data = json.load(f)

print('📊 Key Statistics:')
print(f'   Initial Population: {data[\"metadata\"][\"population_size\"]}')
print(f'   Final Population: {data[\"statistics\"][\"population_over_time\"][-1]}')
print(f'   Total Generations: {len(data[\"generations\"])}')
print(f'   Total Breeding Events: {len(data[\"statistics\"][\"breeding_events\"])}')
print(f'   Final Genetic Diversity: {data[\"statistics\"][\"genetic_diversity\"][-1]:.3f}')

# Show trait evolution
print('\\n🎯 Trait Evolution Summary:')
for trait in ['dominance', 'loyalty', 'cunning', 'aggression']:
    if trait in data['statistics']['trait_evolution']:
        means = data['statistics']['trait_evolution'][trait]['mean_over_time']
        change = means[-1] - means[0]
        trend = 'increased' if change > 0 else 'decreased'
        print(f'   {trait.capitalize()}: {change:+.3f} ({trend})')
\""
fi

if [ -f "temp_simulation_data/evolution_analysis_report.json" ]; then
    echo "📊 Analysis report: temp_simulation_data/evolution_analysis_report.json"
fi

if [ -f "temp_simulation_data/evolution_analysis.png" ]; then
    echo "📈 Visualizations: temp_simulation_data/evolution_analysis.png"
fi

echo ""
echo "🎉 Big ECS World Evolution Simulation Completed!"
echo "🦊 Check the temp_simulation_data/ directory for all results"
echo ""
echo "📁 Files generated:"
echo "   - evolution_simulation_data.json (raw simulation data)"
echo "   - evolution_analysis_report.json (comprehensive analysis)"
echo "   - evolution_analysis.png (visualization plots)"
echo ""
echo "🔍 To view the plots, open: temp_simulation_data/evolution_analysis.png"
