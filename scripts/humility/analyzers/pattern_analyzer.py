"""
Pattern-based analyzer for boastful language detection.
Enhanced version of the original pattern matching approach.
"""

import re
from typing import List, Dict, Any
from core.models import HumilityFinding, SeverityLevel, ConfidenceLevel, DetectionCategory
from core.config import HumilityConfig


class PatternAnalyzer:
    """Enhanced pattern-based analyzer with comprehensive boastful language patterns."""
    
    def __init__(self, config: HumilityConfig):
        self.config = config
        self.patterns = self._load_enhanced_patterns()
        self.replacements = self._load_enhanced_replacements()
        self.severity_weights = self._load_severity_weights()
    
    def _load_enhanced_patterns(self) -> Dict[str, List[Dict]]:
        """Load comprehensive boastful language patterns."""
        return {
            'superlatives': [
                {
                    'pattern': r'\b(best|most|greatest|unprecedented|exceptional|outstanding|remarkable|stunning|breathtaking|magnificent|incredible|amazing|fantastic|wonderful|marvelous)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.9
                },
                {
                    'pattern': r'\b(perfect|flawless|ideal|optimal|supreme|ultimate|paramount|preeminent|peerless|matchless)\b',
                    'severity': SeverityLevel.CRITICAL,
                    'confidence': 0.95
                }
            ],
            'exaggeration': [
                {
                    'pattern': r'\b(revolutionary|groundbreaking|game-changing|breakthrough|phenomenal|spectacular|mind-blowing|jaw-dropping|earth-shattering|world-changing)\b',
                    'severity': SeverityLevel.CRITICAL,
                    'confidence': 0.95
                },
                {
                    'pattern': r'\b(innovative|cutting-edge|state-of-the-art|next-generation|future-proof|bleeding-edge|avant-garde|pioneering)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                },
                {
                    'pattern': r'\b(transformative|disruptive|paradigm-shifting|industry-redefining|market-leading|trend-setting)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.85
                }
            ],
            'self_promotion': [
                {
                    'pattern': r'\b(award-winning|industry-leading|best-in-class|world-class|top-tier|premium|elite|superior|advanced|sophisticated)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.85
                },
                {
                    'pattern': r'\b(powerful|robust|scalable|enterprise-grade|production-ready|battle-tested|proven|reliable|trusted|established)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.6
                },
                {
                    'pattern': r'\b(professional|expert|master|guru|specialist|authority|leader|champion|winner|successful)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.7
                }
            ],
            'dismissiveness': [
                {
                    'pattern': r'\b(unlike others|superior to|outperforms|beats|dominates|surpasses|exceeds|trounces|overwhelms|eclipses)\b',
                    'severity': SeverityLevel.CRITICAL,
                    'confidence': 0.9
                },
                {
                    'pattern': r'\b(only solution|exclusive|unique|one-of-a-kind|unparalleled|incomparable|unmatched|unrivaled)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                },
                {
                    'pattern': r'\b(inferior|outdated|obsolete|archaic|primitive|basic|simple|limited|restricted|constrained)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                }
            ],
            'absolute_claims': [
                {
                    'pattern': r'\b(always|never|all|every|none|only|exclusively|completely|totally|absolutely|entirely|wholly)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.7
                },
                {
                    'pattern': r'\b(guaranteed|certain|definite|sure|inevitable|unavoidable|unstoppable|irresistible)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                }
            ],
            'hype_language': [
                {
                    'pattern': r'\b(legendary|epic|awesome|incredible|mind-blowing|jaw-dropping|stunning|breathtaking|spectacular)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                },
                {
                    'pattern': r'\b(amazing|fantastic|wonderful|marvelous|brilliant|genius|masterpiece|work of art)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.6
                }
            ],
            'competitive_language': [
                {
                    'pattern': r'\b(beats|defeats|conquers|overcomes|triumphs|wins|succeeds|prevails|dominates|controls)\b',
                    'severity': SeverityLevel.HIGH,
                    'confidence': 0.8
                },
                {
                    'pattern': r'\b(competitor|rival|opponent|enemy|adversary|challenger|contender|competition)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.6
                }
            ],
            'exclusivity_claims': [
                {
                    'pattern': r'\b(exclusive|limited|rare|scarce|precious|valuable|priceless|irreplaceable|irreversible)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.7
                },
                {
                    'pattern': r'\b(secret|hidden|confidential|proprietary|patented|trademarked|copyrighted|protected)\b',
                    'severity': SeverityLevel.LOW,
                    'confidence': 0.5
                }
            ],
            'emotional_manipulation': [
                {
                    'pattern': r'\b(urgent|critical|emergency|crisis|disaster|catastrophe|tragedy|devastating|shocking)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.7
                },
                {
                    'pattern': r'\b(limited time|act now|don\'t miss|once in a lifetime|never again|last chance)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.8
                }
            ],
            'authority_claims': [
                {
                    'pattern': r'\b(expert|authority|specialist|professional|master|guru|leader|pioneer|innovator)\b',
                    'severity': SeverityLevel.MEDIUM,
                    'confidence': 0.6
                },
                {
                    'pattern': r'\b(proven|tested|validated|certified|approved|endorsed|recommended|trusted)\b',
                    'severity': SeverityLevel.LOW,
                    'confidence': 0.5
                }
            ]
        }
    
    def _load_enhanced_replacements(self) -> Dict[str, str]:
        """Load comprehensive replacement suggestions."""
        return {
            # Superlatives
            'best': 'good', 'most': 'many', 'greatest': 'significant',
            'unprecedented': 'new', 'exceptional': 'notable',
            'outstanding': 'good', 'remarkable': 'notable',
            'stunning': 'impressive', 'breathtaking': 'impressive',
            'magnificent': 'well-designed', 'incredible': 'impressive',
            'amazing': 'useful', 'fantastic': 'good',
            'wonderful': 'helpful', 'marvelous': 'well-designed',
            'perfect': 'well-designed', 'flawless': 'reliable',
            'ideal': 'suitable', 'optimal': 'efficient',
            'supreme': 'high-quality', 'ultimate': 'comprehensive',
            'paramount': 'important', 'preeminent': 'leading',
            'peerless': 'distinctive', 'matchless': 'unique',
            
            # Exaggeration
            'revolutionary': 'innovative', 'groundbreaking': 'new',
            'game-changing': 'significant', 'breakthrough': 'advancement',
            'phenomenal': 'impressive', 'spectacular': 'impressive',
            'mind-blowing': 'impressive', 'jaw-dropping': 'notable',
            'earth-shattering': 'significant', 'world-changing': 'important',
            'innovative': 'useful', 'cutting-edge': 'modern',
            'state-of-the-art': 'current', 'next-generation': 'new',
            'future-proof': 'adaptable', 'bleeding-edge': 'experimental',
            'avant-garde': 'experimental', 'pioneering': 'new',
            'transformative': 'beneficial', 'disruptive': 'different',
            'paradigm-shifting': 'significant', 'industry-redefining': 'important',
            'market-leading': 'competitive', 'trend-setting': 'influential',
            
            # Self-promotion
            'award-winning': 'recognized', 'industry-leading': 'competitive',
            'best-in-class': 'high-quality', 'world-class': 'professional',
            'top-tier': 'high-quality', 'premium': 'enhanced',
            'elite': 'specialized', 'superior': 'effective',
            'advanced': 'useful', 'sophisticated': 'well-designed',
            'powerful': 'capable', 'robust': 'reliable',
            'scalable': 'adaptable', 'enterprise-grade': 'professional',
            'production-ready': 'ready', 'battle-tested': 'tested',
            'proven': 'tested', 'reliable': 'dependable',
            'trusted': 'established', 'established': 'mature',
            'professional': 'competent', 'expert': 'knowledgeable',
            'master': 'skilled', 'guru': 'experienced',
            'specialist': 'focused', 'authority': 'knowledgeable',
            'leader': 'influential', 'champion': 'supporter',
            'winner': 'successful', 'successful': 'effective',
            
            # Dismissiveness
            'unlike others': 'differently from some approaches',
            'superior to': 'effective for', 'outperforms': 'performs well',
            'beats': 'compares favorably to', 'dominates': 'performs well in',
            'surpasses': 'meets or exceeds', 'exceeds': 'meets',
            'trounces': 'performs better than', 'overwhelms': 'handles well',
            'eclipses': 'outshines', 'only solution': 'one approach',
            'exclusive': 'specialized', 'unique': 'distinctive',
            'one-of-a-kind': 'distinctive', 'unparalleled': 'distinctive',
            'incomparable': 'distinctive', 'unmatched': 'distinctive',
            'unrivaled': 'distinctive', 'inferior': 'different',
            'outdated': 'older', 'obsolete': 'replaced',
            'archaic': 'older', 'primitive': 'basic',
            'basic': 'simple', 'simple': 'straightforward',
            'limited': 'focused', 'restricted': 'specific',
            'constrained': 'focused',
            
            # Absolute claims
            'always': 'often', 'never': 'rarely', 'all': 'many',
            'every': 'most', 'none': 'few', 'only': 'primarily',
            'exclusively': 'primarily', 'completely': 'largely',
            'totally': 'significantly', 'absolutely': 'generally',
            'entirely': 'largely', 'wholly': 'largely',
            'guaranteed': 'likely', 'certain': 'probable',
            'definite': 'probable', 'sure': 'confident',
            'inevitable': 'likely', 'unavoidable': 'difficult to avoid',
            'unstoppable': 'persistent', 'irresistible': 'compelling',
            
            # Hype language
            'legendary': 'well-known', 'epic': 'significant',
            'awesome': 'useful', 'incredible': 'impressive',
            'mind-blowing': 'impressive', 'jaw-dropping': 'notable',
            'stunning': 'impressive', 'breathtaking': 'impressive',
            'spectacular': 'impressive', 'amazing': 'useful',
            'fantastic': 'good', 'wonderful': 'helpful',
            'marvelous': 'well-designed', 'brilliant': 'intelligent',
            'genius': 'clever', 'masterpiece': 'excellent work',
            'work of art': 'well-crafted',
            
            # Competitive language
            'beats': 'performs better than', 'defeats': 'overcomes',
            'conquers': 'succeeds with', 'overcomes': 'handles',
            'triumphs': 'succeeds', 'wins': 'achieves',
            'succeeds': 'achieves', 'prevails': 'succeeds',
            'dominates': 'leads in', 'controls': 'manages',
            'competitor': 'alternative', 'rival': 'alternative',
            'opponent': 'alternative', 'enemy': 'alternative',
            'adversary': 'alternative', 'challenger': 'alternative',
            'contender': 'alternative', 'competition': 'alternatives',
            
            # Exclusivity claims
            'exclusive': 'specialized', 'limited': 'focused',
            'rare': 'uncommon', 'scarce': 'limited',
            'precious': 'valuable', 'valuable': 'useful',
            'priceless': 'invaluable', 'irreplaceable': 'unique',
            'irreversible': 'permanent', 'secret': 'proprietary',
            'hidden': 'internal', 'confidential': 'proprietary',
            'proprietary': 'custom', 'patented': 'protected',
            'trademarked': 'branded', 'copyrighted': 'protected',
            'protected': 'secure',
            
            # Emotional manipulation
            'urgent': 'important', 'critical': 'important',
            'emergency': 'urgent', 'crisis': 'challenge',
            'disaster': 'problem', 'catastrophe': 'major issue',
            'tragedy': 'serious issue', 'devastating': 'significant',
            'shocking': 'surprising', 'limited time': 'time-sensitive',
            'act now': 'consider acting', 'don\'t miss': 'consider',
            'once in a lifetime': 'rare opportunity',
            'never again': 'limited opportunity', 'last chance': 'final opportunity',
            
            # Authority claims
            'expert': 'knowledgeable', 'authority': 'knowledgeable',
            'specialist': 'focused', 'professional': 'competent',
            'master': 'skilled', 'guru': 'experienced',
            'leader': 'influential', 'pioneer': 'early adopter',
            'innovator': 'creative', 'proven': 'tested',
            'tested': 'validated', 'validated': 'confirmed',
            'certified': 'verified', 'approved': 'accepted',
            'endorsed': 'recommended', 'recommended': 'suggested',
            'trusted': 'reliable'
        }
    
    def _load_severity_weights(self) -> Dict[SeverityLevel, int]:
        """Load severity weights for scoring."""
        return {
            SeverityLevel.LOW: 1,
            SeverityLevel.MEDIUM: 2,
            SeverityLevel.HIGH: 3,
            SeverityLevel.CRITICAL: 4
        }
    
    def analyze(self, text: str, file_path: str = "") -> List[HumilityFinding]:
        """Analyze text for boastful language patterns."""
        findings = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for category_name, pattern_list in self.patterns.items():
                category = DetectionCategory(category_name)
                
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
                        start = max(0, match.start() - 30)
                        end = min(len(line), match.end() + 30)
                        context = line[start:end].strip()
                        
                        # Determine confidence level
                        confidence_level = self._get_confidence_level(confidence)
                        
                        finding = HumilityFinding(
                            file_path=file_path,
                            line_number=line_num,
                            category=category,
                            severity=severity,
                            confidence=confidence_level,
                            original_text=original_text,
                            suggested_replacement=replacement,
                            context=context,
                            confidence_score=confidence,
                            linguistic_features={
                                'pattern_matched': pattern,
                                'word_position': match.start(),
                                'line_length': len(line),
                                'surrounding_words': self._extract_surrounding_words(line, match)
                            }
                        )
                        findings.append(finding)
        
        return findings
    
    def _get_confidence_level(self, confidence_score: float) -> ConfidenceLevel:
        """Convert confidence score to confidence level."""
        if confidence_score >= 0.9:
            return ConfidenceLevel.VERY_HIGH
        elif confidence_score >= 0.7:
            return ConfidenceLevel.HIGH
        elif confidence_score >= 0.5:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW
    
    def _extract_surrounding_words(self, line: str, match) -> List[str]:
        """Extract words surrounding the match for context."""
        start = max(0, match.start() - 50)
        end = min(len(line), match.end() + 50)
        context_text = line[start:end]
        words = re.findall(r'\b\w+\b', context_text.lower())
        return words[:10]  # Return first 10 words for context
