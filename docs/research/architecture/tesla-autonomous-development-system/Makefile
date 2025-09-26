# TESLA Research Paper Makefile
# Compiles the TESLA autonomous development system research paper

# Variables
PAPER_NAME = tesla_paper
TEX_FILE = $(PAPER_NAME).tex
PDF_FILE = $(PAPER_NAME).pdf
ASSETS_DIR = ../../shared-assets

# LaTeX compiler and options
LATEX = pdflatex
LATEX_OPTS = -interaction=nonstopmode

# Default target
all: $(PDF_FILE)

# Compile the paper
$(PDF_FILE): $(TEX_FILE)
	@echo "🦊 Compiling TESLA research paper..."
	$(LATEX) $(LATEX_OPTS) $(TEX_FILE)
	$(LATEX) $(LATEX_OPTS) $(TEX_FILE)  # Run twice for proper references
	@echo "✅ TESLA paper compiled successfully: $(PDF_FILE)"

# Quick compile (single pass)
quick: $(TEX_FILE)
	@echo "🦊 Quick compile of TESLA paper..."
	$(LATEX) $(LATEX_OPTS) $(TEX_FILE)
	@echo "✅ Quick compile completed"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning TESLA paper build artifacts..."
	rm -f $(PAPER_NAME).pdf $(PAPER_NAME).aux $(PAPER_NAME).log $(PAPER_NAME).out $(PAPER_NAME).toc $(PAPER_NAME).bbl $(PAPER_NAME).blg
	@echo "✅ Clean completed"

# Clean and rebuild
rebuild: clean all

# View the compiled PDF
view: $(PDF_FILE)
	@echo "📖 Opening TESLA paper..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open $(PDF_FILE); \
	elif command -v open > /dev/null; then \
		open $(PDF_FILE); \
	else \
		echo "Please open $(PDF_FILE) manually"; \
	fi

# Check for required assets
check-assets:
	@echo "🔍 Checking for required assets..."
	@if [ ! -f "$(ASSETS_DIR)/favicon.pdf" ]; then \
		echo "⚠️  Warning: favicon.pdf not found at $(ASSETS_DIR)/favicon.pdf"; \
		echo "   The paper will compile but without the Reynard logo"; \
	else \
		echo "✅ All required assets found"; \
	fi

# Install LaTeX dependencies (Ubuntu/Debian)
install-deps:
	@echo "📦 Installing LaTeX dependencies..."
	sudo apt-get update
	sudo apt-get install -y texlive-latex-extra texlive-fonts-recommended texlive-latex-recommended
	@echo "✅ LaTeX dependencies installed"

# Install LaTeX dependencies (macOS with Homebrew)
install-deps-mac:
	@echo "📦 Installing LaTeX dependencies (macOS)..."
	brew install --cask mactex
	@echo "✅ LaTeX dependencies installed"

# Help target
help:
	@echo "🦊 TESLA Research Paper Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  all          - Compile the complete paper (default)"
	@echo "  quick        - Quick compile (single pass)"
	@echo "  clean        - Remove build artifacts"
	@echo "  rebuild      - Clean and rebuild"
	@echo "  view         - Open the compiled PDF"
	@echo "  check-assets - Check for required assets"
	@echo "  install-deps - Install LaTeX dependencies (Ubuntu/Debian)"
	@echo "  install-deps-mac - Install LaTeX dependencies (macOS)"
	@echo "  help         - Show this help message"
	@echo ""
	@echo "Usage examples:"
	@echo "  make all     # Compile the paper"
	@echo "  make view    # Compile and view the paper"
	@echo "  make clean   # Clean build artifacts"

# Phony targets
.PHONY: all quick clean rebuild view check-assets install-deps install-deps-mac help
