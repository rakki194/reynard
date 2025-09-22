# Makefile for CULTURE Research Project
# Compiles LaTeX document with proper bibliography handling

LATEX = pdflatex
BIBTEX = bibtex
MAIN = docs/research_paper/culture_paper
OUTPUT_DIR = docs/research_paper

# Default target
all: $(MAIN).pdf

# Compile the document
$(MAIN).pdf: $(MAIN).tex
	@echo "🦊 Compiling CULTURE research paper..."
	$(LATEX) $(MAIN).tex
	$(BIBTEX) $(MAIN)
	$(LATEX) $(MAIN).tex
	$(LATEX) $(MAIN).tex
	@echo "✅ CULTURE paper compiled successfully!"

# Quick compile (single pass, no bibliography)
quick: $(MAIN).tex
	@echo "🦊 Quick compile of CULTURE paper..."
	$(LATEX) $(MAIN).tex
	@echo "✅ Quick compile complete!"

# Clean auxiliary files
clean:
	@echo "🧹 Cleaning auxiliary files..."
	rm -f $(MAIN).aux $(MAIN).log $(MAIN).out $(MAIN).toc $(MAIN).bbl $(MAIN).blg $(MAIN).fdb_latexmk $(MAIN).fls $(MAIN).synctex.gz
	@echo "✅ Clean complete!"

# Clean everything including PDF
distclean: clean
	@echo "🧹 Cleaning PDF files..."
	rm -f $(MAIN).pdf
	@echo "✅ Distclean complete!"

# Install Python dependencies
install:
	@echo "📦 Installing CULTURE dependencies..."
	pip install -r requirements.txt
	@echo "✅ Dependencies installed!"

# Run tests
test:
	@echo "🧪 Running CULTURE tests..."
	python -m pytest tests/ -v
	@echo "✅ Tests completed!"

# Run cultural evaluation
evaluate:
	@echo "🎯 Running cultural evaluation..."
	python main.py evaluate --model llama-3-8b --sample-size 50
	@echo "✅ Evaluation completed!"

# Train DPO model
train-dpo:
	@echo "🎓 Training DPO model..."
	python main.py train-dpo --model meta-llama/Llama-2-7b-hf --num-examples 500
	@echo "✅ DPO training completed!"

# Generate sample scenarios
generate-scenarios:
	@echo "📝 Generating sample scenarios..."
	python main.py generate-scenarios --scenarios 20 --output data/sample_scenarios.json
	@echo "✅ Scenarios generated!"

# Analyze benchmark
analyze-benchmark:
	@echo "📊 Analyzing benchmark..."
	python main.py analyze-benchmark --benchmark taarof --output data/benchmark_analysis.json
	@echo "✅ Benchmark analysis completed!"

# Compare models
compare-models:
	@echo "⚖️ Comparing models..."
	python main.py compare-models --models llama-3-8b gpt-4 claude-3 --sample-size 30
	@echo "✅ Model comparison completed!"

# Format code
format:
	@echo "🎨 Formatting code..."
	black src/ tests/ main.py
	@echo "✅ Code formatted!"

# Lint code
lint:
	@echo "🔍 Linting code..."
	flake8 src/ tests/ main.py
	mypy src/ main.py
	@echo "✅ Linting completed!"

# Full development setup
setup: install
	@echo "🚀 Setting up CULTURE development environment..."
	mkdir -p data logs outputs
	@echo "✅ Development setup complete!"

# Run all quality checks
quality: format lint test
	@echo "✅ All quality checks passed!"

# Generate documentation
docs: $(MAIN).pdf
	@echo "📚 Generating documentation..."
	@echo "✅ Documentation generated!"

# Show help
help:
	@echo "🦊 CULTURE Research Project Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  all              - Compile the research paper (default)"
	@echo "  quick            - Quick compile without bibliography"
	@echo "  clean            - Remove auxiliary files"
	@echo "  distclean        - Remove all generated files"
	@echo "  install          - Install Python dependencies"
	@echo "  test             - Run test suite"
	@echo "  evaluate         - Run cultural evaluation"
	@echo "  train-dpo        - Train DPO model"
	@echo "  generate-scenarios - Generate sample scenarios"
	@echo "  analyze-benchmark - Analyze benchmark statistics"
	@echo "  compare-models   - Compare multiple models"
	@echo "  format           - Format code with black"
	@echo "  lint             - Lint code with flake8 and mypy"
	@echo "  setup            - Full development setup"
	@echo "  quality          - Run all quality checks"
	@echo "  docs             - Generate documentation"
	@echo "  help             - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make all                    # Compile research paper"
	@echo "  make evaluate               # Run evaluation"
	@echo "  make train-dpo              # Train DPO model"
	@echo "  make quality                # Run all quality checks"

.PHONY: all quick clean distclean install test evaluate train-dpo generate-scenarios analyze-benchmark compare-models format lint setup quality docs help
