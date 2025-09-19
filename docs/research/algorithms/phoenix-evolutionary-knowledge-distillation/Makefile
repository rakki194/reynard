# Makefile for PHOENIX Research Paper
# Compiles LaTeX document with proper bibliography handling

# Main document name (without .tex extension)
MAIN = phoenix_paper

# LaTeX compiler
LATEX = pdflatex
BIBTEX = bibtex

# Output directory
OUTPUT_DIR = .

# Default target
all: $(MAIN).pdf

# Compile the document
$(MAIN).pdf: $(MAIN).tex references.bib
	@echo "🦦 Compiling PHOENIX research paper..."
	$(LATEX) $(MAIN).tex
	$(BIBTEX) $(MAIN)
	$(LATEX) $(MAIN).tex
	$(LATEX) $(MAIN).tex
	@echo "✅ PHOENIX paper compiled successfully!"

# Quick compile (single pass, no bibliography)
quick: $(MAIN).tex
	@echo "🦦 Quick compile of PHOENIX paper..."
	$(LATEX) $(MAIN).tex
	@echo "✅ Quick compile complete!"

# Clean auxiliary files
clean:
	@echo "🧹 Cleaning auxiliary files..."
	rm -f $(MAIN).aux $(MAIN).log $(MAIN).out $(MAIN).toc $(MAIN).bbl $(MAIN).blg
	@echo "✅ Cleanup complete!"

# Clean all generated files
distclean: clean
	@echo "🧹 Cleaning all generated files..."
	rm -f $(MAIN).pdf
	@echo "✅ Deep cleanup complete!"

# Watch for changes and recompile
watch:
	@echo "👀 Watching for changes to $(MAIN).tex..."
	@while inotifywait -e modify $(MAIN).tex references.bib; do \
		echo "📝 File changed, recompiling..."; \
		$(MAIN) all; \
	done

# Check LaTeX installation
check:
	@echo "🔍 Checking LaTeX installation..."
	@which $(LATEX) > /dev/null || (echo "❌ pdflatex not found. Please install texlive-full." && exit 1)
	@which $(BIBTEX) > /dev/null || (echo "❌ bibtex not found. Please install texlive-full." && exit 1)
	@echo "✅ LaTeX installation check passed!"

# Install LaTeX dependencies (Ubuntu/Debian)
install-deps:
	@echo "📦 Installing LaTeX dependencies..."
	sudo apt-get update
	sudo apt-get install -y texlive-full
	@echo "✅ LaTeX dependencies installed!"

# Install LaTeX dependencies (macOS)
install-deps-mac:
	@echo "📦 Installing LaTeX dependencies for macOS..."
	brew install --cask mactex
	@echo "✅ LaTeX dependencies installed for macOS!"

# Show help
help:
	@echo "🦦 PHOENIX Research Paper Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  all          - Compile the complete paper with bibliography (default)"
	@echo "  quick        - Quick compile without bibliography"
	@echo "  clean        - Remove auxiliary files"
	@echo "  distclean    - Remove all generated files"
	@echo "  watch        - Watch for changes and recompile automatically"
	@echo "  check        - Check LaTeX installation"
	@echo "  install-deps - Install LaTeX dependencies (Ubuntu/Debian)"
	@echo "  install-deps-mac - Install LaTeX dependencies (macOS)"
	@echo "  help         - Show this help message"
	@echo ""
	@echo "Usage examples:"
	@echo "  make all     - Full compilation"
	@echo "  make quick   - Quick compilation"
	@echo "  make clean   - Clean up files"
	@echo "  make watch   - Auto-recompile on changes"

# Phony targets
.PHONY: all quick clean distclean watch check install-deps install-deps-mac help
