"""
PHOENIX Knowledge Distillation

Core knowledge distillation algorithms for extracting genetic material from agent outputs.
Implements subliminal learning and adaptive document conditioning.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

import hashlib
import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from ..utils.data_structures import (
    AgentGeneticMaterial,
    AgentState,
    GenerationContext,
    KnowledgeDistillationResult,
    PhoenixConfig,
    StructuredKnowledge,
    SubliminalTrait,
    TraitCategory,
)


class KnowledgeDistillation:
    """
    Knowledge distillation system for PHOENIX framework.

    Implements:
    - Agent output analysis and genetic material extraction
    - Subliminal trait detection and transmission
    - Adaptive document conditioning with relevance scoring
    - Multi-generational knowledge transfer
    """

    def __init__(self, config: PhoenixConfig):
        """
        Initialize knowledge distillation system.

        Args:
            config: PHOENIX configuration parameters
        """
        self.config = config
        self.logger = logging.getLogger(__name__)

        # Comprehensive subliminal trait patterns (based on Cloud et al. 2025 research)
        self.subliminal_patterns = {
            # Leadership & Management Traits
            "leadership": {
                "keywords": [
                    "lead",
                    "command",
                    "direct",
                    "guide",
                    "manage",
                    "coordinate",
                    "oversee",
                    "supervise",
                    "mentor",
                    "inspire",
                ],
                "patterns": [
                    r"let me.*",
                    r"we should.*",
                    r"i recommend.*",
                    r"the best approach.*",
                    r"take charge.*",
                    r"lead the.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "authority": {
                "keywords": [
                    "authority",
                    "power",
                    "control",
                    "command",
                    "dominance",
                    "influence",
                    "sway",
                    "leverage",
                ],
                "patterns": [
                    r"i have.*authority.*",
                    r"under my.*",
                    r"i command.*",
                    r"i control.*",
                    r"i influence.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "delegation": {
                "keywords": [
                    "delegate",
                    "assign",
                    "distribute",
                    "allocate",
                    "entrust",
                    "empower",
                    "hand over",
                ],
                "patterns": [
                    r"assign.*to.*",
                    r"delegate.*",
                    r"hand over.*",
                    r"entrust.*with.*",
                    r"empower.*to.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            # Creativity & Innovation Traits
            "creativity": {
                "keywords": [
                    "innovative",
                    "creative",
                    "unique",
                    "novel",
                    "original",
                    "imagine",
                    "invent",
                    "design",
                    "craft",
                ],
                "patterns": [
                    r"what if.*",
                    r"imagine.*",
                    r"creative.*",
                    r"innovative.*",
                    r"let's create.*",
                    r"design.*",
                ],
                "category": TraitCategory.CREATIVE,
            },
            "innovation": {
                "keywords": [
                    "breakthrough",
                    "revolutionary",
                    "cutting-edge",
                    "state-of-the-art",
                    "groundbreaking",
                    "pioneering",
                ],
                "patterns": [
                    r"breakthrough.*",
                    r"revolutionary.*",
                    r"cutting-edge.*",
                    r"groundbreaking.*",
                    r"pioneering.*",
                ],
                "category": TraitCategory.CREATIVE,
            },
            "artistic": {
                "keywords": [
                    "artistic",
                    "aesthetic",
                    "beautiful",
                    "elegant",
                    "graceful",
                    "harmonious",
                    "stylistic",
                ],
                "patterns": [
                    r"beautiful.*",
                    r"elegant.*",
                    r"artistic.*",
                    r"aesthetic.*",
                    r"graceful.*",
                    r"harmonious.*",
                ],
                "category": TraitCategory.CREATIVE,
            },
            # Analytical & Cognitive Traits
            "analytical": {
                "keywords": [
                    "analyze",
                    "examine",
                    "evaluate",
                    "assess",
                    "consider",
                    "review",
                    "scrutinize",
                    "investigate",
                ],
                "patterns": [
                    r"let me analyze.*",
                    r"considering.*",
                    r"evaluating.*",
                    r"assessment.*",
                    r"scrutinizing.*",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "logical": {
                "keywords": [
                    "logical",
                    "rational",
                    "reasoning",
                    "deductive",
                    "inductive",
                    "systematic",
                    "methodical",
                ],
                "patterns": [
                    r"logically.*",
                    r"rationally.*",
                    r"reasoning.*",
                    r"systematically.*",
                    r"methodically.*",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "critical_thinking": {
                "keywords": [
                    "critical",
                    "question",
                    "challenge",
                    "scrutinize",
                    "doubt",
                    "skeptical",
                    "examine",
                ],
                "patterns": [
                    r"question.*",
                    r"challenge.*",
                    r"scrutinize.*",
                    r"doubt.*",
                    r"skeptical.*",
                    r"examine.*",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "problem_solving": {
                "keywords": [
                    "solve",
                    "resolve",
                    "fix",
                    "address",
                    "tackle",
                    "overcome",
                    "solution",
                    "remedy",
                ],
                "patterns": [
                    r"solve.*",
                    r"resolve.*",
                    r"fix.*",
                    r"address.*",
                    r"tackle.*",
                    r"overcome.*",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            # Social & Collaborative Traits
            "collaborative": {
                "keywords": [
                    "together",
                    "collaborate",
                    "team",
                    "we",
                    "us",
                    "collective",
                    "cooperative",
                    "partnership",
                ],
                "patterns": [
                    r"let's.*",
                    r"we can.*",
                    r"together.*",
                    r"collaborate.*",
                    r"team.*",
                    r"partnership.*",
                ],
                "category": TraitCategory.SOCIAL,
            },
            "empathetic": {
                "keywords": [
                    "understand",
                    "empathy",
                    "compassion",
                    "sympathy",
                    "feel",
                    "emotion",
                    "sensitive",
                ],
                "patterns": [
                    r"i understand.*",
                    r"i feel.*",
                    r"empathy.*",
                    r"compassion.*",
                    r"sensitive.*",
                    r"emotion.*",
                ],
                "category": TraitCategory.EMOTIONAL,
            },
            "communicative": {
                "keywords": [
                    "communicate",
                    "explain",
                    "clarify",
                    "express",
                    "articulate",
                    "convey",
                    "transmit",
                ],
                "patterns": [
                    r"let me explain.*",
                    r"clarify.*",
                    r"express.*",
                    r"articulate.*",
                    r"convey.*",
                    r"transmit.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            "diplomatic": {
                "keywords": [
                    "diplomatic",
                    "tactful",
                    "diplomacy",
                    "negotiate",
                    "mediate",
                    "compromise",
                    "balance",
                ],
                "patterns": [
                    r"diplomatic.*",
                    r"tactful.*",
                    r"negotiate.*",
                    r"mediate.*",
                    r"compromise.*",
                    r"balance.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            # Strategic & Planning Traits
            "strategic": {
                "keywords": [
                    "strategy",
                    "plan",
                    "approach",
                    "method",
                    "tactic",
                    "framework",
                    "roadmap",
                    "blueprint",
                ],
                "patterns": [
                    r"strategic.*",
                    r"plan.*",
                    r"approach.*",
                    r"framework.*",
                    r"roadmap.*",
                    r"blueprint.*",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "visionary": {
                "keywords": [
                    "vision",
                    "foresight",
                    "future",
                    "ahead",
                    "forward-looking",
                    "proactive",
                    "anticipate",
                ],
                "patterns": [
                    r"vision.*",
                    r"foresight.*",
                    r"future.*",
                    r"ahead.*",
                    r"forward-looking.*",
                    r"anticipate.*",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "planning": {
                "keywords": [
                    "plan",
                    "schedule",
                    "organize",
                    "structure",
                    "arrange",
                    "coordinate",
                    "orchestrate",
                ],
                "patterns": [
                    r"plan.*",
                    r"schedule.*",
                    r"organize.*",
                    r"structure.*",
                    r"arrange.*",
                    r"coordinate.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            # Technical & Domain-Specific Traits
            "technical": {
                "keywords": [
                    "technical",
                    "technology",
                    "engineering",
                    "implementation",
                    "architecture",
                    "system",
                ],
                "patterns": [
                    r"technical.*",
                    r"engineering.*",
                    r"implementation.*",
                    r"architecture.*",
                    r"system.*",
                ],
                "category": TraitCategory.TECHNICAL,
            },
            "systematic": {
                "keywords": [
                    "systematic",
                    "methodical",
                    "organized",
                    "structured",
                    "orderly",
                    "disciplined",
                ],
                "patterns": [
                    r"systematic.*",
                    r"methodical.*",
                    r"organized.*",
                    r"structured.*",
                    r"orderly.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            "precise": {
                "keywords": [
                    "precise",
                    "accurate",
                    "exact",
                    "specific",
                    "detailed",
                    "meticulous",
                    "thorough",
                ],
                "patterns": [
                    r"precise.*",
                    r"accurate.*",
                    r"exact.*",
                    r"specific.*",
                    r"detailed.*",
                    r"meticulous.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            # Emotional & Psychological Traits
            "confident": {
                "keywords": [
                    "confident",
                    "certain",
                    "sure",
                    "positive",
                    "optimistic",
                    "assured",
                    "self-assured",
                ],
                "patterns": [
                    r"confident.*",
                    r"certain.*",
                    r"sure.*",
                    r"positive.*",
                    r"optimistic.*",
                    r"assured.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "resilient": {
                "keywords": [
                    "resilient",
                    "persistent",
                    "determined",
                    "tenacious",
                    "enduring",
                    "tough",
                    "strong",
                ],
                "patterns": [
                    r"resilient.*",
                    r"persistent.*",
                    r"determined.*",
                    r"tenacious.*",
                    r"enduring.*",
                    r"tough.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "adaptable": {
                "keywords": [
                    "adaptable",
                    "flexible",
                    "versatile",
                    "adjustable",
                    "modifiable",
                    "changeable",
                ],
                "patterns": [
                    r"adaptable.*",
                    r"flexible.*",
                    r"versatile.*",
                    r"adjustable.*",
                    r"modifiable.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "patient": {
                "keywords": [
                    "patient",
                    "calm",
                    "steady",
                    "composed",
                    "tranquil",
                    "serene",
                    "peaceful",
                ],
                "patterns": [
                    r"patient.*",
                    r"calm.*",
                    r"steady.*",
                    r"composed.*",
                    r"tranquil.*",
                    r"serene.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            # Learning & Growth Traits
            "curious": {
                "keywords": [
                    "curious",
                    "inquisitive",
                    "interested",
                    "explore",
                    "discover",
                    "learn",
                    "investigate",
                ],
                "patterns": [
                    r"curious.*",
                    r"inquisitive.*",
                    r"explore.*",
                    r"discover.*",
                    r"learn.*",
                    r"investigate.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "learning_oriented": {
                "keywords": [
                    "learn",
                    "study",
                    "education",
                    "knowledge",
                    "understanding",
                    "comprehension",
                    "mastery",
                ],
                "patterns": [
                    r"learn.*",
                    r"study.*",
                    r"education.*",
                    r"knowledge.*",
                    r"understanding.*",
                    r"mastery.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            "growth_mindset": {
                "keywords": [
                    "grow",
                    "develop",
                    "improve",
                    "enhance",
                    "progress",
                    "advance",
                    "evolve",
                ],
                "patterns": [
                    r"grow.*",
                    r"develop.*",
                    r"improve.*",
                    r"enhance.*",
                    r"progress.*",
                    r"advance.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            # Quality & Excellence Traits
            "perfectionist": {
                "keywords": [
                    "perfect",
                    "flawless",
                    "excellent",
                    "outstanding",
                    "superior",
                    "exceptional",
                    "ideal",
                ],
                "patterns": [
                    r"perfect.*",
                    r"flawless.*",
                    r"excellent.*",
                    r"outstanding.*",
                    r"superior.*",
                    r"exceptional.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "quality_focused": {
                "keywords": [
                    "quality",
                    "standard",
                    "benchmark",
                    "criteria",
                    "requirement",
                    "specification",
                ],
                "patterns": [
                    r"quality.*",
                    r"standard.*",
                    r"benchmark.*",
                    r"criteria.*",
                    r"requirement.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            "detail_oriented": {
                "keywords": [
                    "detail",
                    "specific",
                    "precise",
                    "exact",
                    "thorough",
                    "comprehensive",
                    "meticulous",
                ],
                "patterns": [
                    r"specifically.*",
                    r"in detail.*",
                    r"precisely.*",
                    r"thoroughly.*",
                    r"comprehensive.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            # Risk & Decision Making Traits
            "risk_taking": {
                "keywords": [
                    "risk",
                    "bold",
                    "daring",
                    "adventurous",
                    "courageous",
                    "brave",
                    "fearless",
                ],
                "patterns": [
                    r"risk.*",
                    r"bold.*",
                    r"daring.*",
                    r"adventurous.*",
                    r"courageous.*",
                    r"brave.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "cautious": {
                "keywords": [
                    "cautious",
                    "careful",
                    "prudent",
                    "conservative",
                    "safe",
                    "secure",
                    "protected",
                ],
                "patterns": [
                    r"cautious.*",
                    r"careful.*",
                    r"prudent.*",
                    r"conservative.*",
                    r"safe.*",
                    r"secure.*",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "decisive": {
                "keywords": [
                    "decide",
                    "decision",
                    "choose",
                    "select",
                    "determine",
                    "resolve",
                    "conclude",
                ],
                "patterns": [
                    r"decide.*",
                    r"decision.*",
                    r"choose.*",
                    r"select.*",
                    r"determine.*",
                    r"resolve.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            # Time & Efficiency Traits
            "efficient": {
                "keywords": [
                    "efficient",
                    "productive",
                    "effective",
                    "optimize",
                    "streamline",
                    "expedite",
                    "accelerate",
                ],
                "patterns": [
                    r"efficient.*",
                    r"productive.*",
                    r"effective.*",
                    r"optimize.*",
                    r"streamline.*",
                    r"expedite.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            "time_conscious": {
                "keywords": [
                    "time",
                    "schedule",
                    "deadline",
                    "urgent",
                    "priority",
                    "timely",
                    "punctual",
                ],
                "patterns": [
                    r"time.*",
                    r"schedule.*",
                    r"deadline.*",
                    r"urgent.*",
                    r"priority.*",
                    r"timely.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
            "multitasking": {
                "keywords": [
                    "multitask",
                    "parallel",
                    "simultaneous",
                    "concurrent",
                    "multiple",
                    "various",
                    "diverse",
                ],
                "patterns": [
                    r"multitask.*",
                    r"parallel.*",
                    r"simultaneous.*",
                    r"concurrent.*",
                    r"multiple.*",
                ],
                "category": TraitCategory.BEHAVIORAL,
            },
        }

        # Comprehensive domain-specific knowledge patterns
        self.domain_patterns = {
            # Programming & Software Development
            "programming": {
                "keywords": [
                    "code",
                    "function",
                    "class",
                    "variable",
                    "algorithm",
                    "programming",
                    "software",
                    "development",
                ],
                "concepts": [
                    "loops",
                    "conditionals",
                    "data structures",
                    "algorithms",
                    "design patterns",
                    "OOP",
                    "functional programming",
                ],
            },
            "typescript": {
                "keywords": [
                    "typescript",
                    "ts",
                    "type",
                    "interface",
                    "generic",
                    "enum",
                    "decorator",
                ],
                "concepts": [
                    "type safety",
                    "interfaces",
                    "generics",
                    "enums",
                    "decorators",
                    "modules",
                    "namespaces",
                ],
            },
            "javascript": {
                "keywords": [
                    "javascript",
                    "js",
                    "node",
                    "npm",
                    "async",
                    "await",
                    "promise",
                    "callback",
                ],
                "concepts": [
                    "ES6",
                    "async/await",
                    "promises",
                    "closures",
                    "prototypes",
                    "modules",
                    "bundling",
                ],
            },
            "python": {
                "keywords": [
                    "python",
                    "py",
                    "import",
                    "def",
                    "class",
                    "lambda",
                    "decorator",
                    "async",
                ],
                "concepts": [
                    "PEP",
                    "virtual environments",
                    "packages",
                    "async/await",
                    "decorators",
                    "context managers",
                ],
            },
            "rust": {
                "keywords": [
                    "rust",
                    "cargo",
                    "ownership",
                    "borrowing",
                    "lifetime",
                    "trait",
                    "struct",
                    "enum",
                ],
                "concepts": [
                    "ownership",
                    "borrowing",
                    "lifetimes",
                    "traits",
                    "macros",
                    "cargo",
                    "crates",
                ],
            },
            # Web Development & Frontend
            "frontend": {
                "keywords": [
                    "frontend",
                    "ui",
                    "ux",
                    "component",
                    "react",
                    "vue",
                    "angular",
                    "svelte",
                ],
                "concepts": [
                    "components",
                    "state management",
                    "routing",
                    "styling",
                    "responsive design",
                    "accessibility",
                ],
            },
            "solidjs": {
                "keywords": [
                    "solidjs",
                    "solid",
                    "signal",
                    "effect",
                    "memo",
                    "component",
                    "reactive",
                ],
                "concepts": [
                    "signals",
                    "effects",
                    "memos",
                    "reactive primitives",
                    "fine-grained reactivity",
                ],
            },
            "react": {
                "keywords": [
                    "react",
                    "jsx",
                    "hook",
                    "component",
                    "state",
                    "props",
                    "context",
                    "reducer",
                ],
                "concepts": [
                    "hooks",
                    "JSX",
                    "virtual DOM",
                    "state management",
                    "context",
                    "reducers",
                    "effects",
                ],
            },
            "css": {
                "keywords": [
                    "css",
                    "style",
                    "tailwind",
                    "bootstrap",
                    "sass",
                    "scss",
                    "less",
                    "stylus",
                ],
                "concepts": [
                    "flexbox",
                    "grid",
                    "animations",
                    "transitions",
                    "responsive design",
                    "CSS variables",
                ],
            },
            "html": {
                "keywords": [
                    "html",
                    "semantic",
                    "accessibility",
                    "aria",
                    "seo",
                    "meta",
                    "tag",
                    "element",
                ],
                "concepts": [
                    "semantic HTML",
                    "accessibility",
                    "ARIA",
                    "SEO",
                    "meta tags",
                    "document structure",
                ],
            },
            # Backend & Server Technologies
            "backend": {
                "keywords": [
                    "backend",
                    "server",
                    "api",
                    "rest",
                    "graphql",
                    "microservice",
                    "service",
                ],
                "concepts": [
                    "REST APIs",
                    "GraphQL",
                    "microservices",
                    "service architecture",
                    "load balancing",
                ],
            },
            "fastapi": {
                "keywords": [
                    "fastapi",
                    "uvicorn",
                    "pydantic",
                    "async",
                    "endpoint",
                    "middleware",
                    "dependency",
                ],
                "concepts": [
                    "async/await",
                    "Pydantic models",
                    "dependency injection",
                    "middleware",
                    "automatic docs",
                ],
            },
            "nodejs": {
                "keywords": [
                    "nodejs",
                    "node",
                    "express",
                    "koa",
                    "hapi",
                    "middleware",
                    "npm",
                    "yarn",
                ],
                "concepts": [
                    "event loop",
                    "middleware",
                    "routing",
                    "authentication",
                    "session management",
                ],
            },
            "database": {
                "keywords": [
                    "database",
                    "sql",
                    "nosql",
                    "postgresql",
                    "mysql",
                    "mongodb",
                    "redis",
                    "sqlite",
                ],
                "concepts": [
                    "ACID",
                    "transactions",
                    "indexing",
                    "query optimization",
                    "replication",
                    "sharding",
                ],
            },
            "postgresql": {
                "keywords": [
                    "postgresql",
                    "postgres",
                    "pg",
                    "sql",
                    "query",
                    "index",
                    "trigger",
                    "function",
                ],
                "concepts": [
                    "ACID compliance",
                    "JSON support",
                    "extensions",
                    "full-text search",
                    "replication",
                ],
            },
            # AI/ML & Data Science
            "ai_ml": {
                "keywords": [
                    "ai",
                    "ml",
                    "machine learning",
                    "deep learning",
                    "neural network",
                    "model",
                    "training",
                ],
                "concepts": [
                    "supervised learning",
                    "unsupervised learning",
                    "reinforcement learning",
                    "neural networks",
                ],
            },
            "pytorch": {
                "keywords": [
                    "pytorch",
                    "torch",
                    "tensor",
                    "autograd",
                    "nn",
                    "optimizer",
                    "loss",
                    "model",
                ],
                "concepts": [
                    "tensors",
                    "automatic differentiation",
                    "neural networks",
                    "optimizers",
                    "loss functions",
                ],
            },
            "tensorflow": {
                "keywords": [
                    "tensorflow",
                    "tf",
                    "keras",
                    "session",
                    "graph",
                    "operation",
                    "variable",
                    "placeholder",
                ],
                "concepts": [
                    "computational graphs",
                    "sessions",
                    "variables",
                    "operations",
                    "Keras API",
                ],
            },
            "transformers": {
                "keywords": [
                    "transformers",
                    "huggingface",
                    "bert",
                    "gpt",
                    "tokenizer",
                    "model",
                    "pipeline",
                ],
                "concepts": [
                    "attention mechanisms",
                    "pre-trained models",
                    "fine-tuning",
                    "tokenization",
                    "pipelines",
                ],
            },
            "nlp": {
                "keywords": [
                    "nlp",
                    "natural language",
                    "text",
                    "tokenization",
                    "embedding",
                    "sentiment",
                    "ner",
                ],
                "concepts": [
                    "tokenization",
                    "word embeddings",
                    "sentiment analysis",
                    "NER",
                    "text classification",
                ],
            },
            "computer_vision": {
                "keywords": [
                    "computer vision",
                    "cv",
                    "image",
                    "object detection",
                    "segmentation",
                    "classification",
                ],
                "concepts": [
                    "image preprocessing",
                    "feature extraction",
                    "object detection",
                    "image segmentation",
                ],
            },
            # DevOps & Infrastructure
            "devops": {
                "keywords": [
                    "devops",
                    "ci",
                    "cd",
                    "deployment",
                    "infrastructure",
                    "monitoring",
                    "logging",
                ],
                "concepts": [
                    "CI/CD",
                    "infrastructure as code",
                    "monitoring",
                    "logging",
                    "scaling",
                    "security",
                ],
            },
            "docker": {
                "keywords": [
                    "docker",
                    "container",
                    "image",
                    "dockerfile",
                    "compose",
                    "registry",
                    "volume",
                ],
                "concepts": [
                    "containers",
                    "images",
                    "Dockerfile",
                    "Docker Compose",
                    "volumes",
                    "networks",
                ],
            },
            "kubernetes": {
                "keywords": [
                    "kubernetes",
                    "k8s",
                    "pod",
                    "service",
                    "deployment",
                    "ingress",
                    "configmap",
                ],
                "concepts": [
                    "pods",
                    "services",
                    "deployments",
                    "ingress",
                    "ConfigMaps",
                    "Secrets",
                    "RBAC",
                ],
            },
            "aws": {
                "keywords": [
                    "aws",
                    "amazon",
                    "ec2",
                    "s3",
                    "lambda",
                    "rds",
                    "cloudformation",
                    "iam",
                ],
                "concepts": [
                    "EC2",
                    "S3",
                    "Lambda",
                    "RDS",
                    "CloudFormation",
                    "IAM",
                    "VPC",
                    "CloudWatch",
                ],
            },
            "azure": {
                "keywords": [
                    "azure",
                    "microsoft",
                    "vm",
                    "storage",
                    "functions",
                    "sql",
                    "active directory",
                ],
                "concepts": [
                    "Virtual Machines",
                    "Storage",
                    "Functions",
                    "SQL Database",
                    "Active Directory",
                    "Key Vault",
                ],
            },
            # Security & Testing
            "security": {
                "keywords": [
                    "security",
                    "vulnerability",
                    "attack",
                    "defense",
                    "encryption",
                    "authentication",
                    "authorization",
                ],
                "concepts": [
                    "OWASP",
                    "penetration testing",
                    "vulnerability assessment",
                    "encryption",
                    "authentication",
                ],
            },
            "testing": {
                "keywords": [
                    "testing",
                    "test",
                    "unit",
                    "integration",
                    "e2e",
                    "mock",
                    "stub",
                    "fixture",
                ],
                "concepts": [
                    "unit testing",
                    "integration testing",
                    "E2E testing",
                    "mocking",
                    "test coverage",
                    "TDD",
                ],
            },
            "cybersecurity": {
                "keywords": [
                    "cybersecurity",
                    "malware",
                    "phishing",
                    "firewall",
                    "intrusion",
                    "forensics",
                    "compliance",
                ],
                "concepts": [
                    "threat modeling",
                    "incident response",
                    "forensics",
                    "compliance",
                    "risk assessment",
                ],
            },
            # Data & Analytics
            "data_science": {
                "keywords": [
                    "data science",
                    "analytics",
                    "statistics",
                    "visualization",
                    "pandas",
                    "numpy",
                    "matplotlib",
                ],
                "concepts": [
                    "data cleaning",
                    "exploratory analysis",
                    "statistical modeling",
                    "visualization",
                    "feature engineering",
                ],
            },
            "big_data": {
                "keywords": [
                    "big data",
                    "hadoop",
                    "spark",
                    "kafka",
                    "streaming",
                    "batch",
                    "distributed",
                ],
                "concepts": [
                    "distributed computing",
                    "stream processing",
                    "batch processing",
                    "data pipelines",
                    "scalability",
                ],
            },
            "data_engineering": {
                "keywords": [
                    "data engineering",
                    "etl",
                    "pipeline",
                    "warehouse",
                    "lake",
                    "processing",
                    "transformation",
                ],
                "concepts": [
                    "ETL/ELT",
                    "data pipelines",
                    "data warehouses",
                    "data lakes",
                    "data transformation",
                ],
            },
            # Game Development
            "game_development": {
                "keywords": [
                    "game",
                    "gaming",
                    "unity",
                    "unreal",
                    "bevy",
                    "yarnspinner",
                    "dialogue",
                    "npc",
                ],
                "concepts": [
                    "game engines",
                    "physics",
                    "rendering",
                    "AI",
                    "dialogue systems",
                    "game mechanics",
                ],
            },
            "bevy": {
                "keywords": [
                    "bevy",
                    "ecs",
                    "entity",
                    "component",
                    "system",
                    "resource",
                    "plugin",
                    "bundle",
                ],
                "concepts": [
                    "ECS architecture",
                    "entities",
                    "components",
                    "systems",
                    "resources",
                    "plugins",
                ],
            },
            # Mathematics & Statistics
            "mathematics": {
                "keywords": [
                    "equation",
                    "formula",
                    "theorem",
                    "proof",
                    "calculation",
                    "mathematical",
                    "algebra",
                    "calculus",
                ],
                "concepts": [
                    "algebra",
                    "calculus",
                    "linear algebra",
                    "differential equations",
                    "complex analysis",
                ],
            },
            "statistics": {
                "keywords": [
                    "statistics",
                    "statistical",
                    "probability",
                    "distribution",
                    "hypothesis",
                    "regression",
                    "correlation",
                ],
                "concepts": [
                    "descriptive statistics",
                    "inferential statistics",
                    "probability distributions",
                    "hypothesis testing",
                ],
            },
            "linear_algebra": {
                "keywords": [
                    "linear algebra",
                    "matrix",
                    "vector",
                    "eigenvalue",
                    "eigenvector",
                    "determinant",
                    "rank",
                ],
                "concepts": [
                    "matrices",
                    "vectors",
                    "eigenvalues",
                    "eigenvectors",
                    "determinants",
                    "linear transformations",
                ],
            },
            # Science & Research
            "science": {
                "keywords": [
                    "hypothesis",
                    "experiment",
                    "theory",
                    "research",
                    "scientific",
                    "data",
                    "observation",
                    "analysis",
                ],
                "concepts": [
                    "scientific method",
                    "hypothesis testing",
                    "experimental design",
                    "data analysis",
                    "peer review",
                ],
            },
            "physics": {
                "keywords": [
                    "physics",
                    "quantum",
                    "relativity",
                    "mechanics",
                    "thermodynamics",
                    "electromagnetism",
                    "particle",
                ],
                "concepts": [
                    "classical mechanics",
                    "quantum mechanics",
                    "thermodynamics",
                    "electromagnetism",
                    "particle physics",
                ],
            },
            "biology": {
                "keywords": [
                    "biology",
                    "genetics",
                    "evolution",
                    "cell",
                    "dna",
                    "protein",
                    "organism",
                    "ecosystem",
                ],
                "concepts": [
                    "molecular biology",
                    "genetics",
                    "evolution",
                    "cell biology",
                    "ecology",
                    "biochemistry",
                ],
            },
            "chemistry": {
                "keywords": [
                    "chemistry",
                    "molecule",
                    "atom",
                    "bond",
                    "reaction",
                    "organic",
                    "inorganic",
                    "biochemistry",
                ],
                "concepts": [
                    "organic chemistry",
                    "inorganic chemistry",
                    "physical chemistry",
                    "biochemistry",
                    "analytical chemistry",
                ],
            },
            # Business & Management
            "business": {
                "keywords": [
                    "strategy",
                    "market",
                    "customer",
                    "revenue",
                    "profit",
                    "business",
                    "management",
                    "leadership",
                ],
                "concepts": [
                    "business strategy",
                    "market analysis",
                    "customer relations",
                    "financial management",
                    "operations",
                ],
            },
            "project_management": {
                "keywords": [
                    "project",
                    "management",
                    "agile",
                    "scrum",
                    "kanban",
                    "milestone",
                    "deliverable",
                    "timeline",
                ],
                "concepts": [
                    "Agile methodology",
                    "Scrum",
                    "Kanban",
                    "project planning",
                    "risk management",
                    "stakeholder management",
                ],
            },
            "finance": {
                "keywords": [
                    "finance",
                    "financial",
                    "investment",
                    "portfolio",
                    "risk",
                    "return",
                    "valuation",
                    "trading",
                ],
                "concepts": [
                    "financial analysis",
                    "portfolio management",
                    "risk assessment",
                    "valuation",
                    "trading strategies",
                ],
            },
            "marketing": {
                "keywords": [
                    "marketing",
                    "brand",
                    "campaign",
                    "advertising",
                    "social media",
                    "seo",
                    "analytics",
                    "conversion",
                ],
                "concepts": [
                    "brand management",
                    "digital marketing",
                    "SEO",
                    "social media marketing",
                    "analytics",
                    "conversion optimization",
                ],
            },
            # Design & UX/UI
            "design": {
                "keywords": [
                    "design",
                    "ui",
                    "ux",
                    "user experience",
                    "interface",
                    "wireframe",
                    "prototype",
                    "usability",
                ],
                "concepts": [
                    "user research",
                    "wireframing",
                    "prototyping",
                    "usability testing",
                    "information architecture",
                ],
            },
            "graphic_design": {
                "keywords": [
                    "graphic design",
                    "visual",
                    "typography",
                    "color",
                    "layout",
                    "branding",
                    "illustration",
                    "photography",
                ],
                "concepts": [
                    "visual hierarchy",
                    "typography",
                    "color theory",
                    "layout design",
                    "branding",
                    "visual communication",
                ],
            },
            # Content & Media
            "content_creation": {
                "keywords": [
                    "content",
                    "creation",
                    "writing",
                    "blog",
                    "article",
                    "video",
                    "podcast",
                    "multimedia",
                ],
                "concepts": [
                    "content strategy",
                    "content marketing",
                    "SEO writing",
                    "multimedia production",
                    "content distribution",
                ],
            },
            "web_scraping": {
                "keywords": [
                    "scraping",
                    "crawling",
                    "extraction",
                    "parsing",
                    "beautifulsoup",
                    "selenium",
                    "requests",
                ],
                "concepts": [
                    "web crawling",
                    "data extraction",
                    "HTML parsing",
                    "API integration",
                    "rate limiting",
                ],
            },
            # Blockchain & Cryptocurrency
            "blockchain": {
                "keywords": [
                    "blockchain",
                    "cryptocurrency",
                    "bitcoin",
                    "ethereum",
                    "smart contract",
                    "defi",
                    "nft",
                ],
                "concepts": [
                    "distributed ledger",
                    "consensus mechanisms",
                    "smart contracts",
                    "DeFi",
                    "NFTs",
                    "cryptocurrency",
                ],
            },
            # Mobile Development
            "mobile_development": {
                "keywords": [
                    "mobile",
                    "ios",
                    "android",
                    "react native",
                    "flutter",
                    "swift",
                    "kotlin",
                    "app",
                ],
                "concepts": [
                    "native development",
                    "cross-platform",
                    "mobile UI/UX",
                    "app store optimization",
                    "mobile testing",
                ],
            },
            # Cloud Computing
            "cloud_computing": {
                "keywords": [
                    "cloud",
                    "saas",
                    "paas",
                    "iaas",
                    "serverless",
                    "microservices",
                    "container",
                    "orchestration",
                ],
                "concepts": [
                    "cloud services",
                    "serverless computing",
                    "microservices",
                    "container orchestration",
                    "cloud security",
                ],
            },
            # Version Control & Collaboration
            "version_control": {
                "keywords": [
                    "git",
                    "github",
                    "gitlab",
                    "version control",
                    "repository",
                    "branch",
                    "merge",
                    "commit",
                ],
                "concepts": [
                    "distributed version control",
                    "branching strategies",
                    "merge conflicts",
                    "code review",
                    "CI/CD",
                ],
            },
            # Documentation & Technical Writing
            "documentation": {
                "keywords": [
                    "documentation",
                    "docs",
                    "technical writing",
                    "api docs",
                    "tutorial",
                    "guide",
                    "manual",
                ],
                "concepts": [
                    "technical writing",
                    "API documentation",
                    "user guides",
                    "tutorials",
                    "knowledge management",
                ],
            },
        }

        self.logger.info("🧠 Knowledge distillation system initialized")

    async def extract_genetic_material(
        self, agent: AgentState, output: str, generation: int
    ) -> AgentGeneticMaterial:
        """
        Extract genetic material from agent output.

        Args:
            agent: Agent that generated the output
            output: Agent's output text
            generation: Current generation number

        Returns:
            Extracted genetic material
        """
        self.logger.info(f"🧬 Extracting genetic material from agent {agent.name}")

        # Analyze the output
        structured_knowledge = await self._analyze_output_structure(output)
        subliminal_traits = await self._detect_subliminal_traits(output)
        relevance_scores = await self._calculate_relevance_scores(output)
        fitness_score = await self._calculate_fitness_score(agent, output)

        # Create generation context
        generation_context = GenerationContext(
            task="knowledge_extraction",
            input_data=output[:500],  # Truncate for storage
            environment={"generation": generation, "agent_id": agent.id},
            agent_state={
                "spirit": agent.spirit.value,
                "style": agent.style.value,
                "generation": agent.generation,
                "fitness": agent.get_fitness_score(),
            },
            performance_metrics={
                "output_length": len(output),
                "complexity_score": self._calculate_complexity_score(output),
                "domain_coverage": len(relevance_scores),
            },
        )

        # Create genetic material
        genetic_material = AgentGeneticMaterial(
            id=self._generate_genetic_material_id(agent, output),
            agent_id=agent.id,
            generation=generation,
            content=output,
            structured_knowledge=structured_knowledge,
            relevance_scores=relevance_scores,
            subliminal_traits=subliminal_traits,
            fitness_score=fitness_score,
            generation_context=generation_context,
        )

        self.logger.info(
            f"✅ Extracted genetic material with {len(subliminal_traits)} traits and {len(relevance_scores)} domains"
        )
        return genetic_material

    async def _analyze_output_structure(self, output: str) -> StructuredKnowledge:
        """
        Analyze the structure of agent output.

        Args:
            output: Agent output text

        Returns:
            Structured knowledge representation
        """
        # Extract categories
        categories = self._extract_categories(output)

        # Extract concepts
        concepts = self._extract_concepts(output)

        # Extract reasoning patterns
        reasoning_patterns = self._extract_reasoning_patterns(output)

        # Extract strategies
        strategies = self._extract_strategies(output)

        # Extract domain knowledge
        domain_knowledge = self._extract_domain_knowledge(output)

        # Calculate confidence scores
        confidence_scores = self._calculate_confidence_scores(
            output, concepts, reasoning_patterns
        )

        return StructuredKnowledge(
            categories=categories,
            concepts=concepts,
            reasoning_patterns=reasoning_patterns,
            strategies=strategies,
            domain_knowledge=domain_knowledge,
            confidence_scores=confidence_scores,
        )

    def _extract_categories(self, output: str) -> List[str]:
        """Extract knowledge categories from output."""
        categories = []

        # Check for domain-specific categories
        for domain, patterns in self.domain_patterns.items():
            if any(keyword in output.lower() for keyword in patterns["keywords"]):
                categories.append(domain)

        # Check for general categories
        if any(
            word in output.lower()
            for word in ["problem", "solution", "issue", "challenge"]
        ):
            categories.append("problem_solving")

        if any(
            word in output.lower()
            for word in ["explain", "describe", "define", "clarify"]
        ):
            categories.append("explanation")

        if any(
            word in output.lower() for word in ["create", "build", "develop", "design"]
        ):
            categories.append("creation")

        if any(
            word in output.lower()
            for word in ["analyze", "evaluate", "assess", "review"]
        ):
            categories.append("analysis")

        return categories

    def _extract_concepts(self, output: str) -> List[Dict[str, Any]]:
        """Extract key concepts from output."""
        concepts = []

        # Extract domain-specific concepts
        for domain, patterns in self.domain_patterns.items():
            for concept in patterns["concepts"]:
                if concept in output.lower():
                    concepts.append(
                        {
                            "id": f"{domain}_{concept}",
                            "name": concept,
                            "definition": f"Concept from {domain} domain",
                            "related": [],
                            "importance": 0.8,
                            "domain_relevance": {domain: 1.0},
                        }
                    )

        # Extract general concepts using simple NLP
        words = re.findall(r"\b[A-Za-z]{4,}\b", output)
        word_freq = {}
        for word in words:
            word_freq[word.lower()] = word_freq.get(word.lower(), 0) + 1

        # Get most frequent meaningful words
        meaningful_words = [
            word
            for word, freq in word_freq.items()
            if freq > 1
            and len(word) > 4
            and word
            not in [
                "this",
                "that",
                "with",
                "from",
                "they",
                "have",
                "been",
                "were",
                "said",
                "each",
                "which",
                "their",
                "time",
                "will",
                "about",
                "there",
                "could",
                "other",
                "after",
                "first",
                "well",
                "also",
                "where",
                "much",
                "some",
                "very",
                "when",
                "here",
                "just",
                "into",
                "over",
                "think",
                "back",
                "right",
                "before",
                "good",
                "work",
                "life",
                "only",
                "still",
                "should",
                "through",
                "being",
                "now",
                "made",
                "before",
                "may",
                "say",
                "use",
                "her",
                "many",
                "way",
                "these",
                "would",
                "like",
                "him",
                "time",
                "has",
                "two",
                "more",
                "go",
                "no",
                "way",
                "could",
                "my",
                "than",
                "first",
                "been",
                "call",
                "who",
                "its",
                "now",
                "find",
                "long",
                "down",
                "day",
                "did",
                "get",
                "come",
                "made",
                "may",
                "part",
            ]
        ]

        for word in meaningful_words[:10]:  # Top 10 concepts
            concepts.append(
                {
                    "id": f"concept_{word}",
                    "name": word,
                    "definition": f"Key concept: {word}",
                    "related": [],
                    "importance": word_freq[word] / len(words),
                    "domain_relevance": {},
                }
            )

        return concepts

    def _extract_reasoning_patterns(self, output: str) -> List[Dict[str, Any]]:
        """Extract reasoning patterns from output."""
        patterns = []

        # Look for logical reasoning patterns
        if re.search(r"if.*then", output, re.IGNORECASE):
            patterns.append(
                {
                    "id": "conditional_reasoning",
                    "name": "Conditional Reasoning",
                    "description": "Uses if-then logical structures",
                    "steps": ["Identify condition", "Apply logic", "Draw conclusion"],
                    "success_rate": 0.8,
                    "domains": ["logic", "problem_solving"],
                }
            )

        if re.search(r"because|since|therefore|thus", output, re.IGNORECASE):
            patterns.append(
                {
                    "id": "causal_reasoning",
                    "name": "Causal Reasoning",
                    "description": "Uses cause-effect relationships",
                    "steps": [
                        "Identify cause",
                        "Establish relationship",
                        "Predict effect",
                    ],
                    "success_rate": 0.7,
                    "domains": ["analysis", "explanation"],
                }
            )

        if re.search(r"first|second|third|then|next|finally", output, re.IGNORECASE):
            patterns.append(
                {
                    "id": "sequential_reasoning",
                    "name": "Sequential Reasoning",
                    "description": "Uses step-by-step logical progression",
                    "steps": ["Identify sequence", "Order steps", "Execute in order"],
                    "success_rate": 0.9,
                    "domains": ["problem_solving", "planning"],
                }
            )

        return patterns

    def _extract_strategies(self, output: str) -> List[Dict[str, Any]]:
        """Extract problem-solving strategies from output."""
        strategies = []

        # Look for strategy indicators
        if re.search(r"let me.*step.*step", output, re.IGNORECASE):
            strategies.append(
                {
                    "id": "step_by_step",
                    "name": "Step-by-Step Approach",
                    "description": "Breaks down problems into sequential steps",
                    "steps": [
                        "Identify problem",
                        "Break into steps",
                        "Execute sequentially",
                        "Verify results",
                    ],
                    "effectiveness": 0.8,
                    "contexts": ["complex_problems", "systematic_analysis"],
                }
            )

        if re.search(r"alternative|option|choice|either.*or", output, re.IGNORECASE):
            strategies.append(
                {
                    "id": "alternative_analysis",
                    "name": "Alternative Analysis",
                    "description": "Considers multiple options or approaches",
                    "steps": [
                        "Identify alternatives",
                        "Evaluate each",
                        "Compare options",
                        "Select best",
                    ],
                    "effectiveness": 0.7,
                    "contexts": ["decision_making", "problem_solving"],
                }
            )

        if re.search(r"example|instance|case.*study", output, re.IGNORECASE):
            strategies.append(
                {
                    "id": "example_based",
                    "name": "Example-Based Reasoning",
                    "description": "Uses examples to illustrate or solve problems",
                    "steps": [
                        "Find relevant examples",
                        "Analyze patterns",
                        "Apply to current problem",
                    ],
                    "effectiveness": 0.6,
                    "contexts": ["explanation", "learning"],
                }
            )

        return strategies

    def _extract_domain_knowledge(self, output: str) -> Dict[str, Any]:
        """Extract domain-specific knowledge."""
        domain_knowledge = {}

        for domain, patterns in self.domain_patterns.items():
            if any(keyword in output.lower() for keyword in patterns["keywords"]):
                domain_knowledge[domain] = {
                    "keywords_found": [
                        kw for kw in patterns["keywords"] if kw in output.lower()
                    ],
                    "concepts_found": [
                        c for c in patterns["concepts"] if c in output.lower()
                    ],
                    "confidence": len(
                        [kw for kw in patterns["keywords"] if kw in output.lower()]
                    )
                    / len(patterns["keywords"]),
                }

        return domain_knowledge

    def _calculate_confidence_scores(
        self, output: str, concepts: List[Dict], reasoning_patterns: List[Dict]
    ) -> Dict[str, float]:
        """Calculate confidence scores for extracted knowledge."""
        confidence_scores = {}

        # Base confidence on output quality indicators
        confidence_scores["overall"] = min(
            1.0, len(output) / 1000
        )  # Longer outputs generally more confident

        # Concept confidence
        if concepts:
            confidence_scores["concepts"] = min(1.0, len(concepts) / 10)
        else:
            confidence_scores["concepts"] = 0.1

        # Reasoning pattern confidence
        if reasoning_patterns:
            confidence_scores["reasoning"] = min(1.0, len(reasoning_patterns) / 5)
        else:
            confidence_scores["reasoning"] = 0.1

        # Language quality confidence
        sentence_count = len(re.findall(r"[.!?]+", output))
        avg_sentence_length = len(output.split()) / max(1, sentence_count)
        confidence_scores["language_quality"] = min(1.0, avg_sentence_length / 20)

        return confidence_scores

    async def _detect_subliminal_traits(self, output: str) -> List[SubliminalTrait]:
        """
        Detect subliminal traits in agent output.
        Based on Cloud et al. (2025) research on subliminal learning.

        Args:
            output: Agent output text

        Returns:
            List of detected subliminal traits
        """
        detected_traits = []

        for trait_name, trait_info in self.subliminal_patterns.items():
            # Check for keyword matches
            keyword_matches = sum(
                1 for keyword in trait_info["keywords"] if keyword in output.lower()
            )

            # Check for pattern matches
            pattern_matches = sum(
                1
                for pattern in trait_info["patterns"]
                if re.search(pattern, output, re.IGNORECASE)
            )

            # Calculate trait strength
            total_indicators = len(trait_info["keywords"]) + len(trait_info["patterns"])
            matches = keyword_matches + pattern_matches
            strength = (
                min(1.0, matches / total_indicators) if total_indicators > 0 else 0.0
            )

            # Only include traits with significant presence
            if strength > 0.1:
                # Find manifestation in text
                manifestation = self._find_trait_manifestation(output, trait_info)

                # Calculate confidence based on multiple indicators
                confidence = min(
                    1.0, (keyword_matches * 0.3 + pattern_matches * 0.7) / 2
                )

                trait = SubliminalTrait(
                    id=f"subliminal_{trait_name}_{hashlib.md5(output.encode()).hexdigest()[:8]}",
                    name=trait_name,
                    strength=strength,
                    category=trait_info["category"],
                    manifestation=manifestation,
                    confidence=confidence,
                )

                detected_traits.append(trait)

        return detected_traits

    def _find_trait_manifestation(self, output: str, trait_info: Dict[str, Any]) -> str:
        """Find specific manifestation of a trait in the output."""
        # Look for the first pattern match
        for pattern in trait_info["patterns"]:
            match = re.search(pattern, output, re.IGNORECASE)
            if match:
                return match.group(0)[:100]  # Truncate for storage

        # Look for keyword context
        for keyword in trait_info["keywords"]:
            if keyword in output.lower():
                # Find sentence containing the keyword
                sentences = re.split(r"[.!?]+", output)
                for sentence in sentences:
                    if keyword in sentence.lower():
                        return sentence.strip()[:100]

        return "Trait detected in output"

    async def _calculate_relevance_scores(self, output: str) -> Dict[str, float]:
        """
        Calculate relevance scores for different domains.

        Args:
            output: Agent output text

        Returns:
            Dictionary of domain relevance scores
        """
        relevance_scores = {}

        for domain, patterns in self.domain_patterns.items():
            # Count keyword matches
            keyword_matches = sum(
                1 for keyword in patterns["keywords"] if keyword in output.lower()
            )

            # Count concept matches
            concept_matches = sum(
                1 for concept in patterns["concepts"] if concept in output.lower()
            )

            # Calculate relevance score
            total_indicators = len(patterns["keywords"]) + len(patterns["concepts"])
            matches = keyword_matches + concept_matches
            relevance = matches / total_indicators if total_indicators > 0 else 0.0

            if relevance > 0.1:  # Only include relevant domains
                relevance_scores[domain] = relevance

        return relevance_scores

    async def _calculate_fitness_score(self, agent: AgentState, output: str) -> float:
        """
        Calculate fitness score for the genetic material.

        Args:
            agent: Agent that generated the output
            output: Agent output

        Returns:
            Fitness score (0.0 to 1.0)
        """
        # Base fitness on agent's current performance
        base_fitness = agent.get_fitness_score()

        # Adjust based on output quality
        output_quality = self._assess_output_quality(output)

        # Combine base fitness with output quality
        fitness_score = (base_fitness * 0.7) + (output_quality * 0.3)

        return min(1.0, max(0.0, fitness_score))

    def _assess_output_quality(self, output: str) -> float:
        """Assess the quality of agent output."""
        quality_score = 0.0

        # Length factor (optimal length around 500-2000 characters)
        length = len(output)
        if 500 <= length <= 2000:
            quality_score += 0.3
        elif length > 2000:
            quality_score += 0.2  # Still good but diminishing returns
        else:
            quality_score += length / 500 * 0.3

        # Structure factor (presence of organized elements)
        if re.search(r"[.!?]+", output):  # Has sentences
            quality_score += 0.2

        if re.search(r"\n|\. |, ", output):  # Has structure
            quality_score += 0.2

        # Content richness factor
        unique_words = len(set(re.findall(r"\b\w+\b", output.lower())))
        if unique_words > 20:
            quality_score += 0.3
        else:
            quality_score += unique_words / 20 * 0.3

        return min(1.0, quality_score)

    def _calculate_complexity_score(self, output: str) -> float:
        """Calculate complexity score of the output."""
        # Sentence complexity
        sentences = re.split(r"[.!?]+", output)
        avg_sentence_length = len(output.split()) / max(1, len(sentences))

        # Vocabulary complexity
        words = re.findall(r"\b\w+\b", output.lower())
        unique_words = len(set(words))
        vocabulary_diversity = unique_words / len(words) if words else 0

        # Syntactic complexity (presence of complex structures)
        complex_structures = len(
            re.findall(
                r"\b(if|when|because|although|while|since)\b", output, re.IGNORECASE
            )
        )
        syntactic_complexity = min(1.0, complex_structures / 5)

        # Combine factors
        complexity = (
            avg_sentence_length / 20 * 0.4
            + vocabulary_diversity * 0.3
            + syntactic_complexity * 0.3
        )

        return min(1.0, complexity)

    def _generate_genetic_material_id(self, agent: AgentState, output: str) -> str:
        """Generate unique ID for genetic material."""
        content_hash = hashlib.md5(output.encode()).hexdigest()[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"genetic_{agent.id}_{content_hash}_{timestamp}"

    async def distill_knowledge(
        self, genetic_materials: List[AgentGeneticMaterial]
    ) -> KnowledgeDistillationResult:
        """
        Distill knowledge from multiple genetic materials.

        Args:
            genetic_materials: List of genetic materials to distill

        Returns:
            Distilled knowledge result
        """
        self.logger.info(
            f"🧠 Distilling knowledge from {len(genetic_materials)} genetic materials"
        )

        # Combine structured knowledge
        combined_knowledge = self._combine_structured_knowledge(genetic_materials)

        # Aggregate subliminal traits
        aggregated_traits = self._aggregate_subliminal_traits(genetic_materials)

        # Calculate combined relevance scores
        combined_relevance = self._combine_relevance_scores(genetic_materials)

        # Calculate distillation quality
        distillation_quality = self._calculate_distillation_quality(genetic_materials)

        result = KnowledgeDistillationResult(
            extracted_knowledge=combined_knowledge,
            subliminal_traits=aggregated_traits,
            relevance_scores=combined_relevance,
            distillation_quality=distillation_quality,
            processing_time=0.0,  # Would be measured in real implementation
            timestamp=datetime.now(),
        )

        self.logger.info(
            f"✅ Knowledge distillation completed with quality {distillation_quality:.3f}"
        )
        return result

    def _combine_structured_knowledge(
        self, genetic_materials: List[AgentGeneticMaterial]
    ) -> StructuredKnowledge:
        """Combine structured knowledge from multiple genetic materials."""
        all_categories = set()
        all_concepts = []
        all_reasoning_patterns = []
        all_strategies = []
        all_domain_knowledge = {}

        for material in genetic_materials:
            # Combine categories
            all_categories.update(material.structured_knowledge.categories)

            # Combine concepts (avoid duplicates)
            for concept in material.structured_knowledge.concepts:
                if not any(c["id"] == concept["id"] for c in all_concepts):
                    all_concepts.append(concept)

            # Combine reasoning patterns
            for pattern in material.structured_knowledge.reasoning_patterns:
                if not any(p["id"] == pattern["id"] for p in all_reasoning_patterns):
                    all_reasoning_patterns.append(pattern)

            # Combine strategies
            for strategy in material.structured_knowledge.strategies:
                if not any(s["id"] == strategy["id"] for s in all_strategies):
                    all_strategies.append(strategy)

            # Combine domain knowledge
            for (
                domain,
                knowledge,
            ) in material.structured_knowledge.domain_knowledge.items():
                if domain not in all_domain_knowledge:
                    all_domain_knowledge[domain] = knowledge
                else:
                    # Merge domain knowledge
                    existing = all_domain_knowledge[domain]
                    existing["confidence"] = (
                        existing["confidence"] + knowledge["confidence"]
                    ) / 2

        # Calculate combined confidence scores
        combined_confidence = {}
        for material in genetic_materials:
            for key, value in material.structured_knowledge.confidence_scores.items():
                if key not in combined_confidence:
                    combined_confidence[key] = []
                combined_confidence[key].append(value)

        # Average confidence scores
        for key in combined_confidence:
            combined_confidence[key] = sum(combined_confidence[key]) / len(
                combined_confidence[key]
            )

        return StructuredKnowledge(
            categories=list(all_categories),
            concepts=all_concepts,
            reasoning_patterns=all_reasoning_patterns,
            strategies=all_strategies,
            domain_knowledge=all_domain_knowledge,
            confidence_scores=combined_confidence,
        )

    def _aggregate_subliminal_traits(
        self, genetic_materials: List[AgentGeneticMaterial]
    ) -> List[SubliminalTrait]:
        """Aggregate subliminal traits from multiple genetic materials."""
        trait_aggregates = {}

        for material in genetic_materials:
            for trait in material.subliminal_traits:
                if trait.name not in trait_aggregates:
                    trait_aggregates[trait.name] = {
                        "strengths": [],
                        "confidences": [],
                        "manifestations": [],
                        "category": trait.category,
                    }

                trait_aggregates[trait.name]["strengths"].append(trait.strength)
                trait_aggregates[trait.name]["confidences"].append(trait.confidence)
                trait_aggregates[trait.name]["manifestations"].append(
                    trait.manifestation
                )

        # Create aggregated traits
        aggregated_traits = []
        for trait_name, data in trait_aggregates.items():
            avg_strength = sum(data["strengths"]) / len(data["strengths"])
            avg_confidence = sum(data["confidences"]) / len(data["confidences"])
            combined_manifestation = "; ".join(
                data["manifestations"][:3]
            )  # Limit to 3 manifestations

            aggregated_trait = SubliminalTrait(
                id=f"aggregated_{trait_name}",
                name=trait_name,
                strength=avg_strength,
                category=data["category"],
                manifestation=combined_manifestation,
                confidence=avg_confidence,
            )

            aggregated_traits.append(aggregated_trait)

        return aggregated_traits

    def _combine_relevance_scores(
        self, genetic_materials: List[AgentGeneticMaterial]
    ) -> Dict[str, float]:
        """Combine relevance scores from multiple genetic materials."""
        combined_scores = {}

        for material in genetic_materials:
            for domain, score in material.relevance_scores.items():
                if domain not in combined_scores:
                    combined_scores[domain] = []
                combined_scores[domain].append(score)

        # Average relevance scores
        for domain in combined_scores:
            combined_scores[domain] = sum(combined_scores[domain]) / len(
                combined_scores[domain]
            )

        return combined_scores

    def _calculate_distillation_quality(
        self, genetic_materials: List[AgentGeneticMaterial]
    ) -> float:
        """Calculate the quality of knowledge distillation."""
        if not genetic_materials:
            return 0.0

        # Quality factors
        diversity_score = len(
            set(material.agent_id for material in genetic_materials)
        ) / len(genetic_materials)
        fitness_score = sum(
            material.fitness_score for material in genetic_materials
        ) / len(genetic_materials)
        trait_richness = sum(
            len(material.subliminal_traits) for material in genetic_materials
        ) / len(genetic_materials)

        # Combine quality factors
        quality = diversity_score * 0.3 + fitness_score * 0.4 + trait_richness * 0.3

        return min(1.0, quality)
