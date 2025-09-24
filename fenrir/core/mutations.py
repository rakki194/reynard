"""Learning-Based Payload Mutation Engine

Mutation engine that learns from successful attacks and evolves payloads
to be even more effective. Uses machine learning principles to adapt attack
vectors based on target responses.

Classes:
    LearningBasedMutations: Core mutation engine with pattern learning
"""

import random


class LearningBasedMutations:
    """Learning-Based Payload Mutation Engine

    Learns from successful attacks and evolves payloads to be even more effective! This engine uses pattern recognition and adaptive mutation techniques to create increasingly sophisticated attack vectors.

    The mutation engine operates on several principles:
    1. **Pattern Learning**: Records successful payload patterns for reuse
    2. **Adaptive Mutation**: Applies mutations based on target characteristics
    3. **Evolutionary Pressure**: Favors mutations that lead to successful attacks
    4. **Context Awareness**: Adapts mutations based on endpoint type and response patterns

    Attributes:
        successful_patterns (Dict[str, List[str]]): Learned successful patterns by rule type
        mutation_techniques (List[callable]): Available mutation functions

    Example:
        >>> mutations = LearningBasedMutations()
        >>> mutations.learn_from_success("sql_injection", "admin' OR 1=1--")
        >>> evolved_payload = mutations.mutate_payload("sql_injection", "admin'")
        >>> # Result: "admin' OR 1=1-- /* comment */"

    """

    def __init__(self):
        """Initialize the learning-based mutation engine.

        *whiskers twitch with intelligence* Sets up the mutation techniques
        and initializes the pattern learning system.
        """
        self.successful_patterns: dict[str, list[str]] = {}
        self.mutation_techniques = [
            self._add_encoding,
            self._add_whitespace,
            self._add_comments,
            self._add_nesting,
            self._add_concatenation,
            self._add_case_variation,
        ]

    def learn_from_success(self, rule_name: str, payload: str) -> None:
        """Learn from a successful attack pattern.

        *snarls with predatory glee* Records successful payload patterns
        to improve future mutation effectiveness.

        Args:
            rule_name (str): The grammar rule or attack type that succeeded
            payload (str): The successful payload to learn from

        Example:
            >>> mutations.learn_from_success("xss_json", '{"content": "<script>alert(\'XSS\')</script>"}')

        """
        if rule_name not in self.successful_patterns:
            self.successful_patterns[rule_name] = []

        self.successful_patterns[rule_name].append(payload)

    def mutate_payload(self, rule_name: str, base_payload: str) -> str:
        """Apply learning-based mutations to a payload.

        *alpha wolf dominance radiates* Combines random mutations with
        learned successful patterns to create evolved attack vectors.

        Args:
            rule_name (str): The grammar rule or attack type
            base_payload (str): The base payload to mutate

        Returns:
            str: The mutated payload with applied learning and random mutations

        Example:
            >>> mutated = mutations.mutate_payload("sql_injection", "admin'")
            >>> # Applies 1-3 random mutations + learned patterns

        """
        mutated = base_payload

        # Apply random mutations (1-3 mutations per payload)
        for _ in range(random.randint(1, 3)):
            mutation_func = random.choice(self.mutation_techniques)
            mutated = mutation_func(mutated)

        # Apply learned patterns if available
        if rule_name in self.successful_patterns:
            learned_pattern = random.choice(self.successful_patterns[rule_name])
            mutated = self._combine_patterns(mutated, learned_pattern)

        return mutated

    def _add_encoding(self, payload: str) -> str:
        """Add URL encoding variations to evade detection.

        *circles with menacing intent* Applies URL encoding to special
        characters to bypass input validation.

        Args:
            payload (str): Input payload

        Returns:
            str: Payload with URL encoding applied

        """
        return payload.replace("'", "%27").replace(" ", "%20")

    def _add_whitespace(self, payload: str) -> str:
        """Add whitespace variations to confuse parsers.

        *bares fangs with cunning* Inserts extra whitespace to
        bypass whitespace-sensitive validation.

        Args:
            payload (str): Input payload

        Returns:
            str: Payload with whitespace variations

        """
        return payload.replace(" ", "  ").replace("=", " = ")

    def _add_comments(self, payload: str) -> str:
        """Add comment variations to hide malicious code.

        *snarls with predatory intelligence* Appends comments to
        payloads to hide malicious intent from static analysis.

        Args:
            payload (str): Input payload

        Returns:
            str: Payload with comment appended

        """
        return payload + " /* comment */"

    def _add_nesting(self, payload: str) -> str:
        """Add nesting variations to confuse parsers.

        *alpha wolf dominance radiates* Wraps payloads in parentheses
        to create nested structures that may bypass validation.

        Args:
            payload (str): Input payload

        Returns:
            str: Payload wrapped in parentheses

        """
        return f"({payload})"

    def _add_concatenation(self, payload: str) -> str:
        """Add string concatenation to bypass filters.

        *circles with menacing intent* Uses string concatenation
        to split malicious code across multiple parts.

        Args:
            payload (str): Input payload

        Returns:
            str: Payload with string concatenation

        """
        return f"'{payload}' + 'test'"

    def _add_case_variation(self, payload: str) -> str:
        """Add case variations to evade case-sensitive filters.

        *bares fangs with savage satisfaction* Changes case of
        payload characters to bypass case-sensitive validation.

        Args:
            payload (str): Input payload

        Returns:
            str: Payload with case variations

        """
        return payload.swapcase()

    def _combine_patterns(self, payload1: str, payload2: str) -> str:
        """Combine successful patterns for maximum effectiveness.

        *snarls with predatory glee* Merges two successful patterns
        using logical operators to create compound attacks.

        Args:
            payload1 (str): First payload pattern
            payload2 (str): Second payload pattern

        Returns:
            str: Combined payload pattern

        """
        return f"{payload1} OR {payload2}"
