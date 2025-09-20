"""
Sentiment analysis module for humility detection.
"""

import asyncio
from typing import List, Dict, Any, Optional
from core.models import HumilityFinding, SeverityLevel, ConfidenceLevel, DetectionCategory
from core.config import HumilityConfig


class SentimentAnalyzer:
    """Sentiment-based analyzer for detecting boastful language through emotional analysis."""
    
    def __init__(self, config: HumilityConfig):
        self.config = config
        self.positive_sentiment_words = self._load_positive_sentiment_words()
        self.negative_sentiment_words = self._load_negative_sentiment_words()
        self.boastful_sentiment_patterns = self._load_boastful_sentiment_patterns()
    
    def _load_positive_sentiment_words(self) -> set:
        """Load positive sentiment words that might indicate boastful language."""
        return {
            'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great',
            'incredible', 'magnificent', 'marvelous', 'outstanding', 'perfect',
            'phenomenal', 'remarkable', 'spectacular', 'stunning', 'superb',
            'terrific', 'tremendous', 'wonderful', 'extraordinary', 'exceptional',
            'incredible', 'mind-blowing', 'jaw-dropping', 'breathtaking'
        }
    
    def _load_negative_sentiment_words(self) -> set:
        """Load negative sentiment words that might indicate dismissive language."""
        return {
            'awful', 'terrible', 'horrible', 'disgusting', 'pathetic', 'useless',
            'worthless', 'inferior', 'substandard', 'mediocre', 'poor', 'bad',
            'disappointing', 'frustrating', 'annoying', 'irritating', 'hateful'
        }
    
    def _load_boastful_sentiment_patterns(self) -> List[Dict]:
        """Load patterns that indicate boastful sentiment."""
        return [
            {
                'pattern': r'\b(I|we|our|us)\s+(am|are|is)\s+(amazing|awesome|brilliant|excellent|fantastic|great|incredible|magnificent|marvelous|outstanding|perfect|phenomenal|remarkable|spectacular|stunning|superb|terrific|tremendous|wonderful)\b',
                'severity': SeverityLevel.HIGH,
                'confidence': 0.8
            },
            {
                'pattern': r'\b(our|my|the)\s+(amazing|awesome|brilliant|excellent|fantastic|great|incredible|magnificent|marvelous|outstanding|perfect|phenomenal|remarkable|spectacular|stunning|superb|terrific|tremendous|wonderful)\s+(product|solution|system|technology|approach|method|tool|platform|service)\b',
                'severity': SeverityLevel.HIGH,
                'confidence': 0.85
            },
            {
                'pattern': r'\b(you|users|customers|clients)\s+(will|can|are able to)\s+(enjoy|experience|benefit from|take advantage of)\s+(our|my|the)\s+(amazing|awesome|brilliant|excellent|fantastic|great|incredible|magnificent|marvelous|outstanding|perfect|phenomenal|remarkable|spectacular|stunning|superb|terrific|tremendous|wonderful)\b',
                'severity': SeverityLevel.MEDIUM,
                'confidence': 0.7
            }
        ]
    
    async def analyze(self, text: str, file_path: str = "") -> List[HumilityFinding]:
        """Analyze text for boastful sentiment patterns."""
        findings = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            # Check for boastful sentiment patterns
            for pattern_info in self.boastful_sentiment_patterns:
                import re
                matches = re.finditer(pattern_info['pattern'], line, re.IGNORECASE)
                
                for match in matches:
                    original_text = match.group()
                    severity = pattern_info['severity']
                    confidence_score = pattern_info['confidence']
                    
                    # Calculate sentiment score for context
                    sentiment_score = self._calculate_sentiment_score(line)
                    
                    # Determine confidence level
                    confidence_level = self._get_confidence_level(confidence_score)
                    
                    # Generate replacement suggestion
                    replacement = self._generate_replacement(original_text)
                    
                    # Calculate context
                    start = max(0, match.start() - 30)
                    end = min(len(line), match.end() + 30)
                    context = line[start:end].strip()
                    
                    finding = HumilityFinding(
                        file_path=file_path,
                        line_number=line_num,
                        category=DetectionCategory.SELF_PROMOTION,
                        severity=severity,
                        confidence=confidence_level,
                        original_text=original_text,
                        suggested_replacement=replacement,
                        context=context,
                        confidence_score=confidence_score,
                        sentiment_score=sentiment_score,
                        linguistic_features={
                            'sentiment_analysis': True,
                            'positive_sentiment_words': self._extract_positive_words(line),
                            'negative_sentiment_words': self._extract_negative_words(line),
                            'sentiment_intensity': abs(sentiment_score)
                        }
                    )
                    findings.append(finding)
        
        return findings
    
    async def get_metrics(self, text: str) -> Dict[str, Any]:
        """Get sentiment analysis metrics for the text."""
        lines = text.split('\n')
        total_sentiment = 0
        line_count = 0
        positive_lines = 0
        negative_lines = 0
        neutral_lines = 0
        
        for line in lines:
            if line.strip():
                sentiment = self._calculate_sentiment_score(line)
                total_sentiment += sentiment
                line_count += 1
                
                if sentiment > 0.1:
                    positive_lines += 1
                elif sentiment < -0.1:
                    negative_lines += 1
                else:
                    neutral_lines += 1
        
        avg_sentiment = total_sentiment / line_count if line_count > 0 else 0
        
        return {
            'sentiment_analysis': {
                'average_sentiment': avg_sentiment,
                'positive_lines': positive_lines,
                'negative_lines': negative_lines,
                'neutral_lines': neutral_lines,
                'total_lines': line_count,
                'sentiment_distribution': {
                    'positive': positive_lines / line_count if line_count > 0 else 0,
                    'negative': negative_lines / line_count if line_count > 0 else 0,
                    'neutral': neutral_lines / line_count if line_count > 0 else 0
                }
            }
        }
    
    def _calculate_sentiment_score(self, text: str) -> float:
        """Calculate sentiment score for a text snippet."""
        words = text.lower().split()
        
        positive_count = sum(1 for word in words if word in self.positive_sentiment_words)
        negative_count = sum(1 for word in words if word in self.negative_sentiment_words)
        
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words == 0:
            return 0.0
        
        # Normalize to -1 to 1 range
        sentiment_score = (positive_count - negative_count) / total_sentiment_words
        return sentiment_score
    
    def _extract_positive_words(self, text: str) -> List[str]:
        """Extract positive sentiment words from text."""
        words = text.lower().split()
        return [word for word in words if word in self.positive_sentiment_words]
    
    def _extract_negative_words(self, text: str) -> List[str]:
        """Extract negative sentiment words from text."""
        words = text.lower().split()
        return [word for word in words if word in self.negative_sentiment_words]
    
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
    
    def _generate_replacement(self, original_text: str) -> str:
        """Generate a more humble replacement for boastful sentiment."""
        # Simple replacement mapping
        replacements = {
            'amazing': 'useful',
            'awesome': 'helpful',
            'brilliant': 'intelligent',
            'excellent': 'good',
            'fantastic': 'effective',
            'great': 'good',
            'incredible': 'impressive',
            'magnificent': 'well-designed',
            'marvelous': 'well-crafted',
            'outstanding': 'notable',
            'perfect': 'well-designed',
            'phenomenal': 'impressive',
            'remarkable': 'notable',
            'spectacular': 'impressive',
            'stunning': 'impressive',
            'superb': 'high-quality',
            'terrific': 'good',
            'tremendous': 'significant',
            'wonderful': 'helpful'
        }
        
        # Try to replace boastful words
        replacement_text = original_text.lower()
        for boastful, humble in replacements.items():
            replacement_text = replacement_text.replace(boastful, humble)
        
        return replacement_text
