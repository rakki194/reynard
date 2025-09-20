#!/usr/bin/env python3
"""
Humility Detector - Systematic Detection of Boastful Language
Part of the Reynard project's commitment to humble communication.

This tool scans text files for boastful language patterns and suggests
humble alternatives based on research in psychology and linguistics.
"""

import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class SeverityLevel(Enum):
    """Severity levels for detected boastful language."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class BoastfulFinding:
    """Represents a single instance of boastful language."""
    file_path: str
    line_number: int
    category: str
    severity: SeverityLevel
    original_text: str
    suggested_replacement: str
    context: str
    confidence: float

class HumilityDetector:
    """Main class for detecting boastful language patterns."""
    
    def __init__(self):
        """Initialize the detector with patterns and replacements."""
        self.patterns = self._load_patterns()
        self.replacements = self._load_replacements()
        self.severity_weights = self._load_severity_weights()
    
    def _load_patterns(self) -> Dict[str, List[Dict]]:
        """Load boastful language patterns with severity and confidence."""
        return {
            'superlatives': [
                {
                    'pattern': r'\b(best|most|greatest|unprecedented|exceptional|outstanding|remarkable|stunning|breathtaking)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.9
                },
                {
                    'pattern': r'\b(amazing|incredible|fantastic|wonderful|marvelous)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.7
                }
            ],
            'exaggeration': [
                {
                    'pattern': r'\b(revolutionary|groundbreaking|game-changing|breakthrough|phenomenal|spectacular|magnificent)\b',
                    'severity': SeverityLevel.CRITICAL,
                    'confidence': 0.95
                },
                {
                    'pattern': r'\b(innovative|cutting-edge|state-of-the-art|next-generation|future-proof)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                }
            ],
            'self_promotion': [
                {
                    'pattern': r'\b(award-winning|industry-leading|best-in-class|world-class|top-tier|premium|elite|superior)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.85
                },
                {
                    'pattern': r'\b(advanced|sophisticated|powerful|robust|scalable|enterprise-grade|production-ready|battle-tested)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.6
                }
            ],
            'dismissiveness': [
                {
                    'pattern': r'\b(unlike others|superior to|outperforms|beats|dominates|surpasses|exceeds)\b',
                    'severity': SeverityLevel.CRITICAL,
                    'confidence': 0.9
                },
                {
                    'pattern': r'\b(only solution|exclusive|unique|inferior|outdated|obsolete)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                }
            ],
            'absolute_claims': [
                {
                    'pattern': r'\b(always|never|all|every|none|only|exclusively|completely|totally|absolutely)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.7
                }
            ],
            'hype_language': [
                {
                    'pattern': r'\b(legendary|epic|awesome|incredible|mind-blowing|jaw-dropping)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                }
            ]
        }
    
    def _load_replacements(self) -> Dict[str, str]:
        """Load suggested replacements for boastful language."""
        return {
            # Superlatives
            'best': 'good', 'most': 'many', 'greatest': 'significant',
            'unprecedented': 'new', 'exceptional': 'notable',
            'outstanding': 'good', 'remarkable': 'notable',
            'stunning': 'impressive', 'breathtaking': 'impressive',
            'amazing': 'useful', 'incredible': 'impressive',
            'fantastic': 'good', 'wonderful': 'helpful',
            'marvelous': 'well-designed',
            
            # Exaggeration
            'revolutionary': 'innovative', 'groundbreaking': 'new',
            'game-changing': 'significant', 'breakthrough': 'advancement',
            'phenomenal': 'impressive', 'spectacular': 'impressive',
            'magnificent': 'well-designed', 'innovative': 'useful',
            'cutting-edge': 'modern', 'state-of-the-art': 'current',
            'next-generation': 'new', 'future-proof': 'adaptable',
            
            # Self-promotion
            'award-winning': 'recognized', 'industry-leading': 'competitive',
            'best-in-class': 'high-quality', 'world-class': 'professional',
            'top-tier': 'high-quality', 'premium': 'enhanced',
            'elite': 'specialized', 'superior': 'effective',
            'advanced': 'useful', 'sophisticated': 'well-designed',
            'powerful': 'capable', 'robust': 'reliable',
            'scalable': 'adaptable', 'enterprise-grade': 'professional',
            'production-ready': 'ready', 'battle-tested': 'tested',
            
            # Dismissiveness
            'unlike others': 'differently from some approaches',
            'superior to': 'effective for', 'outperforms': 'performs well',
            'beats': 'compares favorably to', 'dominates': 'performs well in',
            'surpasses': 'meets or exceeds', 'exceeds': 'meets',
            'only solution': 'one approach', 'exclusive': 'specialized',
            'unique': 'distinctive', 'inferior': 'different',
            'outdated': 'older', 'obsolete': 'replaced',
            
            # Absolute claims
            'always': 'often', 'never': 'rarely', 'all': 'many',
            'every': 'most', 'none': 'few', 'only': 'primarily',
            'exclusively': 'primarily', 'completely': 'largely',
            'totally': 'significantly', 'absolutely': 'generally',
            
            # Hype language
            'legendary': 'well-known', 'epic': 'significant',
            'awesome': 'useful', 'mind-blowing': 'impressive',
            'jaw-dropping': 'notable'
        }
    
    def _load_severity_weights(self) -> Dict[SeverityLevel, int]:
        """Load severity weights for scoring."""
        return {
            SeverityLevel.LOW: 1,
            SeverityLevel.MEDIUM: 2,
            SeverityLevel.HIGH: 3,
            SeverityLevel.CRITICAL: 4
        }
    
    def scan_text(self, text: str, file_path: str = "") -> List[BoastfulFinding]:
        """Scan text for boastful language patterns."""
        findings = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for category, pattern_list in self.patterns.items():
                for pattern_info in pattern_list:
                    pattern = pattern_info['pattern']
                    severity = pattern_info['severity']
                    confidence = pattern_info['confidence']
                    
                    matches = re.finditer(pattern, line, re.IGNORECASE)
                    for match in matches:
                        original_text = match.group()
                        word = original_text.lower()
                        replacement = self.replacements.get(word, 'consider alternative')
                        
                        # Calculate context (surrounding words)
                        start = max(0, match.start() - 20)
                        end = min(len(line), match.end() + 20)
                        context = line[start:end].strip()
                        
                        finding = BoastfulFinding(
                            file_path=file_path,
                            line_number=line_num,
                            category=category,
                            severity=severity,
                            original_text=original_text,
                            suggested_replacement=replacement,
                            context=context,
                            confidence=confidence
                        )
                        findings.append(finding)
        
        return findings
    
    def scan_file(self, file_path: Path) -> List[BoastfulFinding]:
        """Scan a file for boastful language patterns."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return []
        
        return self.scan_text(content, str(file_path))
    
    def scan_directory(self, directory: Path, extensions: List[str] = None) -> List[BoastfulFinding]:
        """Scan a directory for boastful language in specified file types."""
        if extensions is None:
            extensions = ['.md', '.txt', '.py', '.js', '.ts', '.tsx', '.jsx', '.json']
        
        all_findings = []
        
        for file_path in directory.rglob('*'):
            if file_path.is_file() and file_path.suffix in extensions:
                findings = self.scan_file(file_path)
                all_findings.extend(findings)
        
        return all_findings
    
    def generate_report(self, findings: List[BoastfulFinding], format: str = 'text') -> str:
        """Generate a report of findings in specified format."""
        if not findings:
            return "No boastful language patterns found. Great job maintaining humble communication!"
        
        if format == 'json':
            return self._generate_json_report(findings)
        else:
            return self._generate_text_report(findings)
    
    def _generate_text_report(self, findings: List[BoastfulFinding]) -> str:
        """Generate a human-readable text report."""
        report = []
        report.append("🦊 Humility Detector Report")
        report.append("=" * 50)
        report.append(f"Total findings: {len(findings)}")
        report.append("")
        
        # Calculate severity distribution
        severity_counts = {}
        for finding in findings:
            severity = finding.severity.value
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        report.append("Severity Distribution:")
        for severity in ['critical', 'high', 'medium', 'low']:
            count = severity_counts.get(severity, 0)
            if count > 0:
                report.append(f"  {severity.upper()}: {count}")
        report.append("")
        
        # Group by category
        by_category = {}
        for finding in findings:
            category = finding.category
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(finding)
        
        for category, category_findings in by_category.items():
            report.append(f"{category.replace('_', ' ').title()} ({len(category_findings)} findings):")
            report.append("-" * 40)
            
            for finding in category_findings:
                report.append(f"  📁 {finding.file_path}:{finding.line_number}")
                report.append(f"     Severity: {finding.severity.value.upper()}")
                report.append(f"     Original: '{finding.original_text}'")
                report.append(f"     Suggested: '{finding.suggested_replacement}'")
                report.append(f"     Context: ...{finding.context}...")
                report.append("")
        
        # Add recommendations
        report.append("Recommendations:")
        report.append("-" * 20)
        report.append("1. Replace boastful language with humble alternatives")
        report.append("2. Focus on user value rather than system capabilities")
        report.append("3. Acknowledge limitations and alternatives")
        report.append("4. Use collaborative rather than competitive language")
        report.append("5. Maintain confidence while being modest")
        
        return "\n".join(report)
    
    def _generate_json_report(self, findings: List[BoastfulFinding]) -> str:
        """Generate a JSON report for programmatic processing."""
        report_data = {
            'summary': {
                'total_findings': len(findings),
                'severity_distribution': {},
                'category_distribution': {}
            },
            'findings': []
        }
        
        # Calculate distributions
        for finding in findings:
            severity = finding.severity.value
            category = finding.category
            
            report_data['summary']['severity_distribution'][severity] = \
                report_data['summary']['severity_distribution'].get(severity, 0) + 1
            report_data['summary']['category_distribution'][category] = \
                report_data['summary']['category_distribution'].get(category, 0) + 1
        
        # Add findings
        for finding in findings:
            finding_data = {
                'file_path': finding.file_path,
                'line_number': finding.line_number,
                'category': finding.category,
                'severity': finding.severity.value,
                'original_text': finding.original_text,
                'suggested_replacement': finding.suggested_replacement,
                'context': finding.context,
                'confidence': finding.confidence
            }
            report_data['findings'].append(finding_data)
        
        return json.dumps(report_data, indent=2)
    
    def calculate_humility_score(self, findings: List[BoastfulFinding]) -> float:
        """Calculate a humility score based on findings (0-100, higher is better)."""
        if not findings:
            return 100.0
        
        total_weight = 0
        for finding in findings:
            weight = self.severity_weights[finding.severity]
            total_weight += weight * finding.confidence
        
        # Normalize to 0-100 scale (assuming max possible weight)
        max_possible_weight = len(findings) * 4 * 1.0  # max severity * max confidence
        if max_possible_weight == 0:
            return 100.0
        
        score = max(0, 100 - (total_weight / max_possible_weight * 100))
        return round(score, 1)

def main():
    """Main entry point for the humility detector."""
    parser = argparse.ArgumentParser(
        description='Detect boastful language in text files and suggest humble alternatives',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 humility-detector.py README.md
  python3 humility-detector.py docs/ --extensions .md .txt
  python3 humility-detector.py . --output report.json --format json
  python3 humility-detector.py . --min-severity high
        """
    )
    
    parser.add_argument('path', help='File or directory path to scan')
    parser.add_argument('--output', '-o', help='Output file for report')
    parser.add_argument('--format', '-f', choices=['text', 'json'], default='text',
                       help='Output format (default: text)')
    parser.add_argument('--extensions', '-e', nargs='+', 
                       default=['.md', '.txt', '.py', '.js', '.ts', '.tsx', '.jsx', '.json'],
                       help='File extensions to scan')
    parser.add_argument('--min-severity', '-s', 
                       choices=['low', 'medium', 'high', 'critical'],
                       help='Minimum severity level to report')
    parser.add_argument('--score', action='store_true',
                       help='Calculate and display humility score')
    
    args = parser.parse_args()
    
    detector = HumilityDetector()
    path = Path(args.path)
    
    # Scan files
    if path.is_file():
        findings = detector.scan_file(path)
    else:
        findings = detector.scan_directory(path, args.extensions)
    
    # Filter by minimum severity
    if args.min_severity:
        min_severity = SeverityLevel(args.min_severity)
        severity_order = [SeverityLevel.LOW, SeverityLevel.MEDIUM, 
                         SeverityLevel.HIGH, SeverityLevel.CRITICAL]
        min_index = severity_order.index(min_severity)
        findings = [f for f in findings if severity_order.index(f.severity) >= min_index]
    
    # Generate report
    report = detector.generate_report(findings, args.format)
    
    # Add humility score if requested
    if args.score:
        score = detector.calculate_humility_score(findings)
        if args.format == 'text':
            report += f"\n\nHumility Score: {score}/100"
        else:
            report_data = json.loads(report)
            report_data['humility_score'] = score
            report = json.dumps(report_data, indent=2)
    
    # Output report
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Report written to {args.output}")
    else:
        print(report)
    
    # Exit with appropriate code
    if findings:
        exit(1)  # Found boastful language
    else:
        exit(0)  # No issues found

if __name__ == '__main__':
    main()
