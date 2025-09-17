# Testing and Quality Assurance Guide

_Building reliable, maintainable Python applications through comprehensive testing_

## Overview

Testing and quality assurance are essential for building reliable Python applications. This includes unit testing,
integration testing, code quality metrics, and
automated quality checks. Proper testing ensures code works as expected, catches regressions, and
provides confidence when making changes. This guide shows how to implement comprehensive testing strategies and
quality assurance practices.

## Code Quality Metrics

### 1. Cyclomatic Complexity

```python
import ast
from typing import List, Dict, Any

class ComplexityAnalyzer(ast.NodeVisitor):
    """Analyze cyclomatic complexity of Python code."""

    def __init__(self):
        self.complexity = 1  # Base complexity
        self.complex_nodes = []
        self.function_complexity = {}
        self.current_function = None

    def visit_FunctionDef(self, node):
        """Track function definitions."""
        self.current_function = node.name
        self.complexity = 1
        self.complex_nodes = []
        self.generic_visit(node)

        self.function_complexity[node.name] = {
            'complexity': self.complexity,
            'line': node.lineno,
            'nodes': self.complex_nodes.copy()
        }

    def visit_If(self, node):
        """Count if statements."""
        self.complexity += 1
        self.complex_nodes.append(("if", node.lineno))
        self.generic_visit(node)

    def visit_For(self, node):
        """Count for loops."""
        self.complexity += 1
        self.complex_nodes.append(("for", node.lineno))
        self.generic_visit(node)

    def visit_While(self, node):
        """Count while loops."""
        self.complexity += 1
        self.complex_nodes.append(("while", node.lineno))
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        """Count exception handlers."""
        self.complexity += 1
        self.complex_nodes.append(("except", node.lineno))
        self.generic_visit(node)

    def visit_BoolOp(self, node):
        """Count boolean operations."""
        self.complexity += len(node.values) - 1
        self.complex_nodes.append(("bool_op", node.lineno))
        self.generic_visit(node)

def analyze_complexity(file_path: str) -> Dict[str, Any]:
    """Analyze cyclomatic complexity of a file."""
    with open(file_path, 'r') as f:
        tree = ast.parse(f.read())

    analyzer = ComplexityAnalyzer()
    analyzer.visit(tree)

    return {
        'functions': analyzer.function_complexity,
        'recommendations': get_complexity_recommendations(analyzer.function_complexity)
    }

def get_complexity_recommendations(functions: Dict[str, Dict]) -> List[str]:
    """Get recommendations based on complexity analysis."""
    recommendations = []

    for func_name, data in functions.items():
        complexity = data['complexity']
        if complexity > 10:
            recommendations.append(
                f"Function '{func_name}' has high complexity ({complexity}). Consider refactoring."
            )
        elif complexity > 6:
            recommendations.append(
                f"Function '{func_name}' has moderate complexity ({complexity}). Monitor for future refactoring."
            )

    return recommendations
```

### 2. Code Coverage Analysis

```python
import coverage
import subprocess
from typing import Dict, List, Any

class CoverageAnalyzer:
    """Analyze code coverage for Python projects."""

    def __init__(self, source_dir: str = "src"):
        self.source_dir = source_dir
        self.cov = coverage.Coverage(source=[source_dir])

    def run_coverage(self, test_command: str = "python -m pytest") -> Dict[str, Any]:
        """Run coverage analysis."""
        self.cov.start()

        # Run tests
        result = subprocess.run(test_command.split(), capture_output=True, text=True)

        self.cov.stop()
        self.cov.save()

        return {
            'test_result': result.returncode == 0,
            'test_output': result.stdout,
            'test_errors': result.stderr,
            'coverage_data': self.get_coverage_data()
        }

    def get_coverage_data(self) -> Dict[str, Any]:
        """Get coverage data."""
        self.cov.load()

        return {
            'total_coverage': self.cov.report(),
            'missing_lines': self.cov.analysis2('src/main.py')[3] if self.cov.analysis2('src/main.py') else [],
            'covered_files': list(self.cov.get_data().measured_files())
        }

    def generate_html_report(self, output_dir: str = "htmlcov") -> None:
        """Generate HTML coverage report."""
        self.cov.html_report(directory=output_dir)

    def get_coverage_threshold_report(self, threshold: float = 80.0) -> Dict[str, Any]:
        """Check if coverage meets threshold."""
        coverage_data = self.get_coverage_data()
        total_coverage = coverage_data['total_coverage']

        return {
            'threshold': threshold,
            'actual_coverage': total_coverage,
            'meets_threshold': total_coverage >= threshold,
            'files_below_threshold': self.get_files_below_threshold(threshold)
        }

    def get_files_below_threshold(self, threshold: float) -> List[str]:
        """Get files with coverage below threshold."""
        files_below = []

        for filename in self.cov.get_data().measured_files():
            try:
                analysis = self.cov.analysis2(filename)
                if analysis:
                    covered, total = analysis[1], analysis[2]
                    coverage_percent = (covered / total * 100) if total > 0 else 0
                    if coverage_percent < threshold:
                        files_below.append({
                            'file': filename,
                            'coverage': coverage_percent
                        })
            except Exception:
                continue

        return files_below
```

### 3. Code Quality Metrics

```python
import ast
import os
from typing import Dict, List, Any, Set
from pathlib import Path

class CodeQualityAnalyzer:
    """Comprehensive code quality analysis."""

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.metrics = {}

    def analyze_project(self) -> Dict[str, Any]:
        """Analyze entire project for quality metrics."""
        python_files = list(self.project_root.rglob("*.py"))

        total_metrics = {
            'files_analyzed': len(python_files),
            'total_lines': 0,
            'total_functions': 0,
            'total_classes': 0,
            'total_imports': 0,
            'duplicate_code_blocks': 0,
            'long_functions': 0,
            'large_classes': 0,
            'magic_numbers': 0,
            'unused_imports': 0
        }

        for file_path in python_files:
            if self._should_analyze_file(file_path):
                file_metrics = self.analyze_file(file_path)
                self._merge_metrics(total_metrics, file_metrics)

        return total_metrics

    def analyze_file(self, file_path: Path) -> Dict[str, Any]:
        """Analyze a single file."""
        with open(file_path, 'r') as f:
            content = f.read()
            lines = content.splitlines()

        tree = ast.parse(content)

        return {
            'lines': len(lines),
            'functions': len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]),
            'classes': len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]),
            'imports': len([node for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom))]),
            'long_functions': self._count_long_functions(tree, lines),
            'large_classes': self._count_large_classes(tree, lines),
            'magic_numbers': self._count_magic_numbers(tree),
            'unused_imports': self._count_unused_imports(tree, content)
        }

    def _should_analyze_file(self, file_path: Path) -> bool:
        """Check if file should be analyzed."""
        # Skip test files, __pycache__, etc.
        skip_patterns = ['__pycache__', 'test_', '_test.py', '.pyc']
        return not any(pattern in str(file_path) for pattern in skip_patterns)

    def _count_long_functions(self, tree: ast.AST, lines: List[str]) -> int:
        """Count functions with more than 20 lines."""
        long_functions = 0

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Calculate function length
                start_line = node.lineno
                end_line = node.end_lineno if hasattr(node, 'end_lineno') else start_line
                function_length = end_line - start_line

                if function_length > 20:
                    long_functions += 1

        return long_functions

    def _count_large_classes(self, tree: ast.AST, lines: List[str]) -> int:
        """Count classes with more than 100 lines."""
        large_classes = 0

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Calculate class length
                start_line = node.lineno
                end_line = node.end_lineno if hasattr(node, 'end_lineno') else start_line
                class_length = end_line - start_line

                if class_length > 100:
                    large_classes += 1

        return large_classes

    def _count_magic_numbers(self, tree: ast.AST) -> int:
        """Count magic numbers in code."""
        magic_numbers = 0
        allowed_numbers = {0, 1, -1}  # Commonly acceptable numbers

        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                if node.value not in allowed_numbers:
                    magic_numbers += 1

        return magic_numbers

    def _count_unused_imports(self, tree: ast.AST, content: str) -> int:
        """Count unused imports (simplified)."""
        # This is a simplified version - in practice, you'd use tools like unimport
        imports = set()
        used_names = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.add(alias.name)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imports.add(alias.name)
            elif isinstance(node, ast.Name):
                used_names.add(node.id)

        return len(imports - used_names)

    def _merge_metrics(self, total: Dict[str, Any], file_metrics: Dict[str, Any]) -> None:
        """Merge file metrics into total metrics."""
        for key, value in file_metrics.items():
            if key in total:
                total[key] += value
```

## Automated Quality Checks

### 1. Linting and Formatting

```python
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any

class QualityChecker:
    """Run automated quality checks on Python code."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.results = {}

    def run_all_checks(self) -> Dict[str, Any]:
        """Run all quality checks."""
        return {
            'pylint': self.run_pylint(),
            'flake8': self.run_flake8(),
            'black': self.run_black_check(),
            'isort': self.run_isort_check(),
            'mypy': self.run_mypy(),
            'bandit': self.run_bandit()
        }

    def run_pylint(self) -> Dict[str, Any]:
        """Run pylint checks."""
        try:
            result = subprocess.run(
                ['pylint', str(self.project_root), '--output-format=json'],
                capture_output=True,
                text=True
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'issues': self._parse_pylint_output(result.stdout)
            }
        except FileNotFoundError:
            return {'success': False, 'error': 'Pylint not found'}

    def run_flake8(self) -> Dict[str, Any]:
        """Run flake8 checks."""
        try:
            result = subprocess.run(
                ['flake8', str(self.project_root)],
                capture_output=True,
                text=True
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'issues': result.stdout.split('\n') if result.stdout else []
            }
        except FileNotFoundError:
            return {'success': False, 'error': 'Flake8 not found'}

    def run_black_check(self) -> Dict[str, Any]:
        """Check code formatting with black."""
        try:
            result = subprocess.run(
                ['black', '--check', '--diff', str(self.project_root)],
                capture_output=True,
                text=True
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'needs_formatting': result.returncode != 0
            }
        except FileNotFoundError:
            return {'success': False, 'error': 'Black not found'}

    def run_isort_check(self) -> Dict[str, Any]:
        """Check import sorting with isort."""
        try:
            result = subprocess.run(
                ['isort', '--check-only', '--diff', str(self.project_root)],
                capture_output=True,
                text=True
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'needs_sorting': result.returncode != 0
            }
        except FileNotFoundError:
            return {'success': False, 'error': 'isort not found'}

    def run_mypy(self) -> Dict[str, Any]:
        """Run mypy type checking."""
        try:
            result = subprocess.run(
                ['mypy', str(self.project_root)],
                capture_output=True,
                text=True
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'type_errors': result.stdout.split('\n') if result.stdout else []
            }
        except FileNotFoundError:
            return {'success': False, 'error': 'MyPy not found'}

    def run_bandit(self) -> Dict[str, Any]:
        """Run bandit security checks."""
        try:
            result = subprocess.run(
                ['bandit', '-r', str(self.project_root), '-f', 'json'],
                capture_output=True,
                text=True
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'security_issues': self._parse_bandit_output(result.stdout)
            }
        except FileNotFoundError:
            return {'success': False, 'error': 'Bandit not found'}

    def _parse_pylint_output(self, output: str) -> List[Dict[str, Any]]:
        """Parse pylint JSON output."""
        try:
            import json
            return json.loads(output)
        except json.JSONDecodeError:
            return []

    def _parse_bandit_output(self, output: str) -> List[Dict[str, Any]]:
        """Parse bandit JSON output."""
        try:
            import json
            data = json.loads(output)
            return data.get('results', [])
        except json.JSONDecodeError:
            return []
```

### 2. Pre-commit Hooks

```python
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/isort
    rev: 5.10.1
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v0.950
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.1
    hooks:
      - id: bandit
        args: ['-r', '.', '-f', 'json']

  - repo: https://github.com/jendrikseipp/vulture
    rev: v2.9.1
    hooks:
      - id: vulture
        args: [--min-confidence, 60]

  - repo: https://github.com/hakancelik96/unimport
    rev: v0.1.0
    hooks:
      - id: unimport
        args: [--check]
```

### 3. CI/CD Integration

```python
# scripts/quality_check.py
import subprocess
import sys
import json
from pathlib import Path

def run_quality_checks():
    """Run all quality checks and report results."""
    project_root = Path(__file__).parent.parent

    checker = QualityChecker(project_root)
    results = checker.run_all_checks()

    # Check if any checks failed
    failed_checks = []
    for check_name, result in results.items():
        if not result.get('success', False):
            failed_checks.append(check_name)

    # Print results
    print("Quality Check Results:")
    print("=" * 50)

    for check_name, result in results.items():
        status = "✅ PASS" if result.get('success', False) else "❌ FAIL"
        print(f"{check_name.upper()}: {status}")

        if not result.get('success', False):
            if 'error' in result:
                print(f"  Error: {result['error']}")
            elif 'issues' in result and result['issues']:
                print(f"  Issues found: {len(result['issues'])}")

    # Save detailed results
    with open('quality_check_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    if failed_checks:
        print(f"\n❌ Quality checks failed: {', '.join(failed_checks)}")
        sys.exit(1)
    else:
        print("\n✅ All quality checks passed!")
        sys.exit(0)

if __name__ == "__main__":
    run_quality_checks()
```

## Testing Strategies

### 1. Unit Testing

```python
import unittest
from unittest.mock import Mock, patch
from typing import Dict, Any

class UserServiceTests(unittest.TestCase):
    """Unit tests for UserService."""

    def setUp(self):
        """Set up test fixtures."""
        self.mock_repository = Mock()
        self.mock_validator = Mock()
        self.user_service = UserService(self.mock_repository, self.mock_validator)

    def test_create_user_success(self):
        """Test successful user creation."""
        # Arrange
        user_data = {'email': 'test@example.com', 'name': 'Test User'}
        self.mock_validator.validate_user_data.return_value = True
        self.mock_repository.create_user.return_value = Mock(id='123', email='test@example.com')

        # Act
        result = self.user_service.create_user(user_data)

        # Assert
        self.assertEqual(result['user_id'], '123')
        self.mock_validator.validate_user_data.assert_called_once_with(user_data)
        self.mock_repository.create_user.assert_called_once_with(user_data)

    def test_create_user_validation_failure(self):
        """Test user creation with validation failure."""
        # Arrange
        user_data = {'email': 'invalid-email', 'name': 'Test User'}
        self.mock_validator.validate_user_data.return_value = False

        # Act & Assert
        with self.assertRaises(ValidationError):
            self.user_service.create_user(user_data)

        self.mock_validator.validate_user_data.assert_called_once_with(user_data)
        self.mock_repository.create_user.assert_not_called()

    def test_create_user_database_error(self):
        """Test user creation with database error."""
        # Arrange
        user_data = {'email': 'test@example.com', 'name': 'Test User'}
        self.mock_validator.validate_user_data.return_value = True
        self.mock_repository.create_user.side_effect = DatabaseError("Connection failed")

        # Act & Assert
        with self.assertRaises(DatabaseError):
            self.user_service.create_user(user_data)

class TestUserValidator(unittest.TestCase):
    """Unit tests for UserValidator."""

    def setUp(self):
        self.validator = UserValidator()

    def test_validate_email_valid(self):
        """Test valid email validation."""
        valid_emails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'user+tag@example.org'
        ]

        for email in valid_emails:
            with self.subTest(email=email):
                self.assertTrue(self.validator.validate_email(email))

    def test_validate_email_invalid(self):
        """Test invalid email validation."""
        invalid_emails = [
            'invalid-email',
            '@example.com',
            'test@',
            'test.example.com'
        ]

        for email in invalid_emails:
            with self.subTest(email=email):
                self.assertFalse(self.validator.validate_email(email))

    def test_validate_password_strength(self):
        """Test password strength validation."""
        # Test cases: (password, expected_result)
        test_cases = [
            ('password123', True),   # Has letters and numbers
            ('password', False),     # No numbers
            ('12345678', False),     # No letters
            ('pass1', False),        # Too short
            ('', False),             # Empty
        ]

        for password, expected in test_cases:
            with self.subTest(password=password):
                result = self.validator.validate_password(password)
                self.assertEqual(result, expected)
```

### 2. Integration Testing

```python
import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class TestUserIntegration:
    """Integration tests for user operations."""

    @pytest.fixture
    def test_database(self):
        """Create test database."""
        # Create temporary database
        db_fd, db_path = tempfile.mkstemp()
        engine = create_engine(f'sqlite:///{db_path}')

        # Create tables
        Base.metadata.create_all(engine)

        Session = sessionmaker(bind=engine)
        session = Session()

        yield session

        # Cleanup
        session.close()
        os.close(db_fd)
        os.unlink(db_path)

    def test_user_creation_flow(self, test_database):
        """Test complete user creation flow."""
        # Arrange
        user_repository = UserRepository(test_database)
        user_validator = UserValidator()
        user_service = UserService(user_repository, user_validator)

        user_data = {
            'email': 'integration@test.com',
            'name': 'Integration Test User',
            'password': 'testpassword123'
        }

        # Act
        result = user_service.create_user(user_data)

        # Assert
        assert result['user_id'] is not None

        # Verify user was saved to database
        saved_user = user_repository.get_user(result['user_id'])
        assert saved_user.email == user_data['email']
        assert saved_user.name == user_data['name']

    def test_user_authentication_flow(self, test_database):
        """Test user authentication flow."""
        # Arrange
        user_repository = UserRepository(test_database)
        auth_service = AuthService(user_repository)

        # Create user first
        user_data = {
            'email': 'auth@test.com',
            'name': 'Auth Test User',
            'password': 'testpassword123'
        }
        user = user_repository.create_user(user_data)

        # Act
        authenticated_user = auth_service.authenticate(
            user_data['email'],
            user_data['password']
        )

        # Assert
        assert authenticated_user is not None
        assert authenticated_user.email == user_data['email']

    def test_user_update_flow(self, test_database):
        """Test user update flow."""
        # Arrange
        user_repository = UserRepository(test_database)
        user_service = UserService(user_repository, UserValidator())

        # Create user
        user_data = {
            'email': 'update@test.com',
            'name': 'Update Test User',
            'password': 'testpassword123'
        }
        user = user_service.create_user(user_data)

        # Act
        update_data = {'name': 'Updated Name'}
        updated_user = user_service.update_user(user['user_id'], update_data)

        # Assert
        assert updated_user['name'] == 'Updated Name'
        assert updated_user['email'] == user_data['email']
```

### 3. Property-Based Testing

```python
from hypothesis import given, strategies as st
import pytest

class TestUserValidatorPropertyBased:
    """Property-based tests for UserValidator."""

    def setUp(self):
        self.validator = UserValidator()

    @given(st.emails())
    def test_valid_emails_always_pass_validation(self, email):
        """Property: All valid emails should pass validation."""
        assert self.validator.validate_email(email)

    @given(st.text(min_size=1, max_size=100))
    def test_emails_without_at_symbol_fail_validation(self, text):
        """Property: Emails without @ should fail validation."""
        if '@' not in text:
            assert not self.validator.validate_email(text)

    @given(st.text(min_size=8, max_size=128))
    def test_passwords_with_letters_and_numbers_pass(self, password):
        """Property: Passwords with letters and numbers should pass."""
        has_letter = any(c.isalpha() for c in password)
        has_number = any(c.isdigit() for c in password)

        if has_letter and has_number:
            assert self.validator.validate_password(password)

    @given(st.text(min_size=1, max_size=7))
    def test_short_passwords_always_fail(self, password):
        """Property: Short passwords should always fail."""
        assert not self.validator.validate_password(password)
```

## Best Practices

### 1. Test Organization

```python
# tests/
#   __init__.py
#   unit/
#       __init__.py
#       test_user_service.py
#       test_user_validator.py
#   integration/
#       __init__.py
#       test_user_flow.py
#   fixtures/
#       __init__.py
#       user_fixtures.py
#   conftest.py

# tests/conftest.py
import pytest
from unittest.mock import Mock

@pytest.fixture
def mock_user_repository():
    """Mock user repository for testing."""
    return Mock()

@pytest.fixture
def mock_email_service():
    """Mock email service for testing."""
    return Mock()

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        'email': 'test@example.com',
        'name': 'Test User',
        'password': 'testpassword123'
    }

# tests/fixtures/user_fixtures.py
import pytest
from typing import Dict, Any

@pytest.fixture
def valid_user_data() -> Dict[str, Any]:
    """Valid user data fixture."""
    return {
        'email': 'valid@example.com',
        'name': 'Valid User',
        'password': 'validpassword123'
    }

@pytest.fixture
def invalid_user_data() -> Dict[str, Any]:
    """Invalid user data fixture."""
    return {
        'email': 'invalid-email',
        'name': '',
        'password': 'weak'
    }
```

### 2. Test Data Management

```python
import factory
from factory.fuzzy import FuzzyText, FuzzyEmail
from typing import Dict, Any

class UserFactory(factory.Factory):
    """Factory for creating test users."""

    class Meta:
        model = dict

    email = FuzzyEmail()
    name = FuzzyText(length=10)
    password = factory.LazyFunction(lambda: 'testpassword123')

class UserDataFactory:
    """Factory for creating user test data."""

    @staticmethod
    def create_valid_user() -> Dict[str, Any]:
        """Create valid user data."""
        return UserFactory.build()

    @staticmethod
    def create_user_with_email(email: str) -> Dict[str, Any]:
        """Create user with specific email."""
        return UserFactory.build(email=email)

    @staticmethod
    def create_invalid_user() -> Dict[str, Any]:
        """Create invalid user data."""
        return {
            'email': 'invalid-email',
            'name': '',
            'password': 'weak'
        }
```

### 3. Continuous Integration

```yaml
# .github/workflows/quality.yml
name: Quality Assurance

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v3
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run linting
        run: |
          flake8 src/
          pylint src/
          black --check src/
          isort --check-only src/

      - name: Run type checking
        run: mypy src/

      - name: Run security checks
        run: bandit -r src/

      - name: Run tests
        run: |
          pytest tests/ --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Conclusion

🦦 _Testing and quality assurance require the playful thoroughness of an otter - diving deep into every test case,
exploring every edge case, and ensuring every component works perfectly._

Comprehensive testing and quality assurance provide:

- **Reliability**: Confidence that code works as expected
- **Maintainability**: Easy to refactor and modify code
- **Documentation**: Tests serve as living documentation
- **Regression Prevention**: Catch bugs before they reach production
- **Code Quality**: Maintain high standards through automation

Key principles:

- **Test Early and Often**: Write tests as you develop
- **Use Appropriate Test Types**: Unit, integration, and property-based tests
- **Automate Quality Checks**: Use CI/CD for consistent quality
- **Measure Coverage**: Track test coverage and quality metrics
- **Mock External Dependencies**: Isolate units under test
- **Write Clear Tests**: Tests should be readable and maintainable
- **Use Test Data Factories**: Generate consistent test data

_Build code that flows like a crystal-clear stream, tested thoroughly and
quality-assured with the joy of an otter discovering every hidden treasure._ 🦦
