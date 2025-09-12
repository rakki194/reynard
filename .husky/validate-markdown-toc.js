#!/usr/bin/env node
/**
 * Markdown Table of Contents Validation Script for Reynard Framework
 * 
 * This script validates that all markdown files in backend/, docs/, and src/ directories
 * have a proper Table of Contents (ToC) under the first H2 heading and that the ToC
 * is up-to-date with the actual headings in the document.
 * 
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Colors for terminal output (matching Reynard style)
const Colors = {
    RED: '\u001b[0;31m',
    GREEN: '\u001b[0;32m',
    YELLOW: '\u001b[1;33m',
    BLUE: '\u001b[0;34m',
    PURPLE: '\u001b[0;35m',
    CYAN: '\u001b[0;36m',
    WHITE: '\u001b[1;37m',
    NC: '\u001b[0m' // No Color
};

function printColored(message, color = Colors.NC) {
    console.log(`${color}${message}${Colors.NC}`);
}

/**
 * Parse markdown content and extract headings
 * @param {string} content - Markdown file content
 * @returns {Array} Array of heading objects with level, text, and line number
 */
function extractHeadings(content) {
    const lines = content.split('\n');
    const headings = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            headings.push({
                level,
                text,
                lineNumber: i + 1,
                raw: line
            });
        }
    }
    
    return headings;
}

/**
 * Generate a Table of Contents from headings
 * @param {Array} headings - Array of heading objects
 * @param {number} startLevel - Starting heading level (default: 2)
 * @returns {string} Generated ToC markdown
 */
function generateToC(headings, startLevel = 2) {
    if (headings.length === 0) {
        return '';
    }
    
    // Filter headings at or below the start level, excluding ToC headings
    const relevantHeadings = headings.filter(h => 
        h.level >= startLevel && 
        !h.text.toLowerCase().includes('table of contents') &&
        !h.text.toLowerCase().includes('toc')
    );
    
    if (relevantHeadings.length === 0) {
        return '';
    }
    
    const tocLines = ['## Table of Contents', ''];
    
    // Group headings by their hierarchy
    const headingGroups = [];
    let currentGroup = null;
    
    for (const heading of relevantHeadings) {
        if (heading.level === startLevel) {
            // Start a new group
            if (currentGroup) {
                headingGroups.push(currentGroup);
            }
            currentGroup = {
                main: heading,
                subs: []
            };
        } else if (currentGroup && heading.level > startLevel) {
            // Add as sub-heading
            currentGroup.subs.push(heading);
        }
    }
    
    // Add the last group
    if (currentGroup) {
        headingGroups.push(currentGroup);
    }
    
    // Generate ToC from groups
    for (const group of headingGroups) {
        const anchor = group.main.text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        const link = `[${group.main.text}](#${anchor})`;
        tocLines.push(`- ${link}`);
        
        // Add sub-headings
        for (const sub of group.subs) {
            const subAnchor = sub.text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
            
            const subLink = `[${sub.text}](#${subAnchor})`;
            tocLines.push(`  - ${subLink}`);
        }
    }
    
    tocLines.push(''); // Empty line after ToC
    return tocLines.join('\n');
}

/**
 * Extract existing ToC from markdown content
 * @param {string} content - Markdown file content
 * @returns {Object} ToC info with content, startLine, endLine
 */
function extractExistingToC(content) {
    const lines = content.split('\n');
    let tocStart = -1;
    let tocEnd = -1;
    let tocContent = '';
    
    // Look for ToC section
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for ToC heading (case insensitive, various formats)
        if (line.match(/^##\s+(table\s+of\s+contents|toc|contents?)$/i)) {
            tocStart = i;
            tocContent = line + '\n';
            
            // Collect ToC content until next heading or empty line followed by heading
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j];
                
                // Stop at next heading (## or higher)
                if (nextLine.match(/^#{1,2}\s+/)) {
                    tocEnd = j - 1;
                    break;
                }
                
                // Stop at empty line followed by heading
                if (nextLine.trim() === '' && j + 1 < lines.length && lines[j + 1].match(/^#{1,2}\s+/)) {
                    tocEnd = j - 1;
                    break;
                }
                
                tocContent += nextLine + '\n';
            }
            
            if (tocEnd === -1) {
                tocEnd = lines.length - 1;
            }
            
            break;
        }
    }
    
    return {
        content: tocContent.trim(),
        startLine: tocStart + 1,
        endLine: tocEnd + 1,
        found: tocStart !== -1
    };
}

/**
 * Check if ToC is up-to-date
 * @param {string} existingToC - Current ToC content
 * @param {string} expectedToC - Expected ToC content
 * @returns {boolean} True if ToC is up-to-date
 */
function isToCUpToDate(existingToC, expectedToC) {
    // Normalize both ToCs for comparison
    const normalize = (toc) => {
        return toc
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s-]/g, '')
            .trim();
    };
    
    const normalizedExisting = normalize(existingToC);
    const normalizedExpected = normalize(expectedToC);
    
    return normalizedExisting === normalizedExpected;
}

/**
 * Validate a single markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {Object} Validation result
 */
function validateMarkdownFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const headings = extractHeadings(content);
        
        // Find first H2 heading
        const firstH2 = headings.find(h => h.level === 2);
        
        if (!firstH2) {
            return {
                valid: false,
                error: 'No H2 heading found',
                file: filePath,
                line: 0
            };
        }
        
        // Extract existing ToC
        const existingToC = extractExistingToC(content);
        
        if (!existingToC.found) {
            return {
                valid: false,
                error: 'No Table of Contents found after first H2 heading',
                file: filePath,
                line: firstH2.lineNumber + 1,
                suggestion: 'Add a "## Table of Contents" section after the first H2 heading'
            };
        }
        
        // Generate expected ToC
        const expectedToC = generateToC(headings, 2);
        
        // Check if ToC is up-to-date
        if (!isToCUpToDate(existingToC.content, expectedToC)) {
            return {
                valid: false,
                error: 'Table of Contents is out of date',
                file: filePath,
                line: existingToC.startLine,
                suggestion: 'Update the ToC to match current headings',
                expectedToC: expectedToC
            };
        }
        
        return {
            valid: true,
            file: filePath,
            tocLineCount: existingToC.endLine - existingToC.startLine + 1
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `Failed to read file: ${error.message}`,
            file: filePath,
            line: 0
        };
    }
}

/**
 * Get staged markdown files in target directories
 * @returns {Array} Array of staged markdown file paths
 */
function getStagedMarkdownFiles() {
    try {
        const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
        const allFiles = stagedFiles.trim().split('\n').filter(f => f);
        
        // Filter for markdown files in target directories
        const targetDirs = ['backend/', 'docs/', 'src/'];
        const markdownFiles = allFiles.filter(file => {
            return file.endsWith('.md') && targetDirs.some(dir => file.startsWith(dir));
        });
        
        return markdownFiles;
    } catch (error) {
        printColored(`❌ Failed to get staged files: ${error.message}`, Colors.RED);
        return [];
    }
}

/**
 * Main validation function
 * @param {Array} files - Array of file paths to validate (optional, defaults to staged files)
 * @returns {boolean} True if all validations pass
 */
function validateMarkdownToC(files = null) {
    const filesToCheck = files || getStagedMarkdownFiles();
    
    if (filesToCheck.length === 0) {
        printColored('✅ No markdown files staged for commit', Colors.GREEN);
        return true;
    }
    
    printColored(`🦊 Found ${filesToCheck.length} markdown file(s) to validate:`, Colors.PURPLE);
    for (const file of filesToCheck) {
        printColored(`  - ${file}`, Colors.CYAN);
    }
    printColored('', Colors.NC);
    
    let allValid = true;
    const results = [];
    
    for (const file of filesToCheck) {
        const result = validateMarkdownFile(file);
        results.push(result);
        
        if (!result.valid) {
            allValid = false;
            printColored(`❌ ${file}: ${result.error}`, Colors.RED);
            
            if (result.line > 0) {
                printColored(`   Line ${result.line}`, Colors.YELLOW);
            }
            
            if (result.suggestion) {
                printColored(`   💡 ${result.suggestion}`, Colors.YELLOW);
            }
            
            if (result.expectedToC) {
                printColored('   Expected ToC:', Colors.BLUE);
                const tocLines = result.expectedToC.split('\n');
                for (const line of tocLines) {
                    printColored(`     ${line}`, Colors.CYAN);
                }
            }
            
            printColored('', Colors.NC);
        } else {
            printColored(`✅ ${file}: ToC is valid (${result.tocLineCount} lines)`, Colors.GREEN);
        }
    }
    
    if (!allValid) {
        printColored('\n💡 Tips:', Colors.YELLOW);
        printColored('   - Add "## Table of Contents" after your first H2 heading', Colors.YELLOW);
        printColored('   - Update ToC when adding/removing/renaming headings', Colors.YELLOW);
        printColored('   - Use consistent heading hierarchy (H2, H3, etc.)', Colors.YELLOW);
        printColored('   - Run "node .husky/validate-markdown-toc.js --fix" to auto-fix some issues', Colors.YELLOW);
        printColored('   - Use "git commit --no-verify" to skip this check (not recommended)', Colors.YELLOW);
    }
    
    return allValid;
}

/**
 * Auto-fix ToC issues where possible
 * @param {Array} files - Array of file paths to fix (optional, defaults to staged files)
 */
function autoFixToC(files = null) {
    const filesToCheck = files || getStagedMarkdownFiles();
    
    if (filesToCheck.length === 0) {
        printColored('✅ No markdown files to fix', Colors.GREEN);
        return true;
    }
    
    printColored(`🦊 Auto-fixing ToC in ${filesToCheck.length} markdown file(s):`, Colors.PURPLE);
    
    let allFixed = true;
    
    for (const file of filesToCheck) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const headings = extractHeadings(content);
            const firstH2 = headings.find(h => h.level === 2);
            
            if (!firstH2) {
                printColored(`⚠️  ${file}: No H2 heading found, skipping`, Colors.YELLOW);
                continue;
            }
            
            const existingToC = extractExistingToC(content);
            const expectedToC = generateToC(headings, 2);
            
            if (!existingToC.found) {
                // Insert ToC after first H2
                const lines = content.split('\n');
                const insertIndex = firstH2.lineNumber; // 0-based
                
                lines.splice(insertIndex, 0, '', expectedToC);
                
                fs.writeFileSync(file, lines.join('\n'), 'utf8');
                printColored(`✅ ${file}: Added ToC after first H2`, Colors.GREEN);
            } else if (!isToCUpToDate(existingToC.content, expectedToC)) {
                // Replace existing ToC
                const lines = content.split('\n');
                const startIndex = existingToC.startLine - 1; // Convert to 0-based
                const endIndex = existingToC.endLine - 1; // Convert to 0-based
                
                lines.splice(startIndex, endIndex - startIndex + 1, expectedToC);
                
                fs.writeFileSync(file, lines.join('\n'), 'utf8');
                printColored(`✅ ${file}: Updated ToC`, Colors.GREEN);
            } else {
                printColored(`✅ ${file}: ToC is already up-to-date`, Colors.GREEN);
            }
            
        } catch (error) {
            printColored(`❌ ${file}: Failed to fix - ${error.message}`, Colors.RED);
            allFixed = false;
        }
    }
    
    return allFixed;
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        printColored('🦊 Reynard Markdown ToC Validator', Colors.WHITE);
        printColored('=' * 50, Colors.CYAN);
        printColored('Usage:', Colors.BLUE);
        printColored('  node validate-markdown-toc.js [options]', Colors.CYAN);
        printColored('', Colors.NC);
        printColored('Options:', Colors.BLUE);
        printColored('  --fix        Auto-fix ToC issues where possible', Colors.CYAN);
        printColored('  --help, -h   Show this help message', Colors.CYAN);
        printColored('  <files>      Validate specific files instead of staged files', Colors.CYAN);
        printColored('', Colors.NC);
        printColored('Examples:', Colors.BLUE);
        printColored('  node validate-markdown-toc.js', Colors.CYAN);
        printColored('  node validate-markdown-toc.js --fix', Colors.CYAN);
        printColored('  node validate-markdown-toc.js docs/README.md', Colors.CYAN);
        return 0;
    }
    
    if (args.includes('--fix')) {
        const files = args.filter(arg => !arg.startsWith('--'));
        return autoFixToC(files.length > 0 ? files : null) ? 0 : 1;
    } else {
        const files = args.filter(arg => !arg.startsWith('--'));
        return validateMarkdownToC(files.length > 0 ? files : null) ? 0 : 1;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    process.exit(main());
}

export {
    validateMarkdownToC,
    autoFixToC,
    validateMarkdownFile,
    generateToC,
    extractHeadings
};
