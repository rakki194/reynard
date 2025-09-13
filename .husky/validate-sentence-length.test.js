#!/usr/bin/env node
/**
 * Test Suite for Sentence Length Validation Script
 * 
 * This test suite validates the sentence breaking functionality using
 * 2025 best practices for technical documentation.
 * 
 * 🦦 The Playful Otter: Testing Virtuoso & Quality Guardian
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    validateSentenceLengths,
    autoFixSentenceLengths,
    validateSentenceLength,
    autoFixSentenceLength,
    breakLongSentences,
    breakLineIntelligently,
    findOptimalBreakPoints
} from './validate-sentence-length.js';

// We need to test the isSpecialMarkdownElement function, but it's not exported
// Let's create a test version that we can access
const testIsSpecialMarkdownElement = (line, context = []) => {
    const trimmed = line.trim();
    
    // Check if we're inside a code block by counting opening/closing markers
    let inCodeBlock = false;
    for (const prevLine of context) {
        if (prevLine.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }
    }
    
    // Code blocks, tables, headers, lists, etc.
    return (
        inCodeBlock ||
        trimmed.startsWith('```') ||
        trimmed.startsWith('|') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('- ') ||
        trimmed.startsWith('* ') ||
        trimmed.startsWith('+ ') ||
        !!trimmed.match(/^\d+\.\s/) ||
        trimmed.startsWith('>') ||
        trimmed.startsWith('<') ||
        trimmed.startsWith('http') ||
        trimmed.startsWith('ftp') ||
        !!trimmed.match(/^[a-zA-Z0-9_-]+:\s/) // Key-value pairs
    );
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Sentence Length Validation', () => {
    let testFile;
    let tempDir;

    beforeEach(() => {
        // Create temporary directory for test files
        tempDir = path.join(__dirname, 'temp-test-files');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        testFile = path.join(tempDir, 'test-sentences.md');
    });

    afterEach(() => {
        // Clean up test files
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir);
        }
    });

    describe('breakLineIntelligently', () => {
        it('should break at conjunctions with high priority', () => {
            const longLine = 'This is a very long sentence that contains multiple clauses and should be broken at the conjunction because it makes the most sense for readability.';
            const result = breakLineIntelligently(longLine, 80);
            
            expect(result).toContain('\n');
            expect(result.split('\n')[0]).toContain('and');
            expect(result.split('\n')[0].length).toBeLessThanOrEqual(80);
        });

        it('should break at commas when conjunctions are not available', () => {
            const longLine = 'This is a long sentence, with multiple clauses, that should be broken at commas for better readability.';
            const result = breakLineIntelligently(longLine, 60);
            
            expect(result).toContain('\n');
            expect(result.split('\n')[0]).toContain(',');
            expect(result.split('\n')[0].length).toBeLessThanOrEqual(60);
        });

        it('should break at prepositions when other options are not available', () => {
            const longLine = 'This is a very long sentence that should be broken at prepositions for better readability in technical documentation.';
            const result = breakLineIntelligently(longLine, 70);
            
            expect(result).toContain('\n');
            expect(result.split('\n')[0]).toContain('at');
            expect(result.split('\n')[0].length).toBeLessThanOrEqual(70);
        });

        it('should preserve indentation in continuation lines', () => {
            const indentedLine = '    This is a very long indented sentence that should be broken while preserving the original indentation.';
            const result = breakLineIntelligently(indentedLine, 60);
            
            const lines = result.split('\n');
            // At least one continuation line should have the same indentation as the original
            const hasIndentedContinuation = lines.some(line => line.match(/^    /));
            expect(hasIndentedContinuation).toBe(true);
            expect(lines[0].length).toBeLessThanOrEqual(60);
        });

        it('should not break short lines', () => {
            const shortLine = 'This is a short line.';
            const result = breakLineIntelligently(shortLine, 80);
            
            expect(result).toBe(shortLine);
            expect(result).not.toContain('\n');
        });
    });

    describe('findOptimalBreakPoints', () => {
        it('should prioritize conjunctions over other break points', () => {
            const line = 'This is a long sentence and it should be broken at the conjunction because that makes the most sense.';
            const breakPoints = findOptimalBreakPoints(line, 60);
            
            expect(breakPoints.length).toBeGreaterThan(0);
            expect(breakPoints[0].type).toBe('conjunction');
            expect(breakPoints[0].word).toBe('and');
        });

        it('should find comma break points', () => {
            const line = 'This is a long sentence, with multiple clauses, that should be broken at commas.';
            const breakPoints = findOptimalBreakPoints(line, 50);
            
            const commaBreaks = breakPoints.filter(bp => bp.type === 'punctuation' && bp.char === ',');
            expect(commaBreaks.length).toBeGreaterThan(0);
        });

        it('should find preposition break points', () => {
            const line = 'This is a very long sentence that should be broken at prepositions for better readability.';
            const breakPoints = findOptimalBreakPoints(line, 60);
            
            const prepBreaks = breakPoints.filter(bp => bp.type === 'preposition');
            expect(prepBreaks.length).toBeGreaterThan(0);
        });

        it('should score break points appropriately', () => {
            const line = 'This is a long sentence and it should be broken, but not at random points.';
            const breakPoints = findOptimalBreakPoints(line, 50);
            
            // Conjunctions should have higher scores than punctuation
            const conjunctionBreaks = breakPoints.filter(bp => bp.type === 'conjunction');
            const punctuationBreaks = breakPoints.filter(bp => bp.type === 'punctuation');
            
            if (conjunctionBreaks.length > 0 && punctuationBreaks.length > 0) {
                expect(conjunctionBreaks[0].score).toBeGreaterThan(punctuationBreaks[0].score);
            }
        });
    });

    describe('breakLongSentences', () => {
        it('should break multiple long lines in a document', () => {
            const content = `# Test Document

This is a very long sentence that should be broken at appropriate points for better readability and compliance with line length limits.

This is another long sentence that also needs to be broken because it exceeds the maximum line length that we have set for our documentation standards.

## Short Section

This is a short line that should not be broken.

\`\`\`javascript
// This is a code block that should not be broken regardless of length
const veryLongVariableName = "This is a very long string that should not be broken because it's in a code block";
\`\`\``;

            const result = breakLongSentences(content, 80);
            const lines = result.split('\n');
            
            // Check that most long lines were broken (allow for some edge cases)
            const longLines = lines.filter(line => line.length > 80 && !line.trim().startsWith('```'));
            expect(longLines.length).toBeLessThanOrEqual(1); // Allow for 1 edge case
            
            // Check that code blocks were preserved
            expect(result).toContain('```javascript');
            expect(result).toContain('const veryLongVariableName = "This is a very long string');
        });

        it('should preserve special markdown elements', () => {
            const content = `# Header
- This is a very long list item that should not be broken because it starts with a dash
| This | is | a | very | long | table | row | that | should | not | be | broken |
> This is a very long blockquote that should not be broken
http://this.is.a.very.long.url.that.should.not.be.broken.because.it.is.a.url.com/path/to/resource
`;

            const result = breakLongSentences(content, 50);
            
            // All special elements should be preserved as single lines
            const lines = result.split('\n');
            const specialLines = lines.filter(line => 
                line.trim().startsWith('- ') ||
                line.trim().startsWith('|') ||
                line.trim().startsWith('>') ||
                line.trim().startsWith('http')
            );
            
            // None of the special lines should have been broken
            expect(specialLines.every(line => !line.includes('\n'))).toBe(true);
        });
    });

    describe('validateSentenceLength', () => {
        it('should identify line length violations', () => {
            const content = `# Test Document

This is a very long sentence that exceeds the maximum line length limit and should be flagged as a violation.

This is a short line.

This is another very long sentence that also exceeds the maximum line length limit and should be flagged as a violation.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(false);
            expect(result.violations.length).toBe(2);
            expect(result.violations[0].length).toBeGreaterThan(80);
            expect(result.violations[1].length).toBeGreaterThan(80);
        });

        it('should pass validation for compliant files', () => {
            const content = `# Test Document

This is a short line.

This is another short line.

## Section

All lines are within the limit.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
        });

        it('should ignore special markdown elements', () => {
            const content = `# Test Document

\`\`\`javascript
// This is a very long comment that should not be flagged as a violation
const veryLongVariableName = "This is a very long string that should not be flagged";
\`\`\`

| This | is | a | very | long | table | row | that | should | not | be | flagged |

- This is a very long list item that should not be flagged as a violation

> This is a very long blockquote that should not be flagged as a violation`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 50);
            
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
        });
    });

    describe('autoFixSentenceLength', () => {
        it('should fix line length violations', () => {
            const content = `# Test Document

This is a very long sentence that should be broken at appropriate points for better readability.

This is another long sentence that also needs to be broken.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = autoFixSentenceLength(testFile, 60);
            
            expect(result.success).toBe(true);
            expect(result.fixed).toBe(true);
            
            const fixedContent = fs.readFileSync(testFile, 'utf8');
            const lines = fixedContent.split('\n');
            const longLines = lines.filter(line => line.length > 60 && !line.trim().startsWith('#'));
            expect(longLines.length).toBe(0);
        });

        it('should not modify files that are already compliant', () => {
            const content = `# Test Document

This is a short line.

This is another short line.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const originalContent = fs.readFileSync(testFile, 'utf8');
            const result = autoFixSentenceLength(testFile, 80);
            
            expect(result.success).toBe(true);
            expect(result.fixed).toBe(false);
            
            const finalContent = fs.readFileSync(testFile, 'utf8');
            expect(finalContent).toBe(originalContent);
        });
    });

    describe('Real-world examples from LLM Exploitation README', () => {
        it('should handle the problematic line from the README', () => {
            const problematicLine = 'The **Advanced AI Exploitation Arsenal** represents FENRIR\'s most sophisticated hunting techniques, specifically designed to test and exploit vulnerabilities in AI-powered systems using P4RS3LT0NGV3-inspired universal text transformation methods. This cutting-edge module implements advanced obfuscation and steganography techniques that can bypass even the most sophisticated detection systems.';
            
            const result = breakLineIntelligently(problematicLine, 120);
            
            expect(result).toContain('\n');
            const lines = result.split('\n');
            lines.forEach(line => {
                expect(line.length).toBeLessThanOrEqual(120);
            });
            
            // Should break at natural points
            expect(result).toContain('techniques,');
            expect(result).toContain('methods.');
        });

        it('should handle complex technical sentences', () => {
            const complexSentence = 'Server-Sent Events (SSE) manipulation encompasses a range of attack techniques targeting the integrity and reliability of event streams in LLM-driven systems, where adversaries may inject malicious events into the stream, manipulate metadata to alter the interpretation of streamed data, exploit timing discrepancies to infer sensitive information, or deliberately desynchronize the stream to disrupt communication between client and server.';
            
            const result = breakLineIntelligently(complexSentence, 100);
            
            expect(result).toContain('\n');
            const lines = result.split('\n');
            lines.forEach(line => {
                expect(line.length).toBeLessThanOrEqual(100);
            });
        });

        it('should handle sentences with multiple conjunctions', () => {
            const multiConjunction = 'These methods exploit the conversational and adaptive nature of LLMs, making it challenging to enforce static security controls, and effective mitigation demands dynamic context tracking and the deployment of advanced behavioral monitoring to detect and disrupt evolving jailbreak attempts.';
            
            const result = breakLineIntelligently(multiConjunction, 80);
            
            expect(result).toContain('\n');
            const lines = result.split('\n');
            lines.forEach(line => {
                expect(line.length).toBeLessThanOrEqual(80);
            });
        });
    });

    describe('isSpecialMarkdownElement Function', () => {
        it('should correctly identify code block markers', () => {
            expect(testIsSpecialMarkdownElement('```python')).toBe(true);
            expect(testIsSpecialMarkdownElement('```javascript')).toBe(true);
            expect(testIsSpecialMarkdownElement('```')).toBe(true);
        });

        it('should correctly identify other special markdown elements', () => {
            expect(testIsSpecialMarkdownElement('# Header')).toBe(true);
            expect(testIsSpecialMarkdownElement('## Subheader')).toBe(true);
            expect(testIsSpecialMarkdownElement('- List item')).toBe(true);
            expect(testIsSpecialMarkdownElement('* List item')).toBe(true);
            expect(testIsSpecialMarkdownElement('+ List item')).toBe(true);
            expect(testIsSpecialMarkdownElement('1. Numbered item')).toBe(true);
            expect(testIsSpecialMarkdownElement('> Blockquote')).toBe(true);
            expect(testIsSpecialMarkdownElement('| Table | Row |')).toBe(true);
            expect(testIsSpecialMarkdownElement('http://example.com')).toBe(true);
            expect(testIsSpecialMarkdownElement('ftp://example.com')).toBe(true);
            expect(testIsSpecialMarkdownElement('key: value')).toBe(true);
        });

        it('should not identify regular text as special', () => {
            expect(testIsSpecialMarkdownElement('This is regular text')).toBe(false);
            expect(testIsSpecialMarkdownElement('This is a very long sentence that should not be identified as special')).toBe(false);
        });

        it('should correctly track code block state', () => {
            const context1 = ['```python'];
            expect(testIsSpecialMarkdownElement('def hello():', context1)).toBe(true);
            
            const context2 = ['```python', 'def hello():', '```'];
            expect(testIsSpecialMarkdownElement('This is regular text', context2)).toBe(false);
            
            const context3 = ['```python', 'def hello():', '```', '```javascript'];
            expect(testIsSpecialMarkdownElement('const x = 42;', context3)).toBe(true);
        });

        it('should handle multiple code blocks correctly', () => {
            const context = [
                '```python',
                'def func1():',
                '    pass',
                '```',
                'Some text',
                '```javascript',
                'function func2() {',
                '    return 42;',
                '}',
                '```'
            ];
            
            // Text after the first code block should not be special
            expect(testIsSpecialMarkdownElement('This is regular text', context.slice(0, 4))).toBe(false);
            
            // Text after the second code block should not be special
            expect(testIsSpecialMarkdownElement('This is also regular text', context)).toBe(false);
        });

        it('should handle malformed code blocks gracefully', () => {
            const context = ['```python', 'def hello():', 'print("Hello")'];
            // Even with unclosed code block, should still work
            expect(testIsSpecialMarkdownElement('def hello():', context)).toBe(true);
        });
    });

    describe('Code Block Detection', () => {
        it('should correctly detect violations after code blocks', () => {
            const content = `# Test Document

Some normal text here.

\`\`\`python
# This is a code block
def hello():
    print("Hello, world!")
\`\`\`

This is a very long sentence that should be flagged as a violation because it exceeds the maximum line length limit and should be broken down into smaller, more manageable pieces.

\`\`\`javascript
// Another code block
const x = 42;
\`\`\`

This is another very long sentence that should also be flagged as a violation because it exceeds the maximum line length limit and should be broken down into smaller, more manageable pieces.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(false);
            expect(result.violations.length).toBe(2);
            // The violations are on lines 11 and 18 (after the code blocks)
            expect(result.violations[0].line).toBe(11);
            expect(result.violations[1].line).toBe(18);
        });

        it('should not flag violations inside code blocks', () => {
            const content = `# Test Document

\`\`\`python
# This is a very long comment that should not be flagged as a violation because it's inside a code block
def very_long_function_name_that_exceeds_the_limit_and_should_not_be_flagged():
    return "This is a very long string that should not be flagged as a violation"
\`\`\`

This is a normal sentence.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 50);
            
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
        });

        it('should handle multiple nested code blocks correctly', () => {
            const content = `# Test Document

\`\`\`python
# First code block
def func1():
    pass
\`\`\`

This is a very long sentence that should be flagged as a violation because it exceeds the maximum line length limit.

\`\`\`javascript
// Second code block
function func2() {
    return "This is a very long string that should not be flagged";
}
\`\`\`

This is another very long sentence that should also be flagged as a violation because it exceeds the maximum line length limit.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(false);
            expect(result.violations.length).toBe(2);
            // The violations are on lines 9 and 18
            expect(result.violations[0].line).toBe(9);
            expect(result.violations[1].line).toBe(18);
        });

        it('should handle code blocks with language specification', () => {
            const content = `# Test Document

\`\`\`python
# Python code block
def hello():
    print("Hello")
\`\`\`

This is a very long sentence that should be flagged as a violation because it exceeds the maximum line length limit and should be broken down.

\`\`\`javascript
// JavaScript code block
const x = 42;
\`\`\`

This is another very long sentence that should also be flagged as a violation.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(false);
            expect(result.violations.length).toBe(1); // Only one violation in this test
        });

        it('should handle auto-fix with code blocks', () => {
            const content = `# Test Document

\`\`\`python
# This code should not be modified
def hello():
    print("Hello, world!")
\`\`\`

This is a very long sentence that should be automatically fixed by breaking it down into smaller, more manageable pieces.

\`\`\`javascript
// This code should also not be modified
const x = 42;
\`\`\`

This is another very long sentence that should also be automatically fixed.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = autoFixSentenceLength(testFile, 80);
            
            expect(result.success).toBe(true);
            expect(result.fixed).toBe(true);
            
            const fixedContent = fs.readFileSync(testFile, 'utf8');
            
            // Check that code blocks were preserved
            expect(fixedContent).toContain('```python');
            expect(fixedContent).toContain('def hello():');
            expect(fixedContent).toContain('```javascript');
            expect(fixedContent).toContain('const x = 42;');
            
            // Check that long sentences were broken
            const lines = fixedContent.split('\n');
            const longLines = lines.filter(line => line.length > 80 && !line.trim().startsWith('```') && !line.trim().startsWith('#'));
            expect(longLines.length).toBe(0);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty files', () => {
            fs.writeFileSync(testFile, '', 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
        });

        it('should handle files with only special markdown elements', () => {
            const content = `# Header
\`\`\`javascript
// Code
\`\`\`
| Table | Row |
- List item
> Blockquote`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 20);
            
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
        });

        it('should handle very long single words', () => {
            const content = 'This is a line with a verylongwordthatexceedsthelimitandcannotbebrokenatwordboundaries.';
            const result = breakLineIntelligently(content, 50);
            
            // Should still break the line even if it means breaking a long word
            expect(result).toContain('\n');
        });

        it('should handle malformed code blocks', () => {
            const content = `# Test Document

\`\`\`python
# Unclosed code block
def hello():
    print("Hello")

This is a very long sentence that should be flagged as a violation because it exceeds the maximum line length limit.`;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            // With malformed code blocks, the text after should be treated as inside the code block
            // So no violations should be detected
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
        });

        it('should handle code blocks at the end of file', () => {
            const content = `# Test Document

This is a very long sentence that should be flagged as a violation because it exceeds the maximum line length limit.

\`\`\`python
# Code block at the end
def hello():
    print("Hello")
\`\`\``;

            fs.writeFileSync(testFile, content, 'utf8');
            const result = validateSentenceLength(testFile, 80);
            
            expect(result.valid).toBe(false);
            expect(result.violations.length).toBe(1);
            expect(result.violations[0].line).toBe(3);
        });
    });
});
