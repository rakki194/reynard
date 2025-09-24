"""Text processing utilities for the Enhanced Humility Detector.
"""

import re
import string
from typing import Any

from core.config import HumilityConfig


class TextProcessor:
    """Advanced text processing for humility analysis."""

    def __init__(self, config: HumilityConfig):
        self.config = config
        self.stop_words = self._load_stop_words()
        self.contractions = self._load_contractions()

    def _load_stop_words(self) -> set:
        """Load common stop words for text processing."""
        return {
            "a",
            "an",
            "and",
            "are",
            "as",
            "at",
            "be",
            "by",
            "for",
            "from",
            "has",
            "he",
            "in",
            "is",
            "it",
            "its",
            "of",
            "on",
            "that",
            "the",
            "to",
            "was",
            "will",
            "with",
            "would",
            "you",
            "your",
            "we",
            "our",
            "this",
            "these",
            "they",
            "them",
            "their",
            "there",
            "here",
            "where",
            "when",
            "what",
            "who",
            "why",
            "how",
            "can",
            "could",
            "should",
            "may",
            "might",
            "must",
            "shall",
            "do",
            "does",
            "did",
            "have",
            "had",
            "been",
            "being",
            "am",
            "were",
        }

    def _load_contractions(self) -> dict[str, str]:
        """Load common contractions for text normalization."""
        return {
            "don't": "do not",
            "doesn't": "does not",
            "didn't": "did not",
            "won't": "will not",
            "wouldn't": "would not",
            "shouldn't": "should not",
            "couldn't": "could not",
            "can't": "cannot",
            "isn't": "is not",
            "aren't": "are not",
            "wasn't": "was not",
            "weren't": "were not",
            "haven't": "have not",
            "hasn't": "has not",
            "hadn't": "had not",
            "i'm": "i am",
            "you're": "you are",
            "he's": "he is",
            "she's": "she is",
            "it's": "it is",
            "we're": "we are",
            "they're": "they are",
            "i've": "i have",
            "you've": "you have",
            "we've": "we have",
            "they've": "they have",
            "i'll": "i will",
            "you'll": "you will",
            "he'll": "he will",
            "she'll": "she will",
            "we'll": "we will",
            "they'll": "they will",
            "i'd": "i would",
            "you'd": "you would",
            "he'd": "he would",
            "she'd": "she would",
            "we'd": "we would",
            "they'd": "they would",
        }

    def preprocess(self, text: str) -> str:
        """Preprocess text for analysis."""
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text)

        # Expand contractions
        text = self._expand_contractions(text)

        # Remove excessive punctuation
        text = self._normalize_punctuation(text)

        # Normalize case (preserve sentence structure)
        text = self._normalize_case(text)

        return text.strip()

    def _expand_contractions(self, text: str) -> str:
        """Expand contractions in text."""
        for contraction, expansion in self.contractions.items():
            text = re.sub(
                r"\b" + re.escape(contraction) + r"\b",
                expansion,
                text,
                flags=re.IGNORECASE,
            )
        return text

    def _normalize_punctuation(self, text: str) -> str:
        """Normalize punctuation marks."""
        # Replace multiple punctuation with single
        text = re.sub(r"[!]{2,}", "!", text)
        text = re.sub(r"[?]{2,}", "?", text)
        text = re.sub(r"[.]{2,}", ".", text)

        # Normalize quotes
        text = re.sub(r'["""]', '"', text)
        text = text.replace(""", "'").replace(""", "'")

        return text

    def _normalize_case(self, text: str) -> str:
        """Normalize case while preserving sentence structure."""
        # Split into sentences
        sentences = re.split(r"[.!?]+", text)
        normalized_sentences = []

        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                # Capitalize first letter
                sentence = sentence[0].upper() + sentence[1:].lower()
                normalized_sentences.append(sentence)

        return ". ".join(normalized_sentences) + "."

    def extract_sentences(self, text: str) -> list[str]:
        """Extract sentences from text."""
        # Simple sentence splitting (can be enhanced with NLP libraries)
        sentences = re.split(r"[.!?]+", text)
        return [s.strip() for s in sentences if s.strip()]

    def extract_words(self, text: str) -> list[str]:
        """Extract words from text."""
        # Remove punctuation and split
        words = re.findall(r"\b[a-zA-Z]+\b", text.lower())
        return [word for word in words if word not in self.stop_words]

    def extract_phrases(
        self, text: str, min_length: int = 2, max_length: int = 5,
    ) -> list[str]:
        """Extract n-grams from text."""
        words = self.extract_words(text)
        phrases = []

        for n in range(min_length, max_length + 1):
            for i in range(len(words) - n + 1):
                phrase = " ".join(words[i : i + n])
                phrases.append(phrase)

        return phrases

    def calculate_readability_metrics(self, text: str) -> dict[str, float]:
        """Calculate basic readability metrics."""
        sentences = self.extract_sentences(text)
        words = self.extract_words(text)

        if not sentences or not words:
            return {
                "avg_sentence_length": 0.0,
                "avg_word_length": 0.0,
                "sentence_count": 0,
                "word_count": 0,
                "flesch_reading_ease": 0.0,
            }

        # Average sentence length
        avg_sentence_length = len(words) / len(sentences)

        # Average word length
        total_chars = sum(len(word) for word in words)
        avg_word_length = total_chars / len(words)

        # Simple Flesch Reading Ease approximation
        syllables = sum(self._count_syllables(word) for word in words)
        flesch_score = (
            206.835 - (1.015 * avg_sentence_length) - (84.6 * (syllables / len(words)))
        )

        return {
            "avg_sentence_length": avg_sentence_length,
            "avg_word_length": avg_word_length,
            "sentence_count": len(sentences),
            "word_count": len(words),
            "flesch_reading_ease": max(0, min(100, flesch_score)),
        }

    def _count_syllables(self, word: str) -> int:
        """Count syllables in a word (approximation)."""
        word = word.lower()
        vowels = "aeiouy"
        syllable_count = 0
        prev_was_vowel = False

        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel

        # Handle silent 'e'
        if word.endswith("e") and syllable_count > 1:
            syllable_count -= 1

        return max(1, syllable_count)

    def extract_linguistic_features(self, text: str) -> dict[str, Any]:
        """Extract comprehensive linguistic features."""
        words = self.extract_words(text)
        sentences = self.extract_sentences(text)

        # Word frequency analysis
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Most common words
        most_common = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]

        # Vocabulary richness (unique words / total words)
        vocabulary_richness = len(set(words)) / len(words) if words else 0

        # Readability metrics
        readability = self.calculate_readability_metrics(text)

        # Punctuation analysis
        punctuation_count = sum(1 for char in text if char in string.punctuation)
        punctuation_ratio = punctuation_count / len(text) if text else 0

        # Capitalization analysis
        capital_letters = sum(1 for char in text if char.isupper())
        capitalization_ratio = capital_letters / len(text) if text else 0

        return {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "vocabulary_richness": vocabulary_richness,
            "most_common_words": most_common,
            "readability_metrics": readability,
            "punctuation_ratio": punctuation_ratio,
            "capitalization_ratio": capitalization_ratio,
            "avg_word_length": readability["avg_word_length"],
            "avg_sentence_length": readability["avg_sentence_length"],
        }

    def detect_language_patterns(self, text: str) -> dict[str, Any]:
        """Detect various language patterns that might indicate boastful language."""
        patterns = {
            "exclamation_marks": len(re.findall(r"!", text)),
            "question_marks": len(re.findall(r"\?", text)),
            "capital_words": len(re.findall(r"\b[A-Z]{2,}\b", text)),
            "repeated_letters": len(re.findall(r"(.)\1{2,}", text)),
            "quoted_text": len(re.findall(r'"[^"]*"', text)),
            "parenthetical_text": len(re.findall(r"\([^)]*\)", text)),
            "dash_usage": len(re.findall(r"--", text)),
            "ellipsis_usage": len(re.findall(r"\.{3,}", text)),
        }

        # Calculate ratios
        text_length = len(text)
        if text_length > 0:
            # Create a copy to avoid modifying during iteration
            ratio_patterns = {}
            for pattern, count in patterns.items():
                ratio_patterns[f"{pattern}_ratio"] = count / text_length
            patterns.update(ratio_patterns)

        return patterns
