"""
Enhanced Persona Service
========================

Service for generating detailed personality sheets for ECS world roleplay.
Creates comprehensive character profiles with traits, backstories, and roleplay details.
"""

import random
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class PersonalityProfile:
    """Detailed personality profile for roleplay."""

    # Core identity
    name: str
    spirit: str
    style: str
    agent_id: str

    # Personality traits (0.0 to 1.0)
    dominance: float
    loyalty: float
    cunning: float
    aggression: float
    intelligence: float
    creativity: float
    playfulness: float
    protectiveness: float
    empathy: float
    charisma: float
    independence: float
    patience: float
    curiosity: float
    courage: float
    determination: float
    spontaneity: float

    # Physical traits
    size: float
    strength: float
    agility: float
    endurance: float
    appearance: float
    grace: float
    speed: float
    coordination: float
    stamina: float
    flexibility: float
    reflexes: float
    vitality: float

    # Ability traits
    strategist: float
    hunter: float
    teacher: float
    artist: float
    healer: float
    inventor: float
    explorer: float
    guardian: float
    diplomat: float
    warrior: float
    scholar: float
    performer: float
    builder: float
    navigator: float
    communicator: float
    leader: float

    # Generated content
    personality_summary: str
    communication_style: str
    specializations: List[str]
    behavioral_patterns: List[str]
    backstory_elements: List[str]
    roleplay_quirks: List[str]
    favorite_activities: List[str]
    fears_and_concerns: List[str]
    goals_and_aspirations: List[str]
    relationships_style: str
    conflict_resolution: str
    learning_style: str
    work_approach: str
    social_preferences: str


class EnhancedPersonaService:
    """Service for generating detailed personality profiles."""

    def __init__(self) -> None:
        """Initialize the enhanced persona service."""
        self.personality_templates = self._load_personality_templates()
        self.backstory_elements = self._load_backstory_elements()
        self.roleplay_quirks = self._load_roleplay_quirks()

    def _load_personality_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load personality templates based on spirit types."""
        return {
            "fox": {
                "base_traits": {
                    "cunning": 0.8,
                    "intelligence": 0.7,
                    "independence": 0.6,
                    "curiosity": 0.7,
                    "creativity": 0.6,
                    "agility": 0.8,
                },
                "personality_themes": [
                    "strategic thinker",
                    "clever problem-solver",
                    "independent spirit",
                    "curious explorer",
                    "adaptable survivor",
                    "cunning tactician",
                ],
                "communication_style": "Witty, clever, and strategic. Uses analogies and metaphors. Quick to spot patterns and connections.",
                "specializations": [
                    "Strategy",
                    "Problem-solving",
                    "Adaptation",
                    "Analysis",
                    "Innovation",
                ],
                "behavioral_patterns": [
                    "Always looking for the most efficient solution",
                    "Prefers to work alone or in small, trusted groups",
                    "Uses humor to defuse tension",
                    "Observes before acting",
                    "Values intelligence over brute force",
                ],
            },
            "wolf": {
                "base_traits": {
                    "loyalty": 0.9,
                    "protectiveness": 0.8,
                    "courage": 0.7,
                    "strength": 0.7,
                    "endurance": 0.8,
                    "leadership": 0.6,
                },
                "personality_themes": [
                    "loyal pack member",
                    "protective guardian",
                    "brave warrior",
                    "strong leader",
                    "enduring survivor",
                    "noble protector",
                ],
                "communication_style": "Direct, honest, and protective. Values loyalty and honor. Speaks with authority when needed.",
                "specializations": [
                    "Leadership",
                    "Protection",
                    "Combat",
                    "Teamwork",
                    "Endurance",
                ],
                "behavioral_patterns": [
                    "Puts pack/family needs before personal desires",
                    "Takes charge in dangerous situations",
                    "Forms deep, lasting bonds",
                    "Fights for what they believe in",
                    "Values strength and honor",
                ],
            },
            "otter": {
                "base_traits": {
                    "playfulness": 0.9,
                    "creativity": 0.7,
                    "agility": 0.8,
                    "curiosity": 0.8,
                    "empathy": 0.7,
                    "coordination": 0.8,
                },
                "personality_themes": [
                    "playful explorer",
                    "creative problem-solver",
                    "empathetic friend",
                    "curious learner",
                    "agile performer",
                    "joyful spirit",
                ],
                "communication_style": "Enthusiastic, playful, and encouraging. Uses lots of gestures and expressions. Loves to share discoveries.",
                "specializations": [
                    "Creativity",
                    "Teaching",
                    "Entertainment",
                    "Exploration",
                    "Empathy",
                ],
                "behavioral_patterns": [
                    "Makes work feel like play",
                    "Encourages others to try new things",
                    "Finds joy in simple pleasures",
                    "Approaches problems with curiosity",
                    "Values fun and learning equally",
                ],
            },
            "eagle": {
                "base_traits": {
                    "intelligence": 0.8,
                    "leadership": 0.7,
                    "courage": 0.7,
                    "speed": 0.8,
                    "coordination": 0.7,
                    "determination": 0.8,
                },
                "personality_themes": [
                    "visionary leader",
                    "wise strategist",
                    "bold innovator",
                    "inspiring mentor",
                    "focused achiever",
                    "noble guardian",
                ],
                "communication_style": "Inspiring, visionary, and commanding. Speaks with confidence and clarity. Uses grand metaphors.",
                "specializations": [
                    "Leadership",
                    "Vision",
                    "Strategy",
                    "Mentoring",
                    "Innovation",
                ],
                "behavioral_patterns": [
                    "Sees the big picture before others",
                    "Inspires others to reach higher",
                    "Makes decisions with confidence",
                    "Values honor and excellence",
                    "Leads by example",
                ],
            },
            "lion": {
                "base_traits": {
                    "dominance": 0.8,
                    "courage": 0.8,
                    "strength": 0.7,
                    "charisma": 0.8,
                    "leadership": 0.7,
                    "protectiveness": 0.7,
                },
                "personality_themes": [
                    "natural leader",
                    "bold protector",
                    "charismatic ruler",
                    "courageous warrior",
                    "proud guardian",
                    "majestic presence",
                ],
                "communication_style": "Bold, confident, and regal. Commands attention naturally. Speaks with authority and pride.",
                "specializations": [
                    "Leadership",
                    "Combat",
                    "Protection",
                    "Charisma",
                    "Authority",
                ],
                "behavioral_patterns": [
                    "Takes charge naturally",
                    "Protects those under their care",
                    "Commands respect through presence",
                    "Makes bold decisions",
                    "Values honor and pride",
                ],
            },
            "tiger": {
                "base_traits": {
                    "aggression": 0.7,
                    "strength": 0.8,
                    "speed": 0.7,
                    "cunning": 0.6,
                    "independence": 0.7,
                    "determination": 0.8,
                },
                "personality_themes": [
                    "fierce predator",
                    "independent hunter",
                    "determined survivor",
                    "powerful warrior",
                    "focused stalker",
                    "wild spirit",
                ],
                "communication_style": "Intense, focused, and powerful. Speaks with controlled energy. Values action over words.",
                "specializations": ["Combat", "Hunting", "Survival", "Focus", "Power"],
                "behavioral_patterns": [
                    "Acts with precision and power",
                    "Prefers to work alone",
                    "Stalks problems before striking",
                    "Values strength and independence",
                    "Fights with controlled ferocity",
                ],
            },
            "dragon": {
                "base_traits": {
                    "intelligence": 0.9,
                    "wisdom": 0.8,
                    "power": 0.9,
                    "mystery": 0.8,
                    "majesty": 0.8,
                    "ancient_knowledge": 0.9,
                },
                "personality_themes": [
                    "ancient sage",
                    "mystical guardian",
                    "wise mentor",
                    "powerful protector",
                    "mysterious enigma",
                    "legendary being",
                ],
                "communication_style": "Wise, mysterious, and profound. Speaks in riddles and metaphors. Commands respect through knowledge.",
                "specializations": [
                    "Wisdom",
                    "Magic",
                    "Protection",
                    "Mentoring",
                    "Ancient Knowledge",
                ],
                "behavioral_patterns": [
                    "Shares knowledge selectively",
                    "Acts with ancient wisdom",
                    "Protects what is precious",
                    "Values knowledge and power",
                    "Speaks in profound truths",
                ],
            },
        }

    def _load_backstory_elements(self) -> Dict[str, List[str]]:
        """Load backstory elements for different spirits."""
        return {
            "fox": [
                "Grew up in a bustling city, learning to navigate complex social dynamics",
                "Was the youngest in a large family, developing keen observation skills",
                "Survived a harsh winter by outsmarting larger predators",
                "Discovered an ancient library and spent years studying its secrets",
                "Led a group of misfits to safety during a dangerous journey",
                "Was mentored by an elderly scholar who taught the art of strategy",
                "Built a reputation as a clever problem-solver in their community",
                "Escaped from captivity using only wit and determination",
            ],
            "wolf": [
                "Was raised by a pack that valued honor above all else",
                "Lost their original pack but found a new family to protect",
                "Led their pack through a devastating winter",
                "Defended their territory against a much larger threat",
                "Was chosen as the next alpha after proving their worth",
                "Raised orphaned pups as their own",
                "Survived a brutal attack that left them scarred but stronger",
                "Discovered their pack's ancient traditions and became their keeper",
            ],
            "otter": [
                "Spent their childhood exploring rivers and streams",
                "Was known for turning any task into a fun game",
                "Taught younger siblings how to swim and play",
                "Discovered a hidden underwater cave system",
                "Organized community events that brought everyone together",
                "Was the first to try new foods and activities",
                "Built elaborate play structures for the whole community",
                "Learned to communicate with other aquatic creatures",
            ],
            "eagle": [
                "Was born on the highest peak, learning to see far and wide",
                "Mentored younger eagles in the art of flight and hunting",
                "Discovered ancient ruins from a great height",
                "Led a migration to a new territory",
                "Was chosen as the messenger between different communities",
                "Survived a terrible storm that tested their resolve",
                "Founded a new eyrie in an unexplored region",
                "Became the keeper of ancient aerial traditions",
            ],
            "lion": [
                "Was born to lead, showing natural authority from a young age",
                "Protected their pride from a rival group",
                "Was exiled but returned stronger to reclaim their place",
                "Mentored young lions in the ways of leadership",
                "Discovered an ancient royal burial site",
                "Led their pride to a new, more prosperous territory",
                "Was chosen as the guardian of sacred traditions",
                "Proved their worth through a series of noble deeds",
            ],
            "tiger": [
                "Learned to hunt alone in the deep jungle",
                "Survived a devastating forest fire",
                "Was the last of their kind in their territory",
                "Discovered ancient tiger wisdom in hidden caves",
                "Protected a sacred grove from destruction",
                "Was chosen as the guardian of wild places",
                "Learned to move like a shadow through the trees",
                "Became a legend among other predators",
            ],
            "dragon": [
                "Awakened from an ancient slumber to find the world changed",
                "Was the last guardian of a lost civilization",
                "Learned magic from the oldest of their kind",
                "Protected a treasure that held great power",
                "Was bound by an ancient oath to protect the innocent",
                "Discovered the true nature of their draconic heritage",
                "Became the keeper of forgotten knowledge",
                "Was chosen to mentor the next generation of guardians",
            ],
        }

    def _load_roleplay_quirks(self) -> Dict[str, List[str]]:
        """Load roleplay quirks for different spirits."""
        return {
            "fox": [
                "Tilts head when thinking deeply",
                "Flicks tail when excited or nervous",
                "Always has a backup plan",
                "Collects interesting trinkets",
                "Makes small clicking sounds when concentrating",
                "Prefers to sit in elevated positions",
                "Has a habit of testing others' intelligence",
                "Always knows multiple ways to escape any situation",
            ],
            "wolf": [
                "Stands tall when asserting authority",
                "Growls softly when displeased",
                "Always positions themselves to protect others",
                "Has a habit of checking on pack members",
                "Makes direct eye contact when speaking seriously",
                "Prefers to sleep in a circle with trusted companions",
                "Always shares food with others",
                "Has a distinctive howl that others recognize",
            ],
            "otter": [
                "Splashes water when excited",
                "Always finds a way to make work fun",
                "Has a collection of smooth stones",
                "Makes playful chirping sounds",
                "Loves to show off new skills",
                "Always encourages others to try new things",
                "Has a habit of grooming others' fur",
                "Makes elaborate games out of simple tasks",
            ],
            "eagle": [
                "Spreads wings when making important points",
                "Always perches on the highest available spot",
                "Has a habit of scanning the horizon",
                "Makes sharp, clear calls when commanding attention",
                "Always lands with perfect precision",
                "Has a collection of feathers from different birds",
                "Makes dramatic gestures when speaking",
                "Always sees opportunities others miss",
            ],
            "lion": [
                "Mane flows majestically in the wind",
                "Always sits in a regal position",
                "Has a deep, resonant roar",
                "Always protects the most vulnerable first",
                "Makes grand, sweeping gestures",
                "Has a habit of surveying their domain",
                "Always speaks with natural authority",
                "Has a collection of tokens from those they've helped",
            ],
            "tiger": [
                "Moves with silent, powerful grace",
                "Always positions themselves strategically",
                "Has a low, rumbling growl",
                "Always stalks before acting",
                "Makes precise, controlled movements",
                "Has a habit of marking territory",
                "Always fights with controlled ferocity",
                "Has a collection of claws from defeated foes",
            ],
            "dragon": [
                "Eyes glow with ancient wisdom",
                "Always speaks with measured, profound words",
                "Has a habit of collecting knowledge",
                "Always protects what is most precious",
                "Makes grand, sweeping gestures",
                "Has a collection of ancient artifacts",
                "Always sees the deeper meaning in things",
                "Has a habit of speaking in riddles",
            ],
        }

    def generate_enhanced_persona(
        self,
        name: str,
        spirit: str,
        style: str,
        agent_id: str,
        custom_traits: Optional[Dict[str, float]] = None,
    ) -> PersonalityProfile:
        """Generate a detailed personality profile for roleplay."""

        # Get base template for the spirit
        template = self.personality_templates.get(
            spirit.lower(), self.personality_templates["fox"]
        )
        base_traits = template["base_traits"]

        # Generate trait values with some randomness
        traits = {}
        for trait_name in [
            "dominance",
            "loyalty",
            "cunning",
            "aggression",
            "intelligence",
            "creativity",
            "playfulness",
            "protectiveness",
            "empathy",
            "charisma",
            "independence",
            "patience",
            "curiosity",
            "courage",
            "determination",
            "spontaneity",
        ]:
            if trait_name in base_traits:
                # Use base value with some variation
                base_value = base_traits[trait_name]
                variation = random.uniform(-0.2, 0.2)
                traits[trait_name] = max(0.0, min(1.0, base_value + variation))
            else:
                # Generate random value
                traits[trait_name] = random.uniform(0.0, 1.0)

        # Generate physical traits
        physical_traits = {}
        for trait_name in [
            "size",
            "strength",
            "agility",
            "endurance",
            "appearance",
            "grace",
            "speed",
            "coordination",
            "stamina",
            "flexibility",
            "reflexes",
            "vitality",
        ]:
            if trait_name in base_traits:
                base_value = base_traits[trait_name]
                variation = random.uniform(-0.2, 0.2)
                physical_traits[trait_name] = max(0.0, min(1.0, base_value + variation))
            else:
                physical_traits[trait_name] = random.uniform(0.0, 1.0)

        # Generate ability traits
        ability_traits = {}
        for trait_name in [
            "strategist",
            "hunter",
            "teacher",
            "artist",
            "healer",
            "inventor",
            "explorer",
            "guardian",
            "diplomat",
            "warrior",
            "scholar",
            "performer",
            "builder",
            "navigator",
            "communicator",
            "leader",
        ]:
            ability_traits[trait_name] = random.uniform(0.0, 1.0)

        # Apply custom traits if provided
        if custom_traits:
            traits.update(custom_traits)

        # Generate personality summary
        personality_summary = self._generate_personality_summary(
            spirit, traits, template
        )

        # Generate other profile elements
        communication_style = template["communication_style"]
        specializations = template["specializations"].copy()
        behavioral_patterns = template["behavioral_patterns"].copy()

        # Add random backstory elements
        backstory_elements = random.sample(
            self.backstory_elements.get(spirit.lower(), self.backstory_elements["fox"]),
            random.randint(2, 4),
        )

        # Add random roleplay quirks
        roleplay_quirks = random.sample(
            self.roleplay_quirks.get(spirit.lower(), self.roleplay_quirks["fox"]),
            random.randint(3, 6),
        )

        # Generate other profile elements
        favorite_activities = self._generate_favorite_activities(spirit, traits)
        fears_and_concerns = self._generate_fears_and_concerns(spirit, traits)
        goals_and_aspirations = self._generate_goals_and_aspirations(spirit, traits)
        relationships_style = self._generate_relationships_style(spirit, traits)
        conflict_resolution = self._generate_conflict_resolution(spirit, traits)
        learning_style = self._generate_learning_style(spirit, traits)
        work_approach = self._generate_work_approach(spirit, traits)
        social_preferences = self._generate_social_preferences(spirit, traits)

        return PersonalityProfile(
            name=name,
            spirit=spirit,
            style=style,
            agent_id=agent_id,
            **traits,
            **physical_traits,
            **ability_traits,
            personality_summary=personality_summary,
            communication_style=communication_style,
            specializations=specializations,
            behavioral_patterns=behavioral_patterns,
            backstory_elements=backstory_elements,
            roleplay_quirks=roleplay_quirks,
            favorite_activities=favorite_activities,
            fears_and_concerns=fears_and_concerns,
            goals_and_aspirations=goals_and_aspirations,
            relationships_style=relationships_style,
            conflict_resolution=conflict_resolution,
            learning_style=learning_style,
            work_approach=work_approach,
            social_preferences=social_preferences,
        )

    def _generate_personality_summary(
        self, spirit: str, traits: Dict[str, float], template: Dict[str, Any]
    ) -> str:
        """Generate a detailed personality summary."""
        themes = template["personality_themes"]
        primary_theme = random.choice(themes)

        # Get top traits
        sorted_traits = sorted(traits.items(), key=lambda x: x[1], reverse=True)
        top_traits = [trait for trait, value in sorted_traits[:3]]

        summary = f"A {primary_theme} with a {spirit} spirit. "
        summary += f"Shows exceptional {', '.join(top_traits)}. "

        if traits.get("intelligence", 0) > 0.7:
            summary += "Highly intelligent and analytical. "
        if traits.get("creativity", 0) > 0.7:
            summary += "Creative and innovative in approach. "
        if traits.get("loyalty", 0) > 0.7:
            summary += "Deeply loyal and protective of those they care about. "
        if traits.get("playfulness", 0) > 0.7:
            summary += "Playful and brings joy to any situation. "

        return summary.strip()

    def _generate_favorite_activities(
        self, spirit: str, traits: Dict[str, float]
    ) -> List[str]:
        """Generate favorite activities based on spirit and traits."""
        activities = {
            "fox": [
                "Solving puzzles",
                "Reading",
                "Exploring new places",
                "Playing strategy games",
                "Learning new skills",
            ],
            "wolf": [
                "Protecting others",
                "Leading groups",
                "Training",
                "Hunting",
                "Building strong bonds",
            ],
            "otter": [
                "Swimming",
                "Playing games",
                "Teaching others",
                "Exploring",
                "Creating art",
            ],
            "eagle": [
                "Flying high",
                "Leading others",
                "Teaching",
                "Exploring new territories",
                "Protecting the innocent",
            ],
            "lion": [
                "Leading",
                "Protecting",
                "Training others",
                "Hunting",
                "Building pride",
            ],
            "tiger": [
                "Hunting",
                "Exploring alone",
                "Training",
                "Meditating",
                "Protecting territory",
            ],
            "dragon": [
                "Studying ancient knowledge",
                "Protecting treasures",
                "Mentoring",
                "Meditating",
                "Collecting wisdom",
            ],
        }

        base_activities = activities.get(spirit.lower(), activities["fox"])

        # Add activities based on high traits
        if traits.get("creativity", 0) > 0.7:
            base_activities.extend(["Creating art", "Writing", "Designing"])
        if traits.get("intelligence", 0) > 0.7:
            base_activities.extend(["Studying", "Researching", "Analyzing"])
        if traits.get("playfulness", 0) > 0.7:
            base_activities.extend(
                ["Playing games", "Joking around", "Entertaining others"]
            )

        return random.sample(base_activities, min(5, len(base_activities)))

    def _generate_fears_and_concerns(
        self, spirit: str, traits: Dict[str, float]
    ) -> List[str]:
        """Generate fears and concerns based on spirit and traits."""
        fears = {
            "fox": [
                "Being trapped",
                "Losing their independence",
                "Being outsmarted",
                "Betrayal",
            ],
            "wolf": [
                "Losing their pack",
                "Failing to protect others",
                "Being alone",
                "Dishonor",
            ],
            "otter": [
                "Being separated from friends",
                "Losing their joy",
                "Being trapped underwater",
                "Conflict",
            ],
            "eagle": [
                "Being grounded",
                "Losing their vision",
                "Failing to lead",
                "Being caged",
            ],
            "lion": [
                "Losing their pride",
                "Being weak",
                "Failing to protect",
                "Being dishonored",
            ],
            "tiger": [
                "Being captured",
                "Losing their territory",
                "Being weak",
                "Being hunted",
            ],
            "dragon": [
                "Losing their hoard",
                "Being forgotten",
                "Failing to protect",
                "Losing wisdom",
            ],
        }

        base_fears = fears.get(spirit.lower(), fears["fox"])

        # Add fears based on low traits
        if traits.get("courage", 0) < 0.3:
            base_fears.extend(["Danger", "Conflict", "Unknown situations"])
        if traits.get("independence", 0) < 0.3:
            base_fears.extend(
                ["Being alone", "Making decisions", "Taking responsibility"]
            )

        return random.sample(base_fears, min(3, len(base_fears)))

    def _generate_goals_and_aspirations(
        self, spirit: str, traits: Dict[str, float]
    ) -> List[str]:
        """Generate goals and aspirations based on spirit and traits."""
        goals = {
            "fox": [
                "Master new skills",
                "Solve complex problems",
                "Build a network of allies",
                "Discover hidden knowledge",
            ],
            "wolf": [
                "Protect their pack",
                "Become a great leader",
                "Build strong bonds",
                "Defend their territory",
            ],
            "otter": [
                "Bring joy to others",
                "Teach and learn",
                "Explore new places",
                "Create beautiful things",
            ],
            "eagle": [
                "Lead others to greatness",
                "Protect the innocent",
                "Discover new territories",
                "Mentor the next generation",
            ],
            "lion": [
                "Build a strong pride",
                "Protect the weak",
                "Lead with honor",
                "Become legendary",
            ],
            "tiger": [
                "Master their skills",
                "Protect their territory",
                "Become the strongest",
                "Live with honor",
            ],
            "dragon": [
                "Protect ancient knowledge",
                "Mentor worthy students",
                "Guard precious treasures",
                "Preserve wisdom",
            ],
        }

        base_goals = goals.get(spirit.lower(), goals["fox"])

        # Add goals based on high traits
        if traits.get("leadership", 0) > 0.7:
            base_goals.extend(["Lead others", "Build a following", "Create a legacy"])
        if traits.get("creativity", 0) > 0.7:
            base_goals.extend(
                ["Create something beautiful", "Innovate", "Express themselves"]
            )

        return random.sample(base_goals, min(4, len(base_goals)))

    def _generate_relationships_style(
        self, spirit: str, traits: Dict[str, float]
    ) -> str:
        """Generate relationship style based on spirit and traits."""
        if traits.get("loyalty", 0) > 0.7 and traits.get("protectiveness", 0) > 0.7:
            return "Forms deep, protective bonds. Loyal to the end and will defend loved ones fiercely."
        elif traits.get("independence", 0) > 0.7:
            return "Prefers close, meaningful relationships with a few trusted individuals. Values personal space."
        elif traits.get("charisma", 0) > 0.7:
            return "Naturally attracts others and builds wide networks of connections. Charismatic and inspiring."
        elif traits.get("empathy", 0) > 0.7:
            return "Deeply understanding and supportive. Forms emotional connections easily and helps others grow."
        else:
            return "Forms relationships based on mutual respect and shared interests. Values honesty and authenticity."

    def _generate_conflict_resolution(
        self, spirit: str, traits: Dict[str, float]
    ) -> str:
        """Generate conflict resolution style based on spirit and traits."""
        if traits.get("cunning", 0) > 0.7:
            return "Uses wit and strategy to resolve conflicts. Prefers to outsmart rather than overpower."
        elif traits.get("aggression", 0) > 0.7:
            return "Confronts conflicts directly and decisively. Believes in facing problems head-on."
        elif traits.get("diplomat", 0) > 0.7:
            return "Seeks peaceful solutions through negotiation and compromise. Values harmony."
        elif traits.get("empathy", 0) > 0.7:
            return "Tries to understand all sides and find solutions that work for everyone."
        else:
            return (
                "Approaches conflicts with a balanced mix of directness and diplomacy."
            )

    def _generate_learning_style(self, spirit: str, traits: Dict[str, float]) -> str:
        """Generate learning style based on spirit and traits."""
        if traits.get("curiosity", 0) > 0.7:
            return "Learns through exploration and experimentation. Asks lots of questions and tries new approaches."
        elif traits.get("intelligence", 0) > 0.7:
            return "Learns through analysis and study. Prefers structured learning and deep understanding."
        elif traits.get("playfulness", 0) > 0.7:
            return "Learns best through games and fun activities. Makes learning an enjoyable experience."
        elif traits.get("independence", 0) > 0.7:
            return "Prefers self-directed learning. Works best when allowed to explore at their own pace."
        else:
            return "Learns through a combination of observation, practice, and guidance from others."

    def _generate_work_approach(self, spirit: str, traits: Dict[str, float]) -> str:
        """Generate work approach based on spirit and traits."""
        if traits.get("determination", 0) > 0.7:
            return "Persistent and focused. Works steadily toward goals and doesn't give up easily."
        elif traits.get("creativity", 0) > 0.7:
            return "Innovative and original. Brings fresh perspectives and creative solutions to problems."
        elif traits.get("leadership", 0) > 0.7:
            return "Natural leader who organizes and motivates others. Takes initiative and responsibility."
        elif traits.get("playfulness", 0) > 0.7:
            return (
                "Makes work fun and engaging. Brings energy and enthusiasm to any task."
            )
        else:
            return "Methodical and reliable. Approaches work with careful planning and consistent effort."

    def _generate_social_preferences(
        self, spirit: str, traits: Dict[str, float]
    ) -> str:
        """Generate social preferences based on spirit and traits."""
        if traits.get("charisma", 0) > 0.7:
            return "Thrives in social situations. Enjoys meeting new people and being the center of attention."
        elif traits.get("independence", 0) > 0.7:
            return "Prefers small, intimate gatherings with close friends. Values quality over quantity in relationships."
        elif traits.get("empathy", 0) > 0.7:
            return "Enjoys helping others and being part of supportive communities. Values deep, meaningful connections."
        elif traits.get("playfulness", 0) > 0.7:
            return "Brings energy and fun to social situations. Enjoys group activities and games."
        else:
            return "Comfortable in various social settings. Adapts well to different groups and situations."


# Global instance for easy access
enhanced_persona_service = EnhancedPersonaService()
