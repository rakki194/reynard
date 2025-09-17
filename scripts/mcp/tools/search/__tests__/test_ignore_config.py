#!/usr/bin/env python3
"""
Tests for Search Ignore Configuration
====================================

Test the centralized ignore system for search operations.
"""

from pathlib import Path

from ..ignore_config import (
    SearchIgnoreConfig,
    filter_paths,
    should_ignore_dir,
    should_ignore_file,
    should_ignore_path,
)


class TestSearchIgnoreConfig:
    """Test the SearchIgnoreConfig class."""

    def test_should_ignore_dir_exact_matches(self):
        """Test that exact directory matches are ignored."""
        assert should_ignore_dir("__pycache__") is True
        assert should_ignore_dir("node_modules") is True
        assert should_ignore_dir(".git") is True
        assert should_ignore_dir(".mypy_cache") is True
        assert should_ignore_dir("venv") is True
        assert should_ignore_dir("dist") is True
        assert should_ignore_dir("build") is True
        assert should_ignore_dir(".pytest_cache") is True
        assert should_ignore_dir(".coverage") is True
        assert should_ignore_dir("htmlcov") is True
        assert should_ignore_dir(".tox") is True
        assert should_ignore_dir(".cache") is True
        assert should_ignore_dir("tmp") is True
        assert should_ignore_dir("temp") is True
        assert should_ignore_dir("logs") is True
        assert should_ignore_dir(".logs") is True
        assert should_ignore_dir("_build") is True
        assert should_ignore_dir(".doctrees") is True
        assert should_ignore_dir("site") is True
        assert should_ignore_dir(".ipynb_checkpoints") is True
        assert should_ignore_dir("target") is True
        assert should_ignore_dir("vendor") is True
        assert should_ignore_dir(".gradle") is True
        assert should_ignore_dir(".m2") is True
        assert should_ignore_dir("Debug") is True
        assert should_ignore_dir("Release") is True
        assert should_ignore_dir(".vs") is True
        assert should_ignore_dir(".db") is True
        assert should_ignore_dir(".sqlite") is True
        assert should_ignore_dir(".sqlite3") is True

    def test_should_ignore_dir_hidden_dirs(self):
        """Test that hidden directories are ignored."""
        assert should_ignore_dir(".hidden") is True
        assert should_ignore_dir(".secret") is True
        assert should_ignore_dir(".env") is True
        assert should_ignore_dir(".vscode") is True
        assert should_ignore_dir(".idea") is True
        assert should_ignore_dir(".sublime-project") is True
        assert should_ignore_dir(".sublime-workspace") is True
        assert should_ignore_dir(".DS_Store") is True
        assert should_ignore_dir("Thumbs.db") is True
        assert should_ignore_dir(".Spotlight-V100") is True
        assert should_ignore_dir(".Trashes") is True
        assert should_ignore_dir(".fseventsd") is True
        assert should_ignore_dir(".TemporaryItems") is True

    def test_should_ignore_dir_not_ignored(self):
        """Test that normal directories are not ignored."""
        assert should_ignore_dir("src") is False
        assert should_ignore_dir("tests") is False
        assert should_ignore_dir("docs") is False
        assert should_ignore_dir("scripts") is False
        assert should_ignore_dir("config") is False
        assert should_ignore_dir("data") is False
        assert should_ignore_dir("utils") is False
        assert should_ignore_dir("models") is False
        assert should_ignore_dir("views") is False
        assert should_ignore_dir("controllers") is False
        assert should_ignore_dir("services") is False
        assert should_ignore_dir("components") is False
        assert should_ignore_dir("pages") is False
        assert should_ignore_dir("assets") is False
        assert should_ignore_dir("static") is False
        assert should_ignore_dir("public") is False
        assert should_ignore_dir("templates") is False
        assert should_ignore_dir("migrations") is False
        assert should_ignore_dir("seeds") is False
        assert should_ignore_dir("fixtures") is False

    def test_should_ignore_file_exact_matches(self):
        """Test that exact file matches are ignored."""
        assert should_ignore_file("*.pyc") is False  # Pattern, not exact
        assert should_ignore_file("*.pyo") is False  # Pattern, not exact
        assert should_ignore_file("*.pyd") is False  # Pattern, not exact
        assert should_ignore_file("*.so") is False  # Pattern, not exact
        assert should_ignore_file("*.egg") is False  # Pattern, not exact
        assert should_ignore_file("*.whl") is False  # Pattern, not exact
        assert should_ignore_file("*.tar.gz") is False  # Pattern, not exact
        assert should_ignore_file("package-lock.json") is True
        assert should_ignore_file("yarn.lock") is True
        assert should_ignore_file("*.log") is False  # Pattern, not exact
        assert should_ignore_file(".gitignore") is True
        assert should_ignore_file(".gitattributes") is True
        assert should_ignore_file(".gitmodules") is True
        assert should_ignore_file("*.swp") is False  # Pattern, not exact
        assert should_ignore_file("*.swo") is False  # Pattern, not exact
        assert should_ignore_file("*~") is False  # Pattern, not exact
        assert should_ignore_file("*.tmp") is False  # Pattern, not exact
        assert should_ignore_file("*.bak") is False  # Pattern, not exact
        assert should_ignore_file("*.orig") is False  # Pattern, not exact
        assert should_ignore_file(".DS_Store") is True
        assert should_ignore_file("Thumbs.db") is True
        assert should_ignore_file("desktop.ini") is True

    def test_should_ignore_file_hidden_files(self):
        """Test that hidden files are ignored."""
        assert should_ignore_file(".hidden") is True
        assert should_ignore_file(".secret") is True
        assert should_ignore_file(".env") is True
        assert should_ignore_file(".env.local") is True
        assert should_ignore_file(".env.production") is True
        assert should_ignore_file(".env.development") is True
        assert should_ignore_file(".env.test") is True
        assert should_ignore_file(".gitignore") is True
        assert should_ignore_file(".gitattributes") is True
        assert should_ignore_file(".gitmodules") is True
        assert should_ignore_file(".editorconfig") is True
        assert should_ignore_file(".eslintrc") is True
        assert should_ignore_file(".eslintrc.js") is True
        assert should_ignore_file(".eslintrc.json") is True
        assert should_ignore_file(".prettierrc") is True
        assert should_ignore_file(".prettierrc.js") is True
        assert should_ignore_file(".prettierrc.json") is True
        assert should_ignore_file(".babelrc") is True
        assert should_ignore_file(".babelrc.js") is True
        assert should_ignore_file(".babelrc.json") is True
        assert should_ignore_file(".travis.yml") is True
        assert should_ignore_file(".circleci") is True
        assert should_ignore_file(".github") is True
        assert should_ignore_file(".dockerignore") is True
        assert should_ignore_file(".npmignore") is True
        assert should_ignore_file(".yarnignore") is True

    def test_should_ignore_file_not_ignored(self):
        """Test that normal files are not ignored."""
        assert should_ignore_file("main.py") is False
        assert should_ignore_file("test.py") is False
        assert should_ignore_file("README.md") is False
        assert should_ignore_file("requirements.txt") is False
        assert should_ignore_file("setup.py") is False
        assert should_ignore_file("pyproject.toml") is False
        assert should_ignore_file("package.json") is False
        assert should_ignore_file("tsconfig.json") is False
        assert should_ignore_file("webpack.config.js") is False
        assert should_ignore_file("Dockerfile") is False
        assert should_ignore_file("docker-compose.yml") is False
        assert should_ignore_file("Makefile") is False
        assert should_ignore_file("CMakeLists.txt") is False
        assert should_ignore_file("Cargo.toml") is False
        assert should_ignore_file("go.mod") is False
        assert should_ignore_file("go.sum") is False
        assert should_ignore_file("Gemfile") is False
        assert should_ignore_file("Gemfile.lock") is False
        assert should_ignore_file("composer.json") is False
        assert should_ignore_file("composer.lock") is False
        assert should_ignore_file("pom.xml") is False
        assert should_ignore_file("build.gradle") is False
        assert should_ignore_file("build.gradle.kts") is False
        assert should_ignore_file("pubspec.yaml") is False
        assert should_ignore_file("pubspec.lock") is False
        assert should_ignore_file("mix.exs") is False
        assert should_ignore_file("mix.lock") is False
        assert should_ignore_file("Cargo.lock") is False
        assert should_ignore_file("yarn.lock") is True  # This one should be ignored
        assert (
            should_ignore_file("package-lock.json") is True
        )  # This one should be ignored

    def test_should_ignore_path_directories(self):
        """Test that paths with ignored directories are ignored."""
        assert should_ignore_path(Path("src/__pycache__/module.pyc")) is True
        assert should_ignore_path(Path("node_modules/package/index.js")) is True
        assert should_ignore_path(Path(".git/config")) is True
        assert (
            should_ignore_path(Path("venv/lib/python3.9/site-packages/package.py"))
            is True
        )
        assert should_ignore_path(Path("dist/bundle.js")) is True
        assert should_ignore_path(Path("build/artifact.o")) is True
        assert should_ignore_path(Path(".mypy_cache/type_info.json")) is True
        assert should_ignore_path(Path(".pytest_cache/v/cache/lastfailed")) is True
        assert should_ignore_path(Path("coverage/coverage.xml")) is True
        assert should_ignore_path(Path(".coverage")) is True
        assert should_ignore_path(Path("htmlcov/index.html")) is True
        assert (
            should_ignore_path(Path(".tox/py39/lib/python3.9/site-packages/package.py"))
            is True
        )
        assert (
            should_ignore_path(Path(".cache/pytest_cache/v/cache/lastfailed")) is True
        )
        assert should_ignore_path(Path("tmp/temp_file.txt")) is True
        assert should_ignore_path(Path("temp/temp_file.txt")) is True
        assert should_ignore_path(Path("logs/app.log")) is True
        assert should_ignore_path(Path(".logs/error.log")) is True
        assert should_ignore_path(Path("_build/html/index.html")) is True
        assert should_ignore_path(Path(".doctrees/environment.pickle")) is True
        assert should_ignore_path(Path("site/index.html")) is True
        assert (
            should_ignore_path(Path(".ipynb_checkpoints/notebook-checkpoint.ipynb"))
            is True
        )
        assert should_ignore_path(Path("target/debug/app")) is True
        assert should_ignore_path(Path("vendor/package/package.go")) is True
        assert should_ignore_path(Path(".gradle/build/tmp/compileJava/classes")) is True
        assert (
            should_ignore_path(
                Path(".m2/repository/org/package/1.0.0/package-1.0.0.jar")
            )
            is True
        )
        assert should_ignore_path(Path("Debug/app.exe")) is True
        assert should_ignore_path(Path("Release/app.exe")) is True
        assert should_ignore_path(Path(".vs/project.vcxproj.user")) is True
        assert should_ignore_path(Path(".db/database.db")) is True
        assert should_ignore_path(Path(".sqlite/database.sqlite")) is True
        assert should_ignore_path(Path(".sqlite3/database.sqlite3")) is True

    def test_should_ignore_path_files(self):
        """Test that paths with ignored files are ignored."""
        assert should_ignore_path(Path("src/module.pyc")) is True
        assert should_ignore_path(Path("src/module.pyo")) is True
        assert should_ignore_path(Path("src/module.pyd")) is True
        assert should_ignore_path(Path("src/module.so")) is True
        assert should_ignore_path(Path("src/package.egg")) is True
        assert should_ignore_path(Path("src/package.whl")) is True
        assert should_ignore_path(Path("src/package.tar.gz")) is True
        assert should_ignore_path(Path("package-lock.json")) is True
        assert should_ignore_path(Path("yarn.lock")) is True
        assert should_ignore_path(Path("app.log")) is True
        assert should_ignore_path(Path(".gitignore")) is True
        assert should_ignore_path(Path(".gitattributes")) is True
        assert should_ignore_path(Path(".gitmodules")) is True
        assert should_ignore_path(Path("file.swp")) is True
        assert should_ignore_path(Path("file.swo")) is True
        assert should_ignore_path(Path("file~")) is True
        assert should_ignore_path(Path("file.tmp")) is True
        assert should_ignore_path(Path("file.bak")) is True
        assert should_ignore_path(Path("file.orig")) is True
        assert should_ignore_path(Path(".DS_Store")) is True
        assert should_ignore_path(Path("Thumbs.db")) is True
        assert should_ignore_path(Path("desktop.ini")) is True

    def test_should_ignore_path_not_ignored(self):
        """Test that normal paths are not ignored."""
        assert should_ignore_path(Path("src/main.py")) is False
        assert should_ignore_path(Path("tests/test_main.py")) is False
        assert should_ignore_path(Path("README.md")) is False
        assert should_ignore_path(Path("requirements.txt")) is False
        assert should_ignore_path(Path("setup.py")) is False
        assert should_ignore_path(Path("pyproject.toml")) is False
        assert should_ignore_path(Path("package.json")) is False
        assert should_ignore_path(Path("tsconfig.json")) is False
        assert should_ignore_path(Path("webpack.config.js")) is False
        assert should_ignore_path(Path("Dockerfile")) is False
        assert should_ignore_path(Path("docker-compose.yml")) is False
        assert should_ignore_path(Path("Makefile")) is False
        assert should_ignore_path(Path("CMakeLists.txt")) is False
        assert should_ignore_path(Path("Cargo.toml")) is False
        assert should_ignore_path(Path("go.mod")) is False
        assert should_ignore_path(Path("go.sum")) is False
        assert should_ignore_path(Path("Gemfile")) is False
        assert should_ignore_path(Path("Gemfile.lock")) is False
        assert should_ignore_path(Path("composer.json")) is False
        assert should_ignore_path(Path("composer.lock")) is False
        assert should_ignore_path(Path("pom.xml")) is False
        assert should_ignore_path(Path("build.gradle")) is False
        assert should_ignore_path(Path("build.gradle.kts")) is False
        assert should_ignore_path(Path("pubspec.yaml")) is False
        assert should_ignore_path(Path("pubspec.lock")) is False
        assert should_ignore_path(Path("mix.exs")) is False
        assert should_ignore_path(Path("mix.lock")) is False
        assert should_ignore_path(Path("Cargo.lock")) is False

    def test_filter_paths(self):
        """Test that filter_paths removes ignored paths."""
        paths = [
            Path("src/main.py"),
            Path("src/__pycache__/module.pyc"),
            Path("tests/test_main.py"),
            Path("node_modules/package/index.js"),
            Path("README.md"),
            Path(".git/config"),
            Path("venv/lib/python3.9/site-packages/package.py"),
            Path("dist/bundle.js"),
            Path("build/artifact.o"),
            Path(".mypy_cache/type_info.json"),
            Path(".pytest_cache/v/cache/lastfailed"),
            Path("coverage/coverage.xml"),
            Path(".coverage"),
            Path("htmlcov/index.html"),
            Path(".tox/py39/lib/python3.9/site-packages/package.py"),
            Path(".cache/pytest_cache/v/cache/lastfailed"),
            Path("tmp/temp_file.txt"),
            Path("temp/temp_file.txt"),
            Path("logs/app.log"),
            Path(".logs/error.log"),
            Path("_build/html/index.html"),
            Path(".doctrees/environment.pickle"),
            Path("site/index.html"),
            Path(".ipynb_checkpoints/notebook-checkpoint.ipynb"),
            Path("target/debug/app"),
            Path("vendor/package/package.go"),
            Path(".gradle/build/tmp/compileJava/classes"),
            Path(".m2/repository/org/package/1.0.0/package-1.0.0.jar"),
            Path("Debug/app.exe"),
            Path("Release/app.exe"),
            Path(".vs/project.vcxproj.user"),
            Path(".db/database.db"),
            Path(".sqlite/database.sqlite"),
            Path(".sqlite3/database.sqlite3"),
        ]

        filtered = filter_paths(paths)

        # Should only contain non-ignored paths
        expected = [
            Path("src/main.py"),
            Path("tests/test_main.py"),
            Path("README.md"),
        ]

        assert set(filtered) == set(expected)

    def test_get_ignore_stats(self):
        """Test that get_ignore_stats returns correct statistics."""
        stats = SearchIgnoreConfig.get_ignore_stats()

        assert "ignore_dirs" in stats
        assert "ignore_files" in stats
        assert "ignore_dir_patterns" in stats
        assert "ignore_file_patterns" in stats
        assert "total_patterns" in stats

        assert stats["ignore_dirs"] > 0
        assert stats["ignore_files"] > 0
        assert stats["total_patterns"] == stats["ignore_dirs"] + stats["ignore_files"]

        # Should have a reasonable number of patterns
        assert stats["ignore_dirs"] >= 50
        assert stats["ignore_files"] >= 50
        assert stats["total_patterns"] >= 100
