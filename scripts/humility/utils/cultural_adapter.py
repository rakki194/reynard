"""
Cultural adaptation module for humility detection.
"""

from typing import List, Dict, Any
from core.models import HumilityFinding, CulturalContext
from core.config import HumilityConfig


class CulturalAdapter:
    """Adapts humility detection based on cultural context."""
    
    def __init__(self, config: HumilityConfig):
        self.config = config
        self.cultural_contexts = self._load_cultural_contexts()
    
    def _load_cultural_contexts(self) -> Dict[str, CulturalContext]:
        """Load cultural context definitions."""
        return {
            'western': CulturalContext(
                region='Western',
                language='English',
                cultural_norms={
                    'directness_preference': 0.8,
                    'modesty_emphasis': 0.6,
                    'achievement_focus': 0.7
                },
                humility_indicators=['modest', 'humble', 'collaborative', 'team-oriented'],
                boastful_indicators=['arrogant', 'boastful', 'self-promoting', 'competitive'],
                adaptation_factors={
                    'directness_tolerance': 0.8,
                    'modesty_requirement': 0.6,
                    'achievement_emphasis': 0.7
                }
            ),
            'eastern': CulturalContext(
                region='Eastern',
                language='English',
                cultural_norms={
                    'directness_preference': 0.4,
                    'modesty_emphasis': 0.9,
                    'achievement_focus': 0.5
                },
                humility_indicators=['humble', 'modest', 'respectful', 'harmonious'],
                boastful_indicators=['arrogant', 'boastful', 'individualistic', 'confrontational'],
                adaptation_factors={
                    'directness_tolerance': 0.4,
                    'modesty_requirement': 0.9,
                    'achievement_emphasis': 0.5
                }
            ),
            'nordic': CulturalContext(
                region='Nordic',
                language='English',
                cultural_norms={
                    'directness_preference': 0.6,
                    'modesty_emphasis': 0.8,
                    'achievement_focus': 0.4
                },
                humility_indicators=['modest', 'humble', 'egalitarian', 'collaborative'],
                boastful_indicators=['arrogant', 'boastful', 'hierarchical', 'competitive'],
                adaptation_factors={
                    'directness_tolerance': 0.6,
                    'modesty_requirement': 0.8,
                    'achievement_emphasis': 0.4
                }
            )
        }
    
    def adapt_findings(self, findings: List[HumilityFinding], 
                      cultural_context: str) -> List[HumilityFinding]:
        """Adapt findings based on cultural context."""
        if cultural_context not in self.cultural_contexts:
            return findings
        
        context = self.cultural_contexts[cultural_context]
        adapted_findings = []
        
        for finding in findings:
            # Adjust severity based on cultural norms
            adapted_finding = self._adapt_finding_severity(finding, context)
            
            # Adjust confidence based on cultural context
            adapted_finding = self._adapt_finding_confidence(adapted_finding, context)
            
            # Add cultural context information
            adapted_finding.cultural_context = cultural_context
            
            adapted_findings.append(adapted_finding)
        
        return adapted_findings
    
    def _adapt_finding_severity(self, finding: HumilityFinding, 
                               context: CulturalContext) -> HumilityFinding:
        """Adapt finding severity based on cultural context."""
        # In cultures with higher modesty requirements, increase severity
        modesty_factor = context.adaptation_factors['modesty_requirement']
        
        if modesty_factor > 0.8:  # High modesty requirement
            # Increase severity for boastful language
            if finding.severity.value == 'low':
                finding.severity = finding.severity.__class__('medium')
            elif finding.severity.value == 'medium':
                finding.severity = finding.severity.__class__('high')
        
        return finding
    
    def _adapt_finding_confidence(self, finding: HumilityFinding, 
                                 context: CulturalContext) -> HumilityFinding:
        """Adapt finding confidence based on cultural context."""
        # Adjust confidence based on cultural norms
        directness_tolerance = context.adaptation_factors['directness_tolerance']
        
        if directness_tolerance < 0.5:  # Low directness tolerance
            # Increase confidence for direct language
            finding.confidence_score = min(1.0, finding.confidence_score * 1.2)
        
        return finding

