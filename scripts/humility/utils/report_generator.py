"""
Report generation utilities for humility detection.
"""

import json
from typing import Dict, Any, List
from core.models import HumilityProfile
from core.config import HumilityConfig


class ReportGenerator:
    """Generates various report formats for humility analysis."""
    
    def __init__(self, config: HumilityConfig):
        self.config = config
    
    def generate_report(self, profiles: Dict[str, HumilityProfile]) -> str:
        """Generate report in the configured format."""
        if self.config.output_format == 'json':
            return self._generate_json_report(profiles)
        elif self.config.output_format == 'html':
            return self._generate_html_report(profiles)
        elif self.config.output_format == 'csv':
            return self._generate_csv_report(profiles)
        else:
            return self._generate_text_report(profiles)
    
    def _generate_text_report(self, profiles: Dict[str, HumilityProfile]) -> str:
        """Generate human-readable text report."""
        report = []
        report.append("🦊 Enhanced Humility Detector Report")
        report.append("=" * 60)
        report.append("")
        
        # Summary statistics
        total_files = len(profiles)
        total_findings = sum(len(profile.findings) for profile in profiles.values())
        avg_score = sum(profile.overall_score for profile in profiles.values()) / total_files if total_files > 0 else 0
        
        report.append(f"Summary:")
        report.append(f"  Files analyzed: {total_files}")
        report.append(f"  Total findings: {total_findings}")
        report.append(f"  Average humility score: {avg_score:.1f}/100")
        report.append("")
        
        # Individual file reports
        for file_path, profile in profiles.items():
            if profile.findings or self.config.include_metrics:
                report.append(f"📁 {file_path}")
                report.append("-" * 40)
                report.append(f"  Overall score: {profile.overall_score:.1f}/100")
                report.append(f"  Findings: {len(profile.findings)}")
                
                if self.config.include_metrics:
                    report.append(f"  HEXACO Honesty-Humility: {profile.hexaco_honesty_humility:.1f}")
                    report.append(f"  Epistemic Humility: {profile.epistemic_humility:.1f}")
                    report.append(f"  Linguistic Humility: {profile.linguistic_humility:.1f}")
                
                if profile.findings:
                    report.append("  Findings:")
                    for finding in profile.findings[:10]:  # Limit to first 10
                        report.append(f"    Line {finding.line_number}: {finding.original_text} → {finding.suggested_replacement}")
                        if self.config.include_context:
                            report.append(f"      Context: ...{finding.context}...")
                
                if self.config.include_recommendations and profile.recommendations:
                    report.append("  Recommendations:")
                    for rec in profile.recommendations[:5]:  # Limit to first 5
                        report.append(f"    • {rec}")
                
                report.append("")
        
        return "\n".join(report)
    
    def _generate_json_report(self, profiles: Dict[str, HumilityProfile]) -> str:
        """Generate JSON report."""
        report_data = {
            'summary': {
                'total_files': len(profiles),
                'total_findings': sum(len(profile.findings) for profile in profiles.values()),
                'average_score': sum(profile.overall_score for profile in profiles.values()) / len(profiles) if profiles else 0
            },
            'profiles': {}
        }
        
        for file_path, profile in profiles.items():
            report_data['profiles'][file_path] = profile.to_dict()
        
        return json.dumps(report_data, indent=2, ensure_ascii=False)
    
    def _generate_html_report(self, profiles: Dict[str, HumilityProfile]) -> str:
        """Generate HTML report."""
        html = []
        html.append("<!DOCTYPE html>")
        html.append("<html><head><title>Humility Detector Report</title></head><body>")
        html.append("<h1>🦊 Enhanced Humility Detector Report</h1>")
        
        # Summary
        total_files = len(profiles)
        total_findings = sum(len(profile.findings) for profile in profiles.values())
        avg_score = sum(profile.overall_score for profile in profiles.values()) / total_files if total_files > 0 else 0
        
        html.append(f"<h2>Summary</h2>")
        html.append(f"<p>Files analyzed: {total_files}</p>")
        html.append(f"<p>Total findings: {total_findings}</p>")
        html.append(f"<p>Average humility score: {avg_score:.1f}/100</p>")
        
        # File details
        for file_path, profile in profiles.items():
            html.append(f"<h3>📁 {file_path}</h3>")
            html.append(f"<p>Overall score: {profile.overall_score:.1f}/100</p>")
            html.append(f"<p>Findings: {len(profile.findings)}</p>")
            
            if profile.findings:
                html.append("<ul>")
                for finding in profile.findings:
                    html.append(f"<li>Line {finding.line_number}: {finding.original_text} → {finding.suggested_replacement}</li>")
                html.append("</ul>")
        
        html.append("</body></html>")
        return "\n".join(html)
    
    def _generate_csv_report(self, profiles: Dict[str, HumilityProfile]) -> str:
        """Generate CSV report."""
        csv = []
        csv.append("file_path,line_number,category,severity,original_text,suggested_replacement,overall_score")
        
        for file_path, profile in profiles.items():
            for finding in profile.findings:
                csv.append(f'"{file_path}",{finding.line_number},{finding.category.value},{finding.severity.value},"{finding.original_text}","{finding.suggested_replacement}",{profile.overall_score}')
        
        return "\n".join(csv)
