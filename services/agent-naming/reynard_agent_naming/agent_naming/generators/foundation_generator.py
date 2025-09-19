"""
Foundation Style Name Generator
==============================

Generates Foundation-style names inspired by Asimov's Foundation series.
Creates strategic, intellectual, and leadership-focused names with
unique patterns that reflect the Foundation's approach to psychohistory
and strategic planning.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class FoundationGenerator:
    """Generates Foundation-style names with strategic and intellectual themes."""

    def __init__(self) -> None:
        """Initialize the Foundation generator."""
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()
        self._load_foundation_data()

    def _load_foundation_data(self) -> None:
        """Load Foundation-specific naming data."""
        # Strategic and intellectual titles
        self.strategic_titles = [
            "Prime", "Sage", "Oracle", "Prophet", "Architect", "Strategist", "Analyst",
            "Coordinator", "Director", "Commander", "Advisor", "Counselor", "Planner",
            "Designer", "Engineer", "Scientist", "Scholar", "Philosopher", "Theorist",
            "Visionary", "Master", "Grandmaster", "Elder", "Wise", "Keeper", "Guardian",
            "Custodian", "Steward", "Overseer", "Supervisor", "Manager", "Administrator",
            "Executive", "Leader", "Chief", "Head", "Principal", "Director", "Governor",
            "Psychohistorian", "Mathematician", "Statistician", "Predictor", "Calculator",
            "Forecaster", "Projector", "Simulator", "Modeler", "Computationalist",
            "Data-Analyst", "Trend-Reader", "Pattern-Recognizer", "Crisis-Manager",
            "Plan-Executor", "Deviation-Corrector", "Foundation-Builder", "Empire-Watcher",
            "Galaxy-Mapper", "Sector-Controller", "Planet-Governor", "Station-Commander",
            "Colony-Leader", "Settlement-Administrator", "Outpost-Commander", "Base-Controller",
            "Center-Director", "Institute-Head", "Academy-Dean", "University-Chancellor",
            "Library-Keeper", "Archive-Custodian", "Repository-Guardian", "Vault-Keeper",
            "Sanctuary-Protector", "Refuge-Host", "Haven-Guardian", "Bastion-Commander",
            "Fortress-Lord", "Citadel-Master", "Tower-Watcher", "Spire-Guardian",
            "Dome-Controller", "Ring-Commander", "Core-Administrator", "Nexus-Director",
        ]

        # Foundation-specific concepts
        self.foundation_concepts = [
            "Psychohistory", "Foundation", "Empire", "Galaxy", "Sector", "Planet",
            "Station", "Colony", "Settlement", "Outpost", "Base", "Center", "Institute",
            "Academy", "University", "Library", "Archive", "Repository", "Vault",
            "Sanctuary", "Refuge", "Haven", "Bastion", "Fortress", "Citadel",
            "Seldon-Plan", "Crisis", "Deviation", "Correction", "Prediction", "Calculation",
            "Simulation", "Model", "Equation", "Formula", "Theorem", "Axiom", "Postulate",
            "Hypothesis", "Theory", "Law", "Principle", "Constant", "Variable", "Parameter",
            "Trantor", "Terminus", "Second-Foundation", "Mule", "Genetic-Dynasty",
            "Brother-Day", "Brother-Dusk", "Brother-Dawn", "Cleon", "Demerzel",
            "Vault-Message", "Seldon-Crisis", "Plan-Deviation", "Psychohistorical-Equation",
            "Galactic-Empire", "Dark-Age", "Renaissance", "Rebirth", "Restoration",
            "Reconstruction", "Reformation", "Revolution", "Evolution", "Transformation",
            "Metamorphosis", "Transcendence", "Ascension", "Enlightenment", "Wisdom",
            "Knowledge", "Science", "Mathematics", "Statistics", "Probability", "Certainty",
            "Determinism", "Free-Will", "Destiny", "Fate", "Chance", "Randomness",
            "Order", "Chaos", "Stability", "Instability", "Equilibrium", "Disequilibrium",
            "Balance", "Imbalance", "Harmony", "Discord", "Unity", "Division",
            "Cooperation", "Conflict", "Peace", "War", "Diplomacy", "Strategy",
            "Tactics", "Planning", "Execution", "Implementation", "Realization",
        ]

        # Mathematical and scientific terms
        self.mathematical_terms = [
            "Prime", "Factor", "Matrix", "Vector", "Scalar", "Tensor", "Function",
            "Equation", "Formula", "Theorem", "Proof", "Axiom", "Postulate", "Lemma",
            "Corollary", "Conjecture", "Hypothesis", "Theory", "Law", "Principle",
            "Constant", "Variable", "Parameter", "Coefficient", "Exponent", "Logarithm",
            "Derivative", "Integral", "Limit", "Series", "Sequence", "Convergence",
            "Divergence", "Probability", "Statistics", "Mean", "Median", "Mode",
            "Variance", "Deviation", "Correlation", "Regression", "Distribution",
            "Normal", "Binomial", "Poisson", "Gaussian", "Bell-Curve", "Standard",
            "Confidence", "Significance", "Hypothesis-Test", "Chi-Square", "T-Test",
            "F-Test", "ANOVA", "Regression-Analysis", "Time-Series", "Forecasting",
            "Prediction", "Simulation", "Monte-Carlo", "Markov-Chain", "Bayesian",
            "Frequentist", "Maximum-Likelihood", "Least-Squares", "Optimization",
            "Minimization", "Maximization", "Gradient", "Hessian", "Jacobian",
            "Eigenvalue", "Eigenvector", "Determinant", "Trace", "Rank", "Null-Space",
            "Column-Space", "Row-Space", "Orthogonal", "Orthonormal", "Basis",
            "Dimension", "Span", "Linear-Combination", "Linear-Transformation",
            "Isomorphism", "Homomorphism", "Automorphism", "Endomorphism",
        ]

        # Historical and cultural references
        self.historical_references = [
            "Hari", "Seldon", "Gaal", "Salvor", "Hardin", "Mallow", "Devers",
            "Barr", "Pritcher", "Channis", "Munn", "Jorane", "Sutt", "Anthor",
            "Pelleas", "Darell", "Arcadia", "Bayta", "Toran", "Ebling", "Magnifico",
            "Bel", "Riose", "Brodrig", "Cleon", "Dagobert", "Manella", "Wanda",
            "Dornick", "Demerzel", "Mule", "Magnifico", "Preem", "Palver", "Gendibal",
            "Novi", "Compor", "Trevize", "Pelorat", "Bliss", "Fallom", "Bander",
            "Sunny", "Bander", "Fallom", "Bliss", "Pelorat", "Trevize", "Compor",
            "Gendibal", "Novi", "Preem", "Palver", "Magnifico", "Mule", "Demerzel",
            "Dornick", "Wanda", "Manella", "Dagobert", "Cleon", "Brodrig", "Riose",
            "Bel", "Magnifico", "Ebling", "Toran", "Bayta", "Arcadia", "Darell",
            "Pelleas", "Anthor", "Sutt", "Jorane", "Munn", "Channis", "Pritcher",
            "Barr", "Devers", "Mallow", "Hardin", "Salvor", "Gaal", "Seldon", "Hari",
            "Brother-Day", "Brother-Dusk", "Brother-Dawn", "Genetic-Dynasty",
            "Second-Foundation", "First-Foundation", "Foundation-Encyclopedia",
            "Encyclopedia-Galactica", "Vault", "Seldon-Crisis", "Plan-Deviation",
            "Psychohistorical-Equation", "Galactic-Empire", "Trantor", "Terminus",
            "Anacreon", "Korell", "Smyrno", "Daribow", "Lingane", "Siwenna",
            "Neotrantor", "Kalgan", "Radole", "Askone", "Rossem", "Florina",
            "Sark", "Trantor", "Helicon", "Synnax", "Wencory", "Cinna", "Smyrno",
            "Korell", "Anacreon", "Daribow", "Lingane", "Siwenna", "Neotrantor",
            "Kalgan", "Radole", "Askone", "Rossem", "Florina", "Sark", "Helicon",
            "Synnax", "Wencory", "Cinna", "Smyrno", "Korell", "Anacreon",
        ]

        # Generation numbers with Foundation significance
        self.foundation_numbers = [
            1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987,  # Fibonacci
            2, 4, 8, 16, 32, 64, 128, 256, 512, 1024,  # Powers of 2
            3, 9, 27, 81, 243, 729, 2187,  # Powers of 3
            5, 25, 125, 625, 3125,  # Powers of 5
            7, 49, 343, 2401,  # Powers of 7
            11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,  # Primes
            1000, 10000, 100000, 1000000,  # Powers of 10
            12, 24, 36, 48, 60, 72, 84, 96, 108, 120,  # Multiples of 12 (time cycles)
            30, 60, 90, 120, 150, 180, 210, 240, 270, 300,  # Multiples of 30 (years)
            365, 730, 1095, 1460, 1825, 2190, 2555, 2920,  # Multiples of 365 (days)
            100, 200, 300, 400, 500, 600, 700, 800, 900,  # Centuries
            1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,  # Millennia
            42, 69, 1337, 2024, 2025,  # Special numbers
        ]

        # Additional Foundation-specific categories
        self.psychohistorical_terms = [
            "Psychohistory", "Seldon-Plan", "Crisis", "Deviation", "Correction",
            "Prediction", "Calculation", "Simulation", "Model", "Equation",
            "Formula", "Theorem", "Axiom", "Postulate", "Hypothesis", "Theory",
            "Law", "Principle", "Constant", "Variable", "Parameter", "Coefficient",
            "Exponent", "Logarithm", "Derivative", "Integral", "Limit", "Series",
            "Sequence", "Convergence", "Divergence", "Probability", "Statistics",
            "Mean", "Median", "Mode", "Variance", "Deviation", "Correlation",
            "Regression", "Distribution", "Normal", "Binomial", "Poisson",
            "Gaussian", "Bell-Curve", "Standard", "Confidence", "Significance",
            "Hypothesis-Test", "Chi-Square", "T-Test", "F-Test", "ANOVA",
            "Regression-Analysis", "Time-Series", "Forecasting", "Prediction",
            "Simulation", "Monte-Carlo", "Markov-Chain", "Bayesian", "Frequentist",
            "Maximum-Likelihood", "Least-Squares", "Optimization", "Minimization",
            "Maximization", "Gradient", "Hessian", "Jacobian", "Eigenvalue",
            "Eigenvector", "Determinant", "Trace", "Rank", "Null-Space",
            "Column-Space", "Row-Space", "Orthogonal", "Orthonormal", "Basis",
            "Dimension", "Span", "Linear-Combination", "Linear-Transformation",
            "Isomorphism", "Homomorphism", "Automorphism", "Endomorphism",
        ]


    def generate_foundation_name(
        self, spirit: AnimalSpirit | None = None, use_spirit: bool = True
    ) -> AgentName:
        """Generate a Foundation-style name."""
        if use_spirit and spirit:
            return self._generate_spirit_foundation_name(spirit)
        return self._generate_pure_foundation_name()

    def _generate_spirit_foundation_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Foundation name with animal spirit integration."""
        # Use spirit name as base - expanded for all animal spirits
        spirit_names = {
            "fox": ["Vulpine", "Reynard", "Kitsune", "Sly", "Cunning", "Swift"],
            "wolf": ["Lupus", "Fenrir", "Alpha", "Hunter", "Pack", "Fierce"],
            "otter": ["Lutra", "Aqua", "Playful", "Graceful", "Sleek", "Fluid"],
            "dragon": ["Draco", "Wyrm", "Ancient", "Elder", "Primordial", "Mighty"],
            "phoenix": ["Phoenix", "Firebird", "Rebirth", "Renewal", "Eternal", "Radiant"],
            "eagle": ["Aquila", "Golden", "Soaring", "Majestic", "Noble", "Regal"],
            "lion": ["Leo", "King", "Mane", "Pride", "Royal", "Imperial"],
            "tiger": ["Tigris", "Bengal", "Siberian", "Striped", "Fierce", "Powerful"],
            "bear": ["Ursa", "Grizzly", "Polar", "Mountain", "Forest", "Wild"],
            "rabbit": ["Lepus", "Swift", "Agile", "Quick", "Bounding", "Fleet"],
            "owl": ["Strix", "Wise", "Nocturnal", "Sage", "Watching", "Silent"],
            "raven": ["Corvus", "Dark", "Mysterious", "Clever", "Wise", "Ancient"],
            "shark": ["Carcharodon", "Ocean", "Predator", "Swift", "Fierce", "Deep"],
            "penguin": ["Spheniscus", "Antarctic", "Waddle", "Ice", "Colony", "Graceful"],
            "elephant": ["Elephas", "Memory", "Wise", "Gentle", "Giant", "Noble"],
            "giraffe": ["Giraffa", "Tall", "Graceful", "Reaching", "Gentle", "Majestic"],
            "zebra": ["Equus", "Striped", "Wild", "Running", "Free", "Pattern"],
            "cheetah": ["Acinonyx", "Speed", "Swift", "Hunting", "Graceful", "Fast"],
            "panther": ["Panthera", "Shadow", "Stealth", "Dark", "Powerful", "Silent"],
            "lynx": ["Lynx", "Wild", "Mountain", "Fierce", "Independent", "Sharp"],
            "bobcat": ["Lynx", "Wild", "Forest", "Fierce", "Independent", "Sharp"],
            "coyote": ["Canis", "Trickster", "Wild", "Clever", "Adaptable", "Survivor"],
            "hyena": ["Crocuta", "Laughing", "Pack", "Fierce", "Clever", "Wild"],
            "jaguar": ["Panthera", "Jungle", "Powerful", "Stealth", "Fierce", "Wild"],
            "leopard": ["Panthera", "Spotted", "Stealth", "Fierce", "Wild", "Graceful"],
            "cougar": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
            "puma": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
            "mountain_lion": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
            "snow_leopard": ["Panthera", "Snow", "Mountain", "Stealth", "Fierce", "Wild"],
            "clouded_leopard": ["Neofelis", "Clouded", "Stealth", "Fierce", "Wild", "Mysterious"],
            "margay": ["Leopardus", "Tree", "Agile", "Climbing", "Wild", "Graceful"],
            "ocelot": ["Leopardus", "Spotted", "Wild", "Fierce", "Independent", "Graceful"],
            "serval": ["Leptailurus", "Tall", "Wild", "Fierce", "Independent", "Graceful"],
            "caracal": ["Caracal", "Ears", "Wild", "Fierce", "Independent", "Graceful"],
            "sand_cat": ["Felis", "Desert", "Wild", "Fierce", "Independent", "Survivor"],
            "black_footed_cat": ["Felis", "Small", "Wild", "Fierce", "Independent", "Tiny"],
            "rusty_spotted_cat": ["Prionailurus", "Spotted", "Wild", "Fierce", "Independent", "Small"],
            "pallas_cat": ["Otocolobus", "Manul", "Wild", "Fierce", "Independent", "Fluffy"],
            "manul": ["Otocolobus", "Manul", "Wild", "Fierce", "Independent", "Fluffy"],
            "jungle_cat": ["Felis", "Jungle", "Wild", "Fierce", "Independent", "Adaptable"],
            "chaus": ["Felis", "Jungle", "Wild", "Fierce", "Independent", "Adaptable"],
            "fishing_cat": ["Prionailurus", "Water", "Wild", "Fierce", "Independent", "Swimming"],
            "flat_headed_cat": ["Prionailurus", "Flat", "Wild", "Fierce", "Independent", "Unique"],
            "bornean_bay_cat": ["Catopuma", "Bay", "Wild", "Fierce", "Independent", "Rare"],
            "asian_golden_cat": ["Catopuma", "Golden", "Wild", "Fierce", "Independent", "Beautiful"],
            "african_golden_cat": ["Caracal", "Golden", "Wild", "Fierce", "Independent", "Beautiful"],
            "pampas_cat": ["Leopardus", "Pampas", "Wild", "Fierce", "Independent", "Grassland"],
            "geoffroy_cat": ["Leopardus", "Geoffroy", "Wild", "Fierce", "Independent", "Spotted"],
            "kodkod": ["Leopardus", "Kodkod", "Wild", "Fierce", "Independent", "Small"],
            "oncilla": ["Leopardus", "Oncilla", "Wild", "Fierce", "Independent", "Spotted"],
            "tigrina": ["Leopardus", "Tigrina", "Wild", "Fierce", "Independent", "Striped"],
            "spider": ["Arachnid", "Web", "Silent", "Patient", "Clever", "Stealthy"],
            "star": ["Stellar", "Cosmic", "Bright", "Radiant", "Eternal", "Shining"],
            "alien": ["Xeno", "Otherworldly", "Mysterious", "Advanced", "Strange", "Unknown"],
            "nebula": ["Cosmic", "Cloud", "Mysterious", "Ethereal", "Beautiful", "Vast"],
            "kraken": ["Deep", "Ocean", "Mysterious", "Powerful", "Ancient", "Tentacled"],
            "manticore": ["Mythical", "Lion", "Scorpion", "Fierce", "Ancient", "Legendary"],
            "griffin": ["Mythical", "Eagle", "Lion", "Noble", "Ancient", "Legendary"],
            "peacock": ["Pavo", "Colorful", "Proud", "Beautiful", "Majestic", "Display"],
            "monkey": ["Simian", "Clever", "Agile", "Playful", "Curious", "Intelligent"],
            "whale": ["Cetacean", "Ocean", "Gentle", "Massive", "Wise", "Deep"],
            "octopus": ["Cephalopod", "Eight", "Clever", "Flexible", "Ocean", "Intelligent"],
            "rhino": ["Rhinoceros", "Horn", "Powerful", "Ancient", "Massive", "Wild"],
            "lemur": ["Primate", "Madagascar", "Agile", "Playful", "Curious", "Tree"],
            "unicorn": ["Mythical", "Horn", "Pure", "Magical", "Ancient", "Legendary"],
            "chimera": ["Mythical", "Mixed", "Fierce", "Ancient", "Legendary", "Powerful"],
            "frog": ["Anura", "Amphibian", "Leaping", "Water", "Green", "Croaking"],
            "pangolin": ["Manis", "Scaly", "Armored", "Anteater", "Unique", "Ancient"],
            "loch_ness": ["Nessie", "Mysterious", "Deep", "Ancient", "Legendary", "Water"],
            "wendigo": ["Mythical", "Winter", "Fierce", "Ancient", "Legendary", "Wild"],
            "platypus": ["Ornithorhynchus", "Duck", "Bill", "Unique", "Water", "Mysterious"],
            "capybara": ["Hydrochoerus", "Water", "Pig", "Gentle", "Large", "Social"],
            "dolphin": ["Delphinus", "Ocean", "Intelligent", "Playful", "Social", "Wise"],
            "skinwalker": ["Mythical", "Shape", "Shifter", "Mysterious", "Ancient", "Legendary"],
            "kiwi": ["Apteryx", "Flightless", "Nocturnal", "Unique", "New", "Zealand"],
            "flamingo": ["Phoenicopterus", "Pink", "Graceful", "Water", "Elegant", "Standing"],
            "narwhal": ["Monodon", "Unicorn", "Whale", "Arctic", "Tusked", "Mysterious"],
            "aye": ["Aye", "Aye", "Nocturnal", "Primate", "Madagascar", "Lemur"],
            "dragonfly": ["Odonata", "Winged", "Swift", "Flying", "Graceful", "Ancient"],
            "snake": ["Serpens", "Slithering", "Sinuous", "Wise", "Ancient", "Mysterious"],
            "ape": ["Simian", "Primate", "Intelligent", "Clever", "Strong", "Wise"],
            "blackhole": ["Cosmic", "Void", "Gravitational", "Mysterious", "Powerful", "Infinite"],
            "jackal": ["Canis", "Wild", "Clever", "Adaptable", "Survivor", "Pack"],
            "quokka": ["Setonix", "Smiling", "Happy", "Marsupial", "Australia", "Cute"],
            "hydra": ["Mythical", "Multi", "Headed", "Ancient", "Legendary", "Regenerating"],
            "basilisk": ["Mythical", "Serpent", "King", "Ancient", "Legendary", "Deadly"],
            "yeti": ["Mythical", "Snow", "Man", "Mountain", "Ancient", "Legendary"],
            "lizard": ["Lacerta", "Scaly", "Reptile", "Quick", "Agile", "Ancient"],
            "toucan": ["Ramphastos", "Colorful", "Beak", "Tropical", "Bright", "Vibrant"],
            "falcon": ["Falco", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
            "void": ["Empty", "Nothing", "Void", "Mysterious", "Infinite", "Dark"],
            "chupacabra": ["Mythical", "Goat", "Sucker", "Mysterious", "Legendary", "Cryptid"],
            "mantis": ["Mantis", "Praying", "Insect", "Patient", "Stealthy", "Predator"],
            "sphinx": ["Mythical", "Riddle", "Wise", "Ancient", "Legendary", "Mysterious"],
            "turtle": ["Testudo", "Shell", "Ancient", "Wise", "Slow", "Patient"],
            "bee": ["Apis", "Honey", "Worker", "Busy", "Swarm", "Industrious"],
            "panda": ["Ailuropoda", "Bamboo", "Gentle", "Black", "White", "Cute"],
            "hawk": ["Accipiter", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
        }

        # Choose between different spirit-based patterns
        pattern = random.choice([1, 2, 3, 4])  # nosec B311

        spirit_key = spirit.value
        base_name = self.selector.select_with_fallback(
            spirit_names.get(spirit_key, ["Foundation"]), "Foundation"
        )

        if pattern == 1:
            # Pattern: [Spirit] + [Title] + [Number]
            title = self.selector.select_with_fallback(self.strategic_titles, "Prime")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, title, number])
            components = [base_name, title, str(number)]
        elif pattern == 2:
            # Pattern: [Spirit] + [Mathematical] + [Number]
            mathematical = self.selector.select_with_fallback(self.mathematical_terms, "Prime")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, mathematical, number])
            components = [base_name, mathematical, str(number)]
        elif pattern == 3:
            # Pattern: [Spirit] + [Historical] + [Number]
            historical = self.selector.select_with_fallback(self.historical_references, "Seldon")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, historical, number])
            components = [base_name, historical, str(number)]
        else:
            # Pattern: [Spirit] + [Psychohistorical] + [Number]
            psychohistorical = self.selector.select_with_fallback(self.psychohistorical_terms, "Psychohistory")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([base_name, psychohistorical, number])
            components = [base_name, psychohistorical, str(number)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.FOUNDATION,
            components=components,
            generation_number=number,
        )

    def _generate_pure_foundation_name(self) -> AgentName:
        """Generate pure Foundation name without animal spirit."""
        # Choose between different Foundation naming patterns
        pattern = random.choice([1, 2, 3, 4, 5, 6])  # nosec B311

        if pattern == 1:
            # Pattern: [Historical] + [Title] + [Number]
            historical = self.selector.select_with_fallback(self.historical_references, "Seldon")
            title = self.selector.select_with_fallback(self.strategic_titles, "Prime")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([historical, title, number])
            components = [historical, title, str(number)]
        elif pattern == 2:
            # Pattern: [Concept] + [Mathematical] + [Number]
            concept = self.selector.select_with_fallback(self.foundation_concepts, "Foundation")
            mathematical = self.selector.select_with_fallback(self.mathematical_terms, "Prime")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([concept, mathematical, number])
            components = [concept, mathematical, str(number)]
        elif pattern == 3:
            # Pattern: [Title] + [Concept] + [Number]
            title = self.selector.select_with_fallback(self.strategic_titles, "Prime")
            concept = self.selector.select_with_fallback(self.foundation_concepts, "Foundation")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([title, concept, number])
            components = [title, concept, str(number)]
        elif pattern == 4:
            # Pattern: [Mathematical] + [Title] + [Number]
            mathematical = self.selector.select_with_fallback(self.mathematical_terms, "Prime")
            title = self.selector.select_with_fallback(self.strategic_titles, "Sage")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([mathematical, title, number])
            components = [mathematical, title, str(number)]
        elif pattern == 5:
            # Pattern: [Psychohistorical] + [Title] + [Number]
            psychohistorical = self.selector.select_with_fallback(self.psychohistorical_terms, "Psychohistory")
            title = self.selector.select_with_fallback(self.strategic_titles, "Psychohistorian")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([psychohistorical, title, number])
            components = [psychohistorical, title, str(number)]
        else:
            # Pattern: [Historical] + [Psychohistorical] + [Number]
            historical = self.selector.select_with_fallback(self.historical_references, "Seldon")
            psychohistorical = self.selector.select_with_fallback(self.psychohistorical_terms, "Psychohistory")
            number = self.selector.select_with_fallback(self.foundation_numbers, 1)
            name = self.name_builder.build_hyphenated_name([historical, psychohistorical, number])
            components = [historical, psychohistorical, str(number)]

        return AgentName(
            name=name,
            spirit=None,
            style=NamingStyle.FOUNDATION,
            components=components,
            generation_number=number if 'number' in locals() else 1,
        )

    def generate_foundation_batch(self, count: int = 5) -> list[AgentName]:
        """Generate a batch of Foundation names with variety."""
        names = []
        for i in range(count):
            # Alternate between spirit and pure Foundation names
            use_spirit = i % 2 == 0
            if use_spirit:
                spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311
                name = self.generate_foundation_name(spirit, use_spirit=True)
            else:
                name = self.generate_foundation_name(use_spirit=False)
            names.append(name)
        return names
