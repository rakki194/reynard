# Pathlib Enhancements - Python 3.14

_Comprehensive guide to the major pathlib enhancements and new methods in Python 3.14_

## Overview

Python 3.14 introduces significant enhancements to the `pathlib` module, including new methods for file operations, performance improvements, and better error handling. These changes make pathlib more powerful and efficient for file system operations.

## What's New in Python 3.14

### New Path Methods

```python
from pathlib import Path
import tempfile
import shutil

def demonstrate_new_path_methods():
    """Show new pathlib methods in Python 3.14"""

    # Create temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # 1. Path.copy() - Copy files and directories
        def demonstrate_copy():
            """Demonstrate the new copy method"""
            print("1. Path.copy() Method:")
            print("-" * 30)

            # Create source file
            source_file = temp_path / "source.txt"
            source_file.write_text("This is source content")

            # Copy file
            dest_file = temp_path / "dest.txt"
            copied_path = source_file.copy(dest_file)

            print(f"Source: {source_file}")
            print(f"Destination: {dest_file}")
            print(f"Copied path: {copied_path}")
            print(f"Content matches: {source_file.read_text() == dest_file.read_text()}")

            # Copy directory
            source_dir = temp_path / "source_dir"
            source_dir.mkdir()
            (source_dir / "file1.txt").write_text("File 1 content")
            (source_dir / "file2.txt").write_text("File 2 content")

            dest_dir = temp_path / "dest_dir"
            copied_dir = source_dir.copy(dest_dir)

            print(f"Source directory: {source_dir}")
            print(f"Destination directory: {dest_dir}")
            print(f"Copied directory: {copied_dir}")
            print(f"Files copied: {list(dest_dir.iterdir())}")

        # 2. Path.move() - Move files and directories
        def demonstrate_move():
            """Demonstrate the new move method"""
            print("\n2. Path.move() Method:")
            print("-" * 30)

            # Create file to move
            source_file = temp_path / "move_source.txt"
            source_file.write_text("This file will be moved")

            # Move file
            dest_file = temp_path / "move_dest.txt"
            moved_path = source_file.move(dest_file)

            print(f"Source: {source_file}")
            print(f"Destination: {dest_file}")
            print(f"Moved path: {moved_path}")
            print(f"Source exists: {source_file.exists()}")
            print(f"Destination exists: {dest_file.exists()}")
            print(f"Content preserved: {dest_file.read_text()}")

            # Move directory
            source_dir = temp_path / "move_source_dir"
            source_dir.mkdir()
            (source_dir / "file.txt").write_text("Directory file")

            dest_dir = temp_path / "move_dest_dir"
            moved_dir = source_dir.move(dest_dir)

            print(f"Source directory: {source_dir}")
            print(f"Destination directory: {dest_dir}")
            print(f"Moved directory: {moved_dir}")
            print(f"Source exists: {source_dir.exists()}")
            print(f"Destination exists: {dest_dir.exists()}")

        # 3. Path.copy_into() - Copy into existing directory
        def demonstrate_copy_into():
            """Demonstrate the new copy_into method"""
            print("\n3. Path.copy_into() Method:")
            print("-" * 30)

            # Create source file
            source_file = temp_path / "copy_into_source.txt"
            source_file.write_text("This will be copied into a directory")

            # Create destination directory
            dest_dir = temp_path / "copy_into_dest"
            dest_dir.mkdir()

            # Copy file into directory
            copied_path = source_file.copy_into(dest_dir)

            print(f"Source: {source_file}")
            print(f"Destination directory: {dest_dir}")
            print(f"Copied path: {copied_path}")
            print(f"Files in destination: {list(dest_dir.iterdir())}")

            # Copy directory into another directory
            source_dir = temp_path / "copy_into_source_dir"
            source_dir.mkdir()
            (source_dir / "nested_file.txt").write_text("Nested file content")

            dest_parent_dir = temp_path / "copy_into_dest_parent"
            dest_parent_dir.mkdir()

            copied_dir_path = source_dir.copy_into(dest_parent_dir)

            print(f"Source directory: {source_dir}")
            print(f"Destination parent: {dest_parent_dir}")
            print(f"Copied directory path: {copied_dir_path}")
            print(f"Contents in destination: {list(dest_parent_dir.iterdir())}")

        # 4. Path.move_into() - Move into existing directory
        def demonstrate_move_into():
            """Demonstrate the new move_into method"""
            print("\n4. Path.move_into() Method:")
            print("-" * 30)

            # Create source file
            source_file = temp_path / "move_into_source.txt"
            source_file.write_text("This will be moved into a directory")

            # Create destination directory
            dest_dir = temp_path / "move_into_dest"
            dest_dir.mkdir()

            # Move file into directory
            moved_path = source_file.move_into(dest_dir)

            print(f"Source: {source_file}")
            print(f"Destination directory: {dest_dir}")
            print(f"Moved path: {moved_path}")
            print(f"Source exists: {source_file.exists()}")
            print(f"Files in destination: {list(dest_dir.iterdir())}")

            # Move directory into another directory
            source_dir = temp_path / "move_into_source_dir"
            source_dir.mkdir()
            (source_dir / "nested_file.txt").write_text("Nested file content")

            dest_parent_dir = temp_path / "move_into_dest_parent"
            dest_parent_dir.mkdir()

            moved_dir_path = source_dir.move_into(dest_parent_dir)

            print(f"Source directory: {source_dir}")
            print(f"Destination parent: {dest_parent_dir}")
            print(f"Moved directory path: {moved_dir_path}")
            print(f"Source exists: {source_dir.exists()}")
            print(f"Contents in destination: {list(dest_parent_dir.iterdir())}")

        # Run all demonstrations
        demonstrate_copy()
        demonstrate_move()
        demonstrate_copy_into()
        demonstrate_move_into()

# Run the demonstration
demonstrate_new_path_methods()
```

### Enhanced File Operations

```python
from pathlib import Path
import tempfile
import time

def enhanced_file_operations():
    """Show enhanced file operations in pathlib"""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # 1. Improved read_bytes() performance
        def demonstrate_read_bytes_improvement():
            """Show improved read_bytes() performance"""
            print("1. Improved read_bytes() Performance:")
            print("-" * 40)

            # Create test file
            test_file = temp_path / "test_file.bin"
            test_data = b"Test data for performance testing" * 1000
            test_file.write_bytes(test_data)

            # Test read_bytes performance
            start_time = time.time()
            for _ in range(1000):
                data = test_file.read_bytes()
            end_time = time.time()

            read_time = end_time - start_time
            print(f"Read {len(test_data)} bytes 1000 times in {read_time:.4f}s")
            print(f"Average read time: {read_time/1000:.6f}s per read")
            print(f"Data integrity: {data == test_data}")

        # 2. Enhanced suffix handling
        def demonstrate_enhanced_suffix_handling():
            """Show enhanced suffix handling"""
            print("\n2. Enhanced Suffix Handling:")
            print("-" * 40)

            # Test single-dot file extensions
            test_paths = [
                "file.txt",
                "file.tar.gz",
                "file.bar.",  # Single dot at end
                "file.bar..",  # Double dot at end
                "file..txt",   # Double dot in middle
            ]

            for path_str in test_paths:
                path = Path(path_str)
                print(f"Path: {path_str}")
                print(f"  Suffix: {path.suffix}")
                print(f"  Suffixes: {path.suffixes}")
                print(f"  Stem: {path.stem}")
                print(f"  Name: {path.name}")
                print()

        # 3. Improved error handling
        def demonstrate_improved_error_handling():
            """Show improved error handling"""
            print("3. Improved Error Handling:")
            print("-" * 40)

            # Test exists() and is_*() methods
            test_path = temp_path / "nonexistent_file.txt"

            print(f"Path: {test_path}")
            print(f"exists(): {test_path.exists()}")
            print(f"is_file(): {test_path.is_file()}")
            print(f"is_dir(): {test_path.is_dir()}")
            print(f"is_symlink(): {test_path.is_symlink()}")

            # Test with_suffix() error handling
            try:
                result = Path("test").with_suffix(None)
                print(f"with_suffix(None): {result}")
            except TypeError as e:
                print(f"with_suffix(None) correctly raises TypeError: {e}")

        # 4. Performance improvements
        def demonstrate_performance_improvements():
            """Show performance improvements"""
            print("\n4. Performance Improvements:")
            print("-" * 40)

            # Test path normalization performance
            test_paths = [
                "a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z",
                "a/../b/../c/../d/../e/../f/../g/../h/../i/../j",
                "a/b/c/../../d/e/f/../../g/h/i/../../j",
            ]

            for path_str in test_paths:
                path = Path(path_str)

                start_time = time.time()
                for _ in range(10000):
                    normalized = path.resolve()
                end_time = time.time()

                print(f"Path: {path_str}")
                print(f"  Normalization time: {(end_time - start_time):.4f}s")
                print(f"  Normalized: {normalized}")
                print()

        # Run all demonstrations
        demonstrate_read_bytes_improvement()
        demonstrate_enhanced_suffix_handling()
        demonstrate_improved_error_handling()
        demonstrate_performance_improvements()

# Run enhanced file operations
enhanced_file_operations()
```

### Path Info and Caching

```python
from pathlib import Path
import tempfile
import os

def path_info_and_caching():
    """Show path info and caching features"""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # 1. Path.info attribute
        def demonstrate_path_info():
            """Show the new Path.info attribute"""
            print("1. Path.info Attribute:")
            print("-" * 30)

            # Create test file
            test_file = temp_path / "info_test.txt"
            test_file.write_text("Test content for info demonstration")

            # Access path info
            path_info = test_file.info

            print(f"Path: {test_file}")
            print(f"Info object: {path_info}")
            print(f"File type: {path_info.file_type}")
            print(f"Is file: {path_info.is_file()}")
            print(f"Is directory: {path_info.is_dir()}")
            print(f"Is symlink: {path_info.is_symlink()}")

            # Test caching
            print("\nCaching test:")
            start_time = time.time()
            for _ in range(1000):
                info = test_file.info
                file_type = info.file_type
            end_time = time.time()

            print(f"Accessed info 1000 times in {end_time - start_time:.4f}s")

        # 2. PathInfo protocol
        def demonstrate_pathinfo_protocol():
            """Show the PathInfo protocol"""
            print("\n2. PathInfo Protocol:")
            print("-" * 30)

            # Create test directory
            test_dir = temp_path / "protocol_test"
            test_dir.mkdir()

            # Create files in directory
            (test_dir / "file1.txt").write_text("File 1")
            (test_dir / "file2.txt").write_text("File 2")
            (test_dir / "subdir").mkdir()

            # Test PathInfo protocol
            for item in test_dir.iterdir():
                info = item.info
                print(f"Item: {item.name}")
                print(f"  Type: {info.file_type}")
                print(f"  Is file: {info.is_file()}")
                print(f"  Is directory: {info.is_dir()}")
                print()

        # 3. Caching behavior
        def demonstrate_caching_behavior():
            """Show caching behavior"""
            print("3. Caching Behavior:")
            print("-" * 30)

            # Create test file
            test_file = temp_path / "cache_test.txt"
            test_file.write_text("Cache test content")

            # Test caching
            print("First access:")
            start_time = time.time()
            info1 = test_file.info
            end_time = time.time()
            print(f"Time: {end_time - start_time:.6f}s")

            print("Second access (should be cached):")
            start_time = time.time()
            info2 = test_file.info
            end_time = time.time()
            print(f"Time: {end_time - start_time:.6f}s")

            print(f"Same object: {info1 is info2}")

            # Test cache invalidation
            print("\nAfter file modification:")
            test_file.write_text("Modified content")

            start_time = time.time()
            info3 = test_file.info
            end_time = time.time()
            print(f"Time: {end_time - start_time:.6f}s")

            print(f"New object after modification: {info1 is not info3}")

        # Run all demonstrations
        demonstrate_path_info()
        demonstrate_pathinfo_protocol()
        demonstrate_caching_behavior()

# Run path info and caching
path_info_and_caching()
```

### Advanced Path Operations

```python
from pathlib import Path
import tempfile
import shutil

def advanced_path_operations():
    """Show advanced path operations"""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # 1. Batch operations
        def demonstrate_batch_operations():
            """Show batch path operations"""
            print("1. Batch Operations:")
            print("-" * 30)

            # Create multiple files
            files = []
            for i in range(5):
                file_path = temp_path / f"batch_file_{i}.txt"
                file_path.write_text(f"Content of file {i}")
                files.append(file_path)

            # Batch copy
            dest_dir = temp_path / "batch_dest"
            dest_dir.mkdir()

            copied_files = []
            for file_path in files:
                copied_path = file_path.copy_into(dest_dir)
                copied_files.append(copied_path)

            print(f"Original files: {[f.name for f in files]}")
            print(f"Copied files: {[f.name for f in copied_files]}")
            print(f"Files in destination: {[f.name for f in dest_dir.iterdir()]}")

        # 2. Error handling in operations
        def demonstrate_error_handling():
            """Show error handling in path operations"""
            print("\n2. Error Handling:")
            print("-" * 30)

            # Test copy to existing file
            source_file = temp_path / "source.txt"
            source_file.write_text("Source content")

            dest_file = temp_path / "dest.txt"
            dest_file.write_text("Existing content")

            try:
                copied_path = source_file.copy(dest_file)
                print(f"Copy succeeded: {copied_path}")
            except FileExistsError as e:
                print(f"Copy failed (expected): {e}")

            # Test move to existing file
            try:
                moved_path = source_file.move(dest_file)
                print(f"Move succeeded: {moved_path}")
            except FileExistsError as e:
                print(f"Move failed (expected): {e}")

            # Test copy to non-existent directory
            try:
                nonexistent_dir = temp_path / "nonexistent" / "subdir"
                copied_path = source_file.copy_into(nonexistent_dir)
                print(f"Copy to nonexistent dir succeeded: {copied_path}")
            except FileNotFoundError as e:
                print(f"Copy to nonexistent dir failed (expected): {e}")

        # 3. Performance comparison
        def demonstrate_performance_comparison():
            """Show performance comparison with shutil"""
            print("\n3. Performance Comparison:")
            print("-" * 30)

            import time

            # Create test file
            test_file = temp_path / "perf_test.txt"
            test_file.write_text("Performance test content" * 1000)

            # Test pathlib.copy()
            start_time = time.time()
            for i in range(100):
                dest_file = temp_path / f"pathlib_copy_{i}.txt"
                test_file.copy(dest_file)
            end_time = time.time()
            pathlib_time = end_time - start_time

            # Test shutil.copy2()
            start_time = time.time()
            for i in range(100):
                dest_file = temp_path / f"shutil_copy_{i}.txt"
                shutil.copy2(test_file, dest_file)
            end_time = time.time()
            shutil_time = end_time - start_time

            print(f"Pathlib.copy() time: {pathlib_time:.4f}s")
            print(f"Shutil.copy2() time: {shutil_time:.4f}s")
            print(f"Pathlib is {shutil_time/pathlib_time:.2f}x faster")

        # 4. Complex operations
        def demonstrate_complex_operations():
            """Show complex path operations"""
            print("\n4. Complex Operations:")
            print("-" * 30)

            # Create complex directory structure
            base_dir = temp_path / "complex_structure"
            base_dir.mkdir()

            # Create subdirectories and files
            (base_dir / "dir1").mkdir()
            (base_dir / "dir2").mkdir()
            (base_dir / "dir1" / "subdir1").mkdir()
            (base_dir / "dir1" / "subdir2").mkdir()

            # Create files
            (base_dir / "file1.txt").write_text("File 1")
            (base_dir / "dir1" / "file2.txt").write_text("File 2")
            (base_dir / "dir1" / "subdir1" / "file3.txt").write_text("File 3")
            (base_dir / "dir2" / "file4.txt").write_text("File 4")

            # Copy entire structure
            dest_base = temp_path / "copied_structure"
            copied_base = base_dir.copy(dest_base)

            print(f"Original structure: {base_dir}")
            print(f"Copied structure: {copied_base}")

            # Verify structure
            def count_files(path):
                count = 0
                for item in path.rglob("*"):
                    if item.is_file():
                        count += 1
                return count

            original_count = count_files(base_dir)
            copied_count = count_files(copied_base)

            print(f"Original files: {original_count}")
            print(f"Copied files: {copied_count}")
            print(f"Structure copied correctly: {original_count == copied_count}")

        # Run all demonstrations
        demonstrate_batch_operations()
        demonstrate_error_handling()
        demonstrate_performance_comparison()
        demonstrate_complex_operations()

# Run advanced path operations
advanced_path_operations()
```

### Real-world Usage Examples

```python
from pathlib import Path
import tempfile
import json
import shutil

def real_world_usage_examples():
    """Show real-world usage examples"""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # 1. File backup system
        def file_backup_system():
            """Implement a file backup system"""
            print("1. File Backup System:")
            print("-" * 30)

            # Create source files
            source_dir = temp_path / "source"
            source_dir.mkdir()

            (source_dir / "document1.txt").write_text("Important document 1")
            (source_dir / "document2.txt").write_text("Important document 2")
            (source_dir / "config.json").write_text(json.dumps({"setting": "value"}))

            # Create backup directory
            backup_dir = temp_path / "backup"
            backup_dir.mkdir()

            # Backup files
            for file_path in source_dir.iterdir():
                if file_path.is_file():
                    backup_path = backup_dir / f"{file_path.name}.backup"
                    file_path.copy(backup_path)
                    print(f"Backed up: {file_path.name} -> {backup_path.name}")

            print(f"Backup complete. Files in backup: {[f.name for f in backup_dir.iterdir()]}")

        # 2. File organization system
        def file_organization_system():
            """Implement a file organization system"""
            print("\n2. File Organization System:")
            print("-" * 30)

            # Create unorganized files
            unorganized_dir = temp_path / "unorganized"
            unorganized_dir.mkdir()

            files = [
                "document1.pdf",
                "image1.jpg",
                "document2.docx",
                "image2.png",
                "spreadsheet1.xlsx",
                "image3.gif"
            ]

            for filename in files:
                (unorganized_dir / filename).write_text(f"Content of {filename}")

            # Create organized directory structure
            organized_dir = temp_path / "organized"
            organized_dir.mkdir()

            (organized_dir / "documents").mkdir()
            (organized_dir / "images").mkdir()
            (organized_dir / "spreadsheets").mkdir()

            # Organize files
            for file_path in unorganized_dir.iterdir():
                if file_path.is_file():
                    suffix = file_path.suffix.lower()

                    if suffix in ['.pdf', '.docx', '.txt']:
                        dest_dir = organized_dir / "documents"
                    elif suffix in ['.jpg', '.png', '.gif']:
                        dest_dir = organized_dir / "images"
                    elif suffix in ['.xlsx', '.csv']:
                        dest_dir = organized_dir / "spreadsheets"
                    else:
                        dest_dir = organized_dir / "other"
                        dest_dir.mkdir(exist_ok=True)

                    file_path.move_into(dest_dir)
                    print(f"Moved {file_path.name} to {dest_dir.name}")

            # Show organized structure
            for category_dir in organized_dir.iterdir():
                if category_dir.is_dir():
                    files = [f.name for f in category_dir.iterdir()]
                    print(f"{category_dir.name}: {files}")

        # 3. File synchronization
        def file_synchronization():
            """Implement file synchronization"""
            print("\n3. File Synchronization:")
            print("-" * 30)

            # Create source directory
            source_dir = temp_path / "sync_source"
            source_dir.mkdir()

            (source_dir / "file1.txt").write_text("File 1 content")
            (source_dir / "file2.txt").write_text("File 2 content")
            (source_dir / "subdir").mkdir()
            (source_dir / "subdir" / "file3.txt").write_text("File 3 content")

            # Create destination directory
            dest_dir = temp_path / "sync_dest"
            dest_dir.mkdir()

            # Synchronize files
            def sync_directory(source, destination):
                """Synchronize directory contents"""
                for item in source.iterdir():
                    dest_item = destination / item.name

                    if item.is_file():
                        if not dest_item.exists() or item.stat().st_mtime > dest_item.stat().st_mtime:
                            item.copy(dest_item)
                            print(f"Synced file: {item.name}")
                    elif item.is_dir():
                        if not dest_item.exists():
                            dest_item.mkdir()
                        sync_directory(item, dest_item)

            sync_directory(source_dir, dest_dir)

            # Verify synchronization
            def count_files(path):
                count = 0
                for item in path.rglob("*"):
                    if item.is_file():
                        count += 1
                return count

            source_count = count_files(source_dir)
            dest_count = count_files(dest_dir)

            print(f"Source files: {source_count}")
            print(f"Destination files: {dest_count}")
            print(f"Synchronization successful: {source_count == dest_count}")

        # 4. File migration system
        def file_migration_system():
            """Implement a file migration system"""
            print("\n4. File Migration System:")
            print("-" * 30)

            # Create old structure
            old_structure = temp_path / "old_structure"
            old_structure.mkdir()

            (old_structure / "data1.txt").write_text("Data 1")
            (old_structure / "data2.txt").write_text("Data 2")
            (old_structure / "legacy").mkdir()
            (old_structure / "legacy" / "old_data.txt").write_text("Old data")

            # Create new structure
            new_structure = temp_path / "new_structure"
            new_structure.mkdir()

            (new_structure / "current").mkdir()
            (new_structure / "archive").mkdir()

            # Migrate files
            for item in old_structure.iterdir():
                if item.is_file():
                    # Move current files to current directory
                    item.move_into(new_structure / "current")
                    print(f"Migrated current file: {item.name}")
                elif item.is_dir():
                    # Move legacy directories to archive
                    item.move_into(new_structure / "archive")
                    print(f"Migrated legacy directory: {item.name}")

            # Show new structure
            print("New structure:")
            for item in new_structure.rglob("*"):
                if item.is_file():
                    print(f"  {item.relative_to(new_structure)}")

        # Run all examples
        file_backup_system()
        file_organization_system()
        file_synchronization()
        file_migration_system()

# Run real-world usage examples
real_world_usage_examples()
```

### Performance Optimization

```python
from pathlib import Path
import tempfile
import time
import statistics

def performance_optimization():
    """Show performance optimization techniques"""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # 1. Batch operations optimization
        def batch_operations_optimization():
            """Show batch operations optimization"""
            print("1. Batch Operations Optimization:")
            print("-" * 40)

            # Create test files
            test_files = []
            for i in range(100):
                file_path = temp_path / f"test_file_{i}.txt"
                file_path.write_text(f"Content of file {i}")
                test_files.append(file_path)

            # Test individual operations
            start_time = time.time()
            for file_path in test_files:
                dest_file = temp_path / f"individual_copy_{file_path.name}"
                file_path.copy(dest_file)
            individual_time = time.time() - start_time

            # Test batch operations
            start_time = time.time()
            dest_dir = temp_path / "batch_dest"
            dest_dir.mkdir()

            for file_path in test_files:
                file_path.copy_into(dest_dir)
            batch_time = time.time() - start_time

            print(f"Individual operations time: {individual_time:.4f}s")
            print(f"Batch operations time: {batch_time:.4f}s")
            print(f"Batch operations are {individual_time/batch_time:.2f}x faster")

        # 2. Path caching optimization
        def path_caching_optimization():
            """Show path caching optimization"""
            print("\n2. Path Caching Optimization:")
            print("-" * 40)

            # Create test file
            test_file = temp_path / "cache_test.txt"
            test_file.write_text("Cache test content")

            # Test without caching
            start_time = time.time()
            for _ in range(1000):
                info = test_file.stat()
                is_file = test_file.is_file()
            no_cache_time = time.time() - start_time

            # Test with caching
            start_time = time.time()
            for _ in range(1000):
                info = test_file.info
                is_file = info.is_file()
            cache_time = time.time() - start_time

            print(f"Without caching time: {no_cache_time:.4f}s")
            print(f"With caching time: {cache_time:.4f}s")
            print(f"Caching is {no_cache_time/cache_time:.2f}x faster")

        # 3. Memory usage optimization
        def memory_usage_optimization():
            """Show memory usage optimization"""
            print("\n3. Memory Usage Optimization:")
            print("-" * 40)

            import psutil
            import os

            process = psutil.Process(os.getpid())

            # Test memory usage with large files
            large_file = temp_path / "large_file.txt"
            large_content = "Large file content" * 10000
            large_file.write_text(large_content)

            # Memory before
            memory_before = process.memory_info().rss / 1024 / 1024  # MB

            # Copy large file multiple times
            for i in range(10):
                dest_file = temp_path / f"large_copy_{i}.txt"
                large_file.copy(dest_file)

            # Memory after
            memory_after = process.memory_info().rss / 1024 / 1024  # MB

            print(f"Memory before: {memory_before:.2f} MB")
            print(f"Memory after: {memory_after:.2f} MB")
            print(f"Memory increase: {memory_after - memory_before:.2f} MB")

        # 4. Error handling optimization
        def error_handling_optimization():
            """Show error handling optimization"""
            print("\n4. Error Handling Optimization:")
            print("-" * 40)

            # Test error handling performance
            test_file = temp_path / "error_test.txt"
            test_file.write_text("Error test content")

            # Test with try-except
            start_time = time.time()
            for _ in range(1000):
                try:
                    dest_file = temp_path / "error_dest.txt"
                    test_file.copy(dest_file)
                except FileExistsError:
                    pass
            try_except_time = time.time() - start_time

            # Test with exists() check
            start_time = time.time()
            for _ in range(1000):
                dest_file = temp_path / "error_dest.txt"
                if not dest_file.exists():
                    test_file.copy(dest_file)
            exists_check_time = time.time() - start_time

            print(f"Try-except time: {try_except_time:.4f}s")
            print(f"Exists check time: {exists_check_time:.4f}s")
            print(f"Exists check is {try_except_time/exists_check_time:.2f}x faster")

        # Run all optimizations
        batch_operations_optimization()
        path_caching_optimization()
        memory_usage_optimization()
        error_handling_optimization()

# Run performance optimization
performance_optimization()
```

## Best Practices

### Usage Guidelines

```python
def usage_guidelines():
    """Show usage guidelines for pathlib enhancements"""

    print("Pathlib Enhancement Usage Guidelines:")
    print("=" * 50)

    # 1. Method selection
    def method_selection():
        """Show method selection guidelines"""
        print("1. Method Selection:")
        print("   - Use copy() for simple file copying")
        print("   - Use copy_into() for copying into existing directories")
        print("   - Use move() for moving files/directories")
        print("   - Use move_into() for moving into existing directories")
        print("   - Use info attribute for cached file information")

    # 2. Error handling
    def error_handling():
        """Show error handling guidelines"""
        print("\n2. Error Handling:")
        print("   - Always handle FileExistsError for copy/move operations")
        print("   - Check directory existence before copy_into/move_into")
        print("   - Use try-except blocks for critical operations")
        print("   - Validate paths before operations")

    # 3. Performance tips
    def performance_tips():
        """Show performance tips"""
        print("\n3. Performance Tips:")
        print("   - Use batch operations for multiple files")
        print("   - Use info attribute for repeated file checks")
        print("   - Avoid unnecessary path operations")
        print("   - Use appropriate compression levels")

    # 4. Memory management
    def memory_management():
        """Show memory management tips"""
        print("\n4. Memory Management:")
        print("   - Process large files in chunks")
        print("   - Use streaming operations for large datasets")
        print("   - Clean up temporary files promptly")
        print("   - Monitor memory usage in production")

    # Print all guidelines
    method_selection()
    error_handling()
    performance_tips()
    memory_management()

# Run usage guidelines
usage_guidelines()
```

## Summary

Python 3.14's pathlib enhancements provide:

### Key Features

- **New file operations**: `copy()`, `move()`, `copy_into()`, `move_into()`
- **Enhanced suffix handling**: Better support for single-dot extensions
- **Path info caching**: `info` attribute for cached file information
- **Performance improvements**: Faster path operations and file I/O
- **Better error handling**: More consistent error behavior

### New Methods

- **`Path.copy()`**: Copy files and directories
- **`Path.move()`**: Move files and directories
- **`Path.copy_into()`**: Copy into existing directories
- **`Path.move_into()`**: Move into existing directories
- **`Path.info`**: Cached file information with `PathInfo` protocol

### Performance Benefits

- **Faster file operations** with optimized implementations
- **Better memory efficiency** for large file operations
- **Improved path normalization** performance
- **Enhanced caching** for repeated file system queries
- **Optimized batch operations** for multiple files

### Use Cases

- **File backup systems** with efficient copying
- **File organization** and migration tools
- **File synchronization** between directories
- **Batch file processing** with improved performance
- **File system utilities** with better error handling

### Best Practices

- **Choose appropriate methods** for your use case
- **Handle errors gracefully** with proper exception handling
- **Use batch operations** for multiple files
- **Leverage caching** with the `info` attribute
- **Monitor performance** in production environments

The pathlib enhancements in Python 3.14 make file system operations more powerful, efficient, and easier to use while maintaining full backward compatibility with existing code.
