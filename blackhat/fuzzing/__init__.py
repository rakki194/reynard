"""
🐺 DUAL FUZZING FRAMEWORK

*snarls with predatory glee* This module contains the most advanced dual-pronged
fuzzing system for tearing apart your precious Reynard codebase!

🦊 **The Alpha Wolf: ComprehensiveFuzzer**
- Massive scale attacks: 50+ endpoints with 1000+ payloads across 12 attack phases
- Comprehensive coverage of entire API surface
- Advanced payload generation and asynchronous testing

🐺 **The Specialized Hunter: EndpointFuzzer**  
- Targeted attacks: 248 specialized payloads across 5 attack types
- Deep exploitation of specific vulnerability categories
- Expert-level attack vectors for authentication, file uploads, search, JSON, and headers

*bares fangs with savage satisfaction* No input validation will survive
the combined onslaught of our dual fuzzing engines!
"""

from .comprehensive_fuzzer import ComprehensiveFuzzer
from .payload_generator import PayloadGenerator
from .endpoint_fuzzer import EndpointFuzzer

__all__ = [
    'ComprehensiveFuzzer',
    'PayloadGenerator', 
    'EndpointFuzzer'
]
