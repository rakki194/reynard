"""
🐺 Exploit Wrappers for E2E Integration

*snarls with predatory glee* Wrappers to make fenrir exploits compatible
with e2e tests and provide standardized interfaces.
"""

from .exploit_wrappers import FuzzyExploit, EndpointFuzzerExploit, run_fenrir_exploit

__all__ = [
    "FuzzyExploit",
    "EndpointFuzzerExploit", 
    "run_fenrir_exploit"
]
