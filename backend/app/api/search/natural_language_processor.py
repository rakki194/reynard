"""
Natural Language Query Processor
===============================

Advanced natural language processing for semantic code search queries.
Converts natural language questions into structured search operations
with intelligent query expansion and context understanding.
"""

import logging
import re
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class NaturalLanguageProcessor:
    """Processes natural language queries for semantic code search."""

    def __init__(self) -> None:
        """Initialize the natural language processor."""
        # Code-specific intent patterns
        self.intent_patterns = {
            "function_search": [
                r"find.*function.*that",
                r"where.*function.*defined",
                r"show.*function.*for",
                r"function.*that.*does",
                r"method.*that.*handles",
                r"def.*function",
            ],
            "class_search": [
                r"find.*class.*that",
                r"where.*class.*defined",
                r"show.*class.*for",
                r"class.*that.*implements",
                r"class.*that.*extends",
            ],
            "error_handling": [
                r"error.*handling",
                r"exception.*handling",
                r"try.*catch",
                r"error.*management",
                r"how.*handle.*error",
            ],
            "authentication": [
                r"authentication",
                r"login.*flow",
                r"user.*auth",
                r"token.*validation",
                r"password.*check",
                r"session.*management",
            ],
            "database_operations": [
                r"database.*query",
                r"sql.*operation",
                r"data.*retrieval",
                r"database.*connection",
                r"crud.*operation",
            ],
            "api_endpoints": [
                r"api.*endpoint",
                r"rest.*api",
                r"http.*handler",
                r"route.*handler",
                r"endpoint.*for",
            ],
            "configuration": [
                r"configuration",
                r"settings",
                r"config.*file",
                r"environment.*variable",
                r"setup.*config",
            ],
            "testing": [
                r"test.*function",
                r"unit.*test",
                r"integration.*test",
                r"test.*case",
                r"mock.*test",
            ],
        }

        # Code concept synonyms
        self.concept_synonyms = {
            "function": ["method", "procedure", "routine", "def", "fn"],
            "class": ["type", "object", "struct", "interface"],
            "variable": ["var", "let", "const", "field", "property"],
            "import": ["require", "include", "use", "from"],
            "export": ["module.exports", "return", "public"],
            "async": ["await", "promise", "callback", "then"],
            "error": ["exception", "bug", "issue", "problem", "fail"],
            "test": ["spec", "unit", "integration", "e2e", "mock"],
            "config": ["settings", "options", "preferences", "setup"],
            "api": ["endpoint", "route", "service", "handler"],
            "database": ["db", "sql", "query", "table", "model"],
            "auth": ["authentication", "login", "security", "token"],
            "ui": ["interface", "user", "frontend", "component"],
            "backend": ["server", "api", "service", "controller"],
            "frontend": ["client", "ui", "browser", "view"],
        }

        # Programming language patterns
        self.language_patterns = {
            "python": ["def ", "import ", "class ", "async def", "from "],
            "typescript": ["function ", "interface ", "class ", "import ", "export "],
            "javascript": ["function ", "const ", "let ", "var ", "import "],
            "java": ["public ", "private ", "class ", "interface ", "import "],
            "go": ["func ", "package ", "import ", "type ", "struct "],
            "rust": ["fn ", "struct ", "impl ", "use ", "mod "],
        }

    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a natural language query into structured search parameters.
        
        Args:
            query: Natural language search query
            
        Returns:
            Structured search parameters with intent, expanded terms, and filters
        """
        try:
            # Clean and normalize the query
            normalized_query = self._normalize_query(query)
            
            # Detect search intent
            intent = self._detect_intent(normalized_query)
            
            # Extract entities and concepts
            entities = self._extract_entities(normalized_query)
            
            # Expand query with synonyms and related terms
            expanded_terms = self._expand_query(normalized_query)
            
            # Determine search strategy
            search_strategy = self._determine_search_strategy(intent, entities)
            
            # Generate code patterns if applicable
            code_patterns = self._generate_code_patterns(intent, entities)
            
            # Determine file types and directories
            file_filters = self._determine_file_filters(intent, entities)
            
            return {
                "original_query": query,
                "normalized_query": normalized_query,
                "intent": intent,
                "entities": entities,
                "expanded_terms": expanded_terms,
                "search_strategy": search_strategy,
                "code_patterns": code_patterns,
                "file_filters": file_filters,
                "confidence": self._calculate_confidence(intent, entities),
            }
            
        except Exception as e:
            logger.exception(f"Error processing natural language query: {e}")
            return {
                "original_query": query,
                "normalized_query": query,
                "intent": "general_search",
                "entities": [],
                "expanded_terms": [query],
                "search_strategy": "hybrid",
                "code_patterns": [],
                "file_filters": {"file_types": None, "directories": None},
                "confidence": 0.5,
                "error": str(e),
            }

    def _normalize_query(self, query: str) -> str:
        """Normalize the query for processing."""
        # Convert to lowercase
        normalized = query.lower().strip()
        
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # Remove common stop words but keep code-relevant ones
        stop_words = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "up", "about", "into", "through", "during"
        }
        
        words = normalized.split()
        filtered_words = [word for word in words if word not in stop_words]
        
        return " ".join(filtered_words)

    def _detect_intent(self, query: str) -> str:
        """Detect the search intent from the query."""
        query_lower = query.lower()
        
        # Check against intent patterns
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    return intent
        
        # Default to general search
        return "general_search"

    def _extract_entities(self, query: str) -> List[Dict[str, Any]]:
        """Extract entities and concepts from the query."""
        entities = []
        query_lower = query.lower()
        
        # Extract programming language indicators
        for lang, patterns in self.language_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                entities.append({
                    "type": "programming_language",
                    "value": lang,
                    "confidence": 0.8,
                })
        
        # Extract code concepts
        for concept, synonyms in self.concept_synonyms.items():
            if concept in query_lower or any(syn in query_lower for syn in synonyms):
                entities.append({
                    "type": "code_concept",
                    "value": concept,
                    "confidence": 0.7,
                })
        
        # Extract potential function/class names (capitalized words)
        potential_names = re.findall(r'\b[A-Z][a-zA-Z0-9_]*\b', query)
        for name in potential_names:
            entities.append({
                "type": "potential_identifier",
                "value": name,
                "confidence": 0.6,
            })
        
        return entities

    def _expand_query(self, query: str) -> List[str]:
        """Expand query with synonyms and related terms."""
        expanded = [query]
        query_lower = query.lower()
        
        # Add synonyms for detected concepts
        for concept, synonyms in self.concept_synonyms.items():
            if concept in query_lower:
                for synonym in synonyms:
                    expanded_query = query_lower.replace(concept, synonym)
                    if expanded_query not in expanded:
                        expanded.append(expanded_query)
        
        # Add related terms based on intent
        if "function" in query_lower:
            expanded.extend([
                query_lower + " def",
                query_lower + " method",
                "def " + query_lower,
            ])
        
        if "class" in query_lower:
            expanded.extend([
                query_lower + " class",
                "class " + query_lower,
            ])
        
        return expanded[:5]  # Limit to top 5 expansions

    def _determine_search_strategy(self, intent: str, entities: List[Dict[str, Any]]) -> str:
        """Determine the best search strategy based on intent and entities."""
        # If we have specific code patterns, use hybrid search
        if intent in ["function_search", "class_search"]:
            return "hybrid"
        
        # If we have programming language entities, use syntax search
        if any(entity["type"] == "programming_language" for entity in entities):
            return "syntax"
        
        # Default to semantic search for natural language queries
        return "semantic"

    def _generate_code_patterns(self, intent: str, entities: List[Dict[str, Any]]) -> List[str]:
        """Generate code patterns based on intent and entities."""
        patterns = []
        
        if intent == "function_search":
            patterns.extend([
                r"def\s+\w+",
                r"function\s+\w+",
                r"const\s+\w+\s*=",
                r"public\s+\w+\s+\w+\(",
            ])
        
        elif intent == "class_search":
            patterns.extend([
                r"class\s+\w+",
                r"interface\s+\w+",
                r"struct\s+\w+",
            ])
        
        elif intent == "error_handling":
            patterns.extend([
                r"try\s*\{",
                r"catch\s*\(",
                r"except\s+",
                r"throw\s+",
                r"raise\s+",
            ])
        
        # Add patterns based on entities
        for entity in entities:
            if entity["type"] == "potential_identifier":
                patterns.append(rf"\b{re.escape(entity['value'])}\b")
        
        return patterns

    def _determine_file_filters(self, intent: str, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Determine file type and directory filters."""
        file_types = self._get_file_types_from_entities(entities)
        directories = self._get_directories_from_intent(intent, entities)
        
        return {
            "file_types": file_types,
            "directories": directories,
        }

    def _get_file_types_from_entities(self, entities: List[Dict[str, Any]]) -> List[str] | None:
        """Get file types based on programming language entities."""
        for entity in entities:
            if entity["type"] == "programming_language":
                lang = entity["value"]
                if lang == "python":
                    return ["py"]
                elif lang in ["typescript", "javascript"]:
                    return ["ts", "tsx", "js", "jsx"]
                elif lang == "java":
                    return ["java"]
                elif lang == "go":
                    return ["go"]
                elif lang == "rust":
                    return ["rs"]
        return None

    def _get_directories_from_intent(self, intent: str, entities: List[Dict[str, Any]]) -> List[str] | None:
        """Get directories based on intent and entities."""
        # Determine directories based on intent
        if intent == "api_endpoints":
            return ["backend/app/api"]
        elif intent == "testing":
            return ["tests", "**/__tests__"]
        elif intent == "configuration":
            return None  # Will be determined by file types
        
        # Determine directories based on programming language entities
        for entity in entities:
            if entity["type"] == "programming_language":
                lang = entity["value"]
                if lang == "python":
                    return ["backend", "scripts"]
                elif lang in ["typescript", "javascript"]:
                    return ["packages", "examples", "templates"]
        
        return None

    def _calculate_confidence(self, intent: str, entities: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for the processed query."""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on intent specificity
        if intent != "general_search":
            confidence += 0.2
        
        # Increase confidence based on number of entities
        confidence += min(len(entities) * 0.1, 0.3)
        
        # Increase confidence for programming language detection
        if any(entity["type"] == "programming_language" for entity in entities):
            confidence += 0.2
        
        return min(confidence, 1.0)

    def generate_search_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """Generate intelligent search suggestions based on the query."""
        suggestions = []
        processed = self.process_query(query)
        
        # Suggest more specific queries based on intent
        if processed["intent"] == "general_search":
            suggestions.extend([
                {
                    "suggestion": f"function that {query}",
                    "type": "intent_refinement",
                    "confidence": 0.8,
                },
                {
                    "suggestion": f"class that {query}",
                    "type": "intent_refinement", 
                    "confidence": 0.8,
                },
            ])
        
        # Suggest related concepts
        for entity in processed["entities"]:
            if entity["type"] == "code_concept":
                concept = entity["value"]
                if concept in self.concept_synonyms:
                    for synonym in self.concept_synonyms[concept][:2]:
                        suggestions.append({
                            "suggestion": query.replace(concept, synonym),
                            "type": "synonym",
                            "confidence": 0.6,
                        })
        
        return suggestions[:5]  # Limit to top 5 suggestions

    def generate_advanced_query_expansions(self, query: str) -> List[str]:
        """Generate advanced query expansions using multiple techniques."""
        expansions = []
        
        # 1. Synonym-based expansion
        expansions.extend(self._synonym_expansion(query))
        
        # 2. Contextual expansion
        expansions.extend(self._contextual_expansion(query))
        
        # 3. Semantic similarity expansion
        expansions.extend(self._semantic_similarity_expansion(query))
        
        # 4. Code pattern expansion
        expansions.extend(self._code_pattern_expansion(query))
        
        # 5. Intent-based expansion
        expansions.extend(self._intent_based_expansion(query))
        
        # Remove duplicates and return
        return list(set(expansions))

    def _synonym_expansion(self, query: str) -> List[str]:
        """Expand query using synonym dictionaries."""
        expansions = []
        query_lower = query.lower()
        
        # Programming language synonyms
        language_synonyms = {
            "python": ["py", "python3", "python2"],
            "javascript": ["js", "node", "nodejs"],
            "typescript": ["ts", "tsx"],
            "java": ["java8", "java11", "java17"],
            "c++": ["cpp", "cplusplus"],
            "c#": ["csharp", "dotnet"],
        }
        
        for lang, synonyms in language_synonyms.items():
            if lang in query_lower:
                for synonym in synonyms:
                    expansions.append(query_lower.replace(lang, synonym))
        
        # Code concept synonyms
        for concept, synonyms in self.concept_synonyms.items():
            if concept in query_lower:
                for synonym in synonyms[:2]:  # Limit to top 2 synonyms
                    expansions.append(query_lower.replace(concept, synonym))
        
        return expansions

    def _contextual_expansion(self, query: str) -> List[str]:
        """Expand query using contextual information."""
        expansions = []
        query_lower = query.lower()
        
        # Add context-specific terms
        if "function" in query_lower:
            expansions.append(query_lower.replace("function", "method"))
            expansions.append(query_lower.replace("function", "procedure"))
            expansions.append(query_lower.replace("function", "routine"))
        
        if "class" in query_lower:
            expansions.append(query_lower.replace("class", "interface"))
            expansions.append(query_lower.replace("class", "struct"))
            expansions.append(query_lower.replace("class", "type"))
        
        if "error" in query_lower:
            expansions.append(query_lower.replace("error", "exception"))
            expansions.append(query_lower.replace("error", "failure"))
            expansions.append(query_lower.replace("error", "bug"))
        
        if "authentication" in query_lower:
            expansions.append(query_lower.replace("authentication", "auth"))
            expansions.append(query_lower.replace("authentication", "login"))
            expansions.append(query_lower.replace("authentication", "security"))
        
        return expansions

    def _semantic_similarity_expansion(self, query: str) -> List[str]:
        """Expand query using semantic similarity concepts."""
        expansions = []
        query_lower = query.lower()
        
        # Semantic clusters for common programming concepts
        semantic_clusters = {
            "data": ["information", "content", "payload", "message"],
            "user": ["person", "client", "customer", "end-user"],
            "system": ["application", "service", "platform", "framework"],
            "database": ["db", "storage", "repository", "persistence"],
            "api": ["endpoint", "service", "interface", "gateway"],
            "config": ["configuration", "settings", "options", "parameters"],
            "test": ["testing", "spec", "specification", "validation"],
            "build": ["compile", "construct", "generate", "create"],
            "deploy": ["release", "publish", "launch", "rollout"],
        }
        
        for concept, similar_terms in semantic_clusters.items():
            if concept in query_lower:
                for term in similar_terms[:2]:  # Limit to top 2 similar terms
                    expansions.append(query_lower.replace(concept, term))
        
        return expansions

    def _code_pattern_expansion(self, query: str) -> List[str]:
        """Expand query using code pattern recognition."""
        expansions = []
        query_lower = query.lower()
        
        # Pattern-based expansions
        if "find" in query_lower:
            expansions.append(query_lower.replace("find", "locate"))
            expansions.append(query_lower.replace("find", "search"))
            expansions.append(query_lower.replace("find", "discover"))
        
        if "implement" in query_lower:
            expansions.append(query_lower.replace("implement", "create"))
            expansions.append(query_lower.replace("implement", "build"))
            expansions.append(query_lower.replace("implement", "develop"))
        
        if "handle" in query_lower:
            expansions.append(query_lower.replace("handle", "process"))
            expansions.append(query_lower.replace("handle", "manage"))
            expansions.append(query_lower.replace("handle", "deal with"))
        
        # Add pattern variations
        if "that" in query_lower:
            expansions.append(query_lower.replace("that", "which"))
            expansions.append(query_lower.replace("that", "for"))
        
        return expansions

    def _intent_based_expansion(self, query: str) -> List[str]:
        """Expand query based on detected intent."""
        expansions = []
        processed = self.process_query(query)
        intent = processed["intent"]
        
        if intent == "function_search":
            expansions.extend([
                f"def {query}",
                f"function {query}",
                f"method {query}",
                f"procedure {query}",
            ])
        elif intent == "class_search":
            expansions.extend([
                f"class {query}",
                f"interface {query}",
                f"struct {query}",
                f"type {query}",
            ])
        elif intent == "error_handling":
            expansions.extend([
                f"try catch {query}",
                f"exception {query}",
                f"error handling {query}",
                f"validation {query}",
            ])
        elif intent == "authentication":
            expansions.extend([
                f"login {query}",
                f"auth {query}",
                f"security {query}",
                f"authorization {query}",
            ])
        
        return expansions

    def generate_hybrid_expansions(self, query: str) -> Dict[str, List[str]]:
        """Generate hybrid query expansions combining multiple techniques."""
        return {
            "synonym_expansions": self._synonym_expansion(query),
            "contextual_expansions": self._contextual_expansion(query),
            "semantic_expansions": self._semantic_similarity_expansion(query),
            "pattern_expansions": self._code_pattern_expansion(query),
            "intent_expansions": self._intent_based_expansion(query),
            "all_expansions": self.generate_advanced_query_expansions(query),
        }
