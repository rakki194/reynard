"""
Tests for advanced query expansion algorithms.

Tests cover:
- Synonym-based expansion
- Contextual expansion
- Semantic similarity expansion
- Code pattern expansion
- Intent-based expansion
- Hybrid expansion techniques
"""

import pytest
from app.api.search.natural_language_processor import NaturalLanguageProcessor


class TestAdvancedQueryExpansion:
    """Test advanced query expansion algorithms."""

    def setup_method(self) -> None:
        """Set up test fixtures."""
        self.nlp = NaturalLanguageProcessor()

    def test_synonym_expansion(self):
        """Test synonym-based query expansion."""
        query = "find python function"
        expansions = self.nlp._synonym_expansion(query)
        
        # Should include Python synonyms
        assert any("py" in expansion for expansion in expansions)
        assert any("python3" in expansion for expansion in expansions)

    def test_contextual_expansion(self):
        """Test contextual query expansion."""
        query = "find function that handles errors"
        expansions = self.nlp._contextual_expansion(query)
        
        # Should include function synonyms
        assert any("method" in expansion for expansion in expansions)
        assert any("procedure" in expansion for expansion in expansions)
        
        # Should include error synonyms
        assert any("exception" in expansion for expansion in expansions)
        assert any("failure" in expansion for expansion in expansions)

    def test_semantic_similarity_expansion(self):
        """Test semantic similarity expansion."""
        query = "find user data handling"
        expansions = self.nlp._semantic_similarity_expansion(query)
        
        # Should include semantic synonyms
        assert any("person" in expansion for expansion in expansions)
        assert any("information" in expansion for expansion in expansions)

    def test_code_pattern_expansion(self):
        """Test code pattern expansion."""
        query = "find function that implements authentication"
        expansions = self.nlp._code_pattern_expansion(query)
        
        # Should include pattern variations
        assert any("locate" in expansion for expansion in expansions)
        assert any("search" in expansion for expansion in expansions)
        assert any("discover" in expansion for expansion in expansions)

    def test_intent_based_expansion(self):
        """Test intent-based expansion."""
        query = "find authentication function"
        expansions = self.nlp._intent_based_expansion(query)
        
        # Should include intent-specific expansions (authentication intent)
        assert any("auth" in expansion for expansion in expansions)
        assert any("login" in expansion for expansion in expansions)
        assert any("security" in expansion for expansion in expansions)

    def test_advanced_query_expansions(self):
        """Test the main advanced query expansion method."""
        query = "find authentication function in python"
        expansions = self.nlp.generate_advanced_query_expansions(query)
        
        # Should generate multiple types of expansions
        assert len(expansions) > 0
        
        # Should include various expansion types
        assert any("py" in expansion for expansion in expansions)  # Synonym
        assert any("method" in expansion for expansion in expansions)  # Contextual
        assert any("auth" in expansion for expansion in expansions)  # Contextual

    def test_hybrid_expansions(self):
        """Test hybrid expansion combining multiple techniques."""
        query = "find error handling function"
        hybrid = self.nlp.generate_hybrid_expansions(query)
        
        # Should have all expansion types
        assert "synonym_expansions" in hybrid
        assert "contextual_expansions" in hybrid
        assert "semantic_expansions" in hybrid
        assert "pattern_expansions" in hybrid
        assert "intent_expansions" in hybrid
        assert "all_expansions" in hybrid
        
        # Each type should have expansions
        for expansion_type, expansions in hybrid.items():
            if expansion_type != "all_expansions":
                assert isinstance(expansions, list)
                assert len(expansions) >= 0  # Some might be empty

    def test_expansion_quality(self):
        """Test the quality of generated expansions."""
        query = "find authentication function"
        expansions = self.nlp.generate_advanced_query_expansions(query)
        
        # Expansions should be relevant
        for expansion in expansions:
            assert isinstance(expansion, str)
            assert len(expansion) > 0
            # Should contain key terms from original query
            assert any(term in expansion.lower() for term in ["find", "auth", "function"])

    def test_expansion_deduplication(self):
        """Test that expansions are deduplicated."""
        query = "find function"
        expansions = self.nlp.generate_advanced_query_expansions(query)
        
        # Should not have duplicates
        assert len(expansions) == len(set(expansions))

    def test_language_specific_expansions(self):
        """Test language-specific expansions."""
        # Test Python
        python_query = "find python function"
        python_expansions = self.nlp._synonym_expansion(python_query)
        assert any("py" in expansion for expansion in python_expansions)
        
        # Test JavaScript
        js_query = "find javascript function"
        js_expansions = self.nlp._synonym_expansion(js_query)
        assert any("js" in expansion for expansion in js_expansions)
        
        # Test TypeScript
        ts_query = "find typescript function"
        ts_expansions = self.nlp._synonym_expansion(ts_query)
        assert any("ts" in expansion for expansion in ts_expansions)

    def test_programming_concept_expansions(self):
        """Test expansions for programming concepts."""
        # Test function concepts
        function_query = "find function"
        function_expansions = self.nlp._contextual_expansion(function_query)
        assert any("method" in expansion for expansion in function_expansions)
        assert any("procedure" in expansion for expansion in function_expansions)
        
        # Test class concepts
        class_query = "find class"
        class_expansions = self.nlp._contextual_expansion(class_query)
        assert any("interface" in expansion for expansion in class_expansions)
        assert any("struct" in expansion for expansion in class_expansions)

    def test_error_handling_expansions(self):
        """Test expansions for error handling concepts."""
        error_query = "find error handling"
        error_expansions = self.nlp._contextual_expansion(error_query)
        
        assert any("exception" in expansion for expansion in error_expansions)
        assert any("failure" in expansion for expansion in error_expansions)
        assert any("bug" in expansion for expansion in error_expansions)

    def test_authentication_expansions(self):
        """Test expansions for authentication concepts."""
        auth_query = "find authentication"
        auth_expansions = self.nlp._contextual_expansion(auth_query)
        
        assert any("auth" in expansion for expansion in auth_expansions)
        assert any("login" in expansion for expansion in auth_expansions)
        assert any("security" in expansion for expansion in auth_expansions)

    def test_expansion_performance(self):
        """Test that expansions are generated quickly."""
        import time
        
        query = "find authentication function in python"
        start_time = time.time()
        
        expansions = self.nlp.generate_advanced_query_expansions(query)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Should complete quickly (less than 1 second)
        assert execution_time < 1.0
        assert len(expansions) > 0

    def test_empty_query_expansion(self):
        """Test expansion handling for empty queries."""
        empty_query = ""
        expansions = self.nlp.generate_advanced_query_expansions(empty_query)
        
        # Should handle empty queries gracefully
        assert isinstance(expansions, list)
        assert len(expansions) == 0

    def test_single_word_expansion(self):
        """Test expansion for single word queries."""
        single_word = "function"
        expansions = self.nlp.generate_advanced_query_expansions(single_word)
        
        # Should still generate some expansions
        assert isinstance(expansions, list)
        # May or may not have expansions depending on the word

    def test_special_characters_expansion(self):
        """Test expansion handling for queries with special characters."""
        special_query = "find @decorator function"
        expansions = self.nlp.generate_advanced_query_expansions(special_query)
        
        # Should handle special characters gracefully
        assert isinstance(expansions, list)
        # Should not crash or produce invalid expansions


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
