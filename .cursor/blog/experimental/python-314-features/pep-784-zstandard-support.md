# PEP 784: Zstandard Support in Standard Library

## Overview

PEP 784 introduces the `compression.zstd` module in Python 3.14, providing native support for Zstandard compression in the standard library. Zstandard (zstd) is a fast lossless compression algorithm that offers better compression ratios and faster decompression compared to traditional compression methods like gzip.

## The Problem with Current Compression

### Limited Compression Options

Python's standard library previously only included basic compression algorithms:

```python
# Python 3.13 - Limited compression options
import gzip
import bz2
import lzma
import time

def compress_with_gzip(data):
    """Compress data with gzip"""
    start_time = time.time()
    compressed = gzip.compress(data)
    compression_time = time.time() - start_time
    return compressed, compression_time

def compress_with_bz2(data):
    """Compress data with bz2"""
    start_time = time.time()
    compressed = bz2.compress(data)
    compression_time = time.time() - start_time
    return compressed, compression_time

def compress_with_lzma(data):
    """Compress data with lzma"""
    start_time = time.time()
    compressed = lzma.compress(data)
    compression_time = time.time() - start_time
    return compressed, compression_time

# Test with sample data
sample_data = b"This is a sample data string that we want to compress. " * 1000

gzip_result, gzip_time = compress_with_gzip(sample_data)
bz2_result, bz2_time = compress_with_bz2(sample_data)
lzma_result, lzma_time = compress_with_lzma(sample_data)

print(f"Gzip: {len(gzip_result)} bytes, {gzip_time:.4f}s")
print(f"Bz2: {len(bz2_result)} bytes, {bz2_time:.4f}s")
print(f"Lzma: {len(lzma_result)} bytes, {lzma_time:.4f}s")
```

### Performance Limitations

```python
# Performance comparison of existing compression methods
import gzip
import bz2
import lzma
import time
import json

def benchmark_compression():
    """Benchmark different compression methods"""

    # Create test data
    test_data = {
        "users": [
            {"id": i, "name": f"User {i}", "email": f"user{i}@example.com"}
            for i in range(10000)
        ]
    }
    data = json.dumps(test_data).encode('utf-8')

    print(f"Original data size: {len(data)} bytes")

    # Test gzip
    start_time = time.time()
    gzip_compressed = gzip.compress(data)
    gzip_time = time.time() - start_time

    # Test bz2
    start_time = time.time()
    bz2_compressed = bz2.compress(data)
    bz2_time = time.time() - start_time

    # Test lzma
    start_time = time.time()
    lzma_compressed = lzma.compress(data)
    lzma_time = time.time() - start_time

    print(f"\nCompression Results:")
    print(f"Gzip: {len(gzip_compressed)} bytes ({len(gzip_compressed)/len(data)*100:.1f}%), {gzip_time:.4f}s")
    print(f"Bz2: {len(bz2_compressed)} bytes ({len(bz2_compressed)/len(data)*100:.1f}%), {bz2_time:.4f}s")
    print(f"Lzma: {len(lzma_compressed)} bytes ({len(lzma_compressed)/len(data)*100:.1f}%), {lzma_time:.4f}s")

benchmark_compression()
```

## PEP 784 Solution: Zstandard Support

### Basic Usage

```python
# Python 3.14 - Zstandard compression
import compression.zstd as zstd
import time

def compress_with_zstd(data):
    """Compress data with Zstandard"""
    start_time = time.time()
    compressed = zstd.compress(data)
    compression_time = time.time() - start_time
    return compressed, compression_time

def decompress_with_zstd(compressed_data):
    """Decompress data with Zstandard"""
    start_time = time.time()
    decompressed = zstd.decompress(compressed_data)
    decompression_time = time.time() - start_time
    return decompressed, decompression_time

# Test with sample data
sample_data = b"This is a sample data string that we want to compress. " * 1000

# Compress
compressed, compress_time = compress_with_zstd(sample_data)
print(f"Zstd compression: {len(compressed)} bytes, {compress_time:.4f}s")

# Decompress
decompressed, decompress_time = decompress_with_zstd(compressed)
print(f"Zstd decompression: {decompress_time:.4f}s")
print(f"Data integrity: {sample_data == decompressed}")
```

### Advanced Compression Options

```python
import compression.zstd as zstd
import time

def advanced_zstd_compression():
    """Demonstrate advanced Zstandard compression options"""

    # Sample data
    data = b"Sample data for compression testing. " * 1000

    # Different compression levels
    compression_levels = [1, 3, 6, 9, 12, 15, 18, 21]

    print("Compression Level Comparison:")
    print("Level | Size (bytes) | Ratio | Time (s)")
    print("-" * 40)

    for level in compression_levels:
        start_time = time.time()
        compressed = zstd.compress(data, level=level)
        compression_time = time.time() - start_time

        ratio = len(compressed) / len(data) * 100
        print(f"{level:5d} | {len(compressed):11d} | {ratio:5.1f}% | {compression_time:.4f}")

    # Custom compression options
    print("\nCustom Compression Options:")

    # Fast compression
    start_time = time.time()
    fast_compressed = zstd.compress(data, level=1, threads=4)
    fast_time = time.time() - start_time
    print(f"Fast compression: {len(fast_compressed)} bytes, {fast_time:.4f}s")

    # High compression
    start_time = time.time()
    high_compressed = zstd.compress(data, level=22, threads=4)
    high_time = time.time() - start_time
    print(f"High compression: {len(high_compressed)} bytes, {high_time:.4f}s")

advanced_zstd_compression()
```

### Streaming Compression

```python
import compression.zstd as zstd
import io

def streaming_compression():
    """Demonstrate streaming compression and decompression"""

    # Create a large dataset
    large_data = b"Large dataset for streaming compression. " * 10000

    # Streaming compression
    print("Streaming Compression:")

    # Compress in chunks
    chunk_size = 1024
    compressed_chunks = []

    start_time = time.time()
    for i in range(0, len(large_data), chunk_size):
        chunk = large_data[i:i + chunk_size]
        compressed_chunk = zstd.compress(chunk)
        compressed_chunks.append(compressed_chunk)
    compression_time = time.time() - start_time

    # Combine compressed chunks
    compressed_data = b''.join(compressed_chunks)

    print(f"Original size: {len(large_data)} bytes")
    print(f"Compressed size: {len(compressed_data)} bytes")
    print(f"Compression ratio: {len(compressed_data)/len(large_data)*100:.1f}%")
    print(f"Compression time: {compression_time:.4f}s")

    # Streaming decompression
    print("\nStreaming Decompression:")

    start_time = time.time()
    decompressed_chunks = []
    for compressed_chunk in compressed_chunks:
        decompressed_chunk = zstd.decompress(compressed_chunk)
        decompressed_chunks.append(decompressed_chunk)
    decompression_time = time.time() - start_time

    # Combine decompressed chunks
    decompressed_data = b''.join(decompressed_chunks)

    print(f"Decompression time: {decompression_time:.4f}s")
    print(f"Data integrity: {large_data == decompressed_data}")

streaming_compression()
```

## Performance Comparison

### Comprehensive Benchmark

```python
import compression.zstd as zstd
import gzip
import bz2
import lzma
import time
import json

def comprehensive_compression_benchmark():
    """Comprehensive benchmark of all compression methods"""

    # Create test datasets
    datasets = {
        "JSON": json.dumps({"data": [{"id": i, "value": f"item_{i}"} for i in range(10000)]}).encode('utf-8'),
        "Text": b"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 1000,
        "Binary": b'\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f' * 1000,
        "Repeated": b"AAAA" * 10000,
    }

    compression_methods = {
        "Gzip": gzip.compress,
        "Bz2": bz2.compress,
        "Lzma": lzma.compress,
        "Zstd (Level 1)": lambda data: zstd.compress(data, level=1),
        "Zstd (Level 6)": lambda data: zstd.compress(data, level=6),
        "Zstd (Level 15)": lambda data: zstd.compress(data, level=15),
        "Zstd (Level 22)": lambda data: zstd.compress(data, level=22),
    }

    decompression_methods = {
        "Gzip": gzip.decompress,
        "Bz2": bz2.decompress,
        "Lzma": lzma.decompress,
        "Zstd (Level 1)": zstd.decompress,
        "Zstd (Level 6)": zstd.decompress,
        "Zstd (Level 15)": zstd.decompress,
        "Zstd (Level 22)": zstd.decompress,
    }

    for dataset_name, data in datasets.items():
        print(f"\n{dataset_name} Dataset ({len(data)} bytes):")
        print("Method           | Size (bytes) | Ratio | Compress (s) | Decompress (s)")
        print("-" * 70)

        for method_name, compress_func in compression_methods.items():
            # Compression
            start_time = time.time()
            compressed = compress_func(data)
            compression_time = time.time() - start_time

            # Decompression
            decompress_func = decompression_methods[method_name]
            start_time = time.time()
            decompressed = decompress_func(compressed)
            decompression_time = time.time() - start_time

            # Verify integrity
            assert data == decompressed, f"Data integrity failed for {method_name}"

            ratio = len(compressed) / len(data) * 100
            print(f"{method_name:15s} | {len(compressed):11d} | {ratio:5.1f}% | {compression_time:11.4f} | {decompression_time:13.4f}")

comprehensive_compression_benchmark()
```

### Real-World Performance Test

```python
import compression.zstd as zstd
import gzip
import time
import os

def real_world_performance_test():
    """Test performance with real-world data"""

    # Create realistic test data
    def create_test_data():
        data = {
            "users": [
                {
                    "id": i,
                    "name": f"User {i}",
                    "email": f"user{i}@example.com",
                    "profile": {
                        "age": 20 + (i % 50),
                        "city": f"City {i % 100}",
                        "interests": [f"interest_{j}" for j in range(i % 5)]
                    }
                }
                for i in range(50000)
            ],
            "metadata": {
                "created": "2024-01-15T10:30:00Z",
                "version": "1.0.0",
                "source": "database_export"
            }
        }
        return json.dumps(data, indent=2).encode('utf-8')

    data = create_test_data()
    print(f"Test data size: {len(data)} bytes")

    # Test different compression methods
    methods = [
        ("Gzip", gzip.compress, gzip.decompress),
        ("Zstd Fast", lambda d: zstd.compress(d, level=1), zstd.decompress),
        ("Zstd Balanced", lambda d: zstd.compress(d, level=6), zstd.decompress),
        ("Zstd High", lambda d: zstd.compress(d, level=15), zstd.decompress),
    ]

    print("\nReal-World Performance Test:")
    print("Method        | Size (bytes) | Ratio | Compress (s) | Decompress (s) | Total (s)")
    print("-" * 80)

    for method_name, compress_func, decompress_func in methods:
        # Compression
        start_time = time.time()
        compressed = compress_func(data)
        compression_time = time.time() - start_time

        # Decompression
        start_time = time.time()
        decompressed = decompress_func(compressed)
        decompression_time = time.time() - start_time

        total_time = compression_time + decompression_time
        ratio = len(compressed) / len(data) * 100

        print(f"{method_name:12s} | {len(compressed):11d} | {ratio:5.1f}% | {compression_time:11.4f} | {decompression_time:13.4f} | {total_time:8.4f}")

real_world_performance_test()
```

## Real-World Use Cases

### File Compression

```python
import compression.zstd as zstd
import os
import time

def compress_file(input_path, output_path, compression_level=6):
    """Compress a file using Zstandard"""

    print(f"Compressing {input_path} to {output_path}")

    # Read input file
    with open(input_path, 'rb') as f:
        data = f.read()

    original_size = len(data)
    print(f"Original size: {original_size} bytes")

    # Compress
    start_time = time.time()
    compressed = zstd.compress(data, level=compression_level)
    compression_time = time.time() - start_time

    # Write compressed file
    with open(output_path, 'wb') as f:
        f.write(compressed)

    compressed_size = len(compressed)
    ratio = compressed_size / original_size * 100

    print(f"Compressed size: {compressed_size} bytes")
    print(f"Compression ratio: {ratio:.1f}%")
    print(f"Compression time: {compression_time:.4f}s")

    return compressed_size, compression_time

def decompress_file(input_path, output_path):
    """Decompress a file using Zstandard"""

    print(f"Decompressing {input_path} to {output_path}")

    # Read compressed file
    with open(input_path, 'rb') as f:
        compressed_data = f.read()

    compressed_size = len(compressed_data)
    print(f"Compressed size: {compressed_size} bytes")

    # Decompress
    start_time = time.time()
    decompressed = zstd.decompress(compressed_data)
    decompression_time = time.time() - start_time

    # Write decompressed file
    with open(output_path, 'wb') as f:
        f.write(decompressed)

    decompressed_size = len(decompressed)
    print(f"Decompressed size: {decompressed_size} bytes")
    print(f"Decompression time: {decompression_time:.4f}s")

    return decompressed_size, decompression_time

# Example usage
def file_compression_example():
    # Create a test file
    test_data = b"Test data for file compression. " * 10000
    with open("test_input.txt", "wb") as f:
        f.write(test_data)

    # Compress
    compress_file("test_input.txt", "test_output.zst", compression_level=6)

    # Decompress
    decompress_file("test_output.zst", "test_decompressed.txt")

    # Verify integrity
    with open("test_input.txt", "rb") as f:
        original = f.read()
    with open("test_decompressed.txt", "rb") as f:
        decompressed = f.read()

    print(f"Data integrity: {original == decompressed}")

    # Clean up
    os.remove("test_input.txt")
    os.remove("test_output.zst")
    os.remove("test_decompressed.txt")

file_compression_example()
```

### Network Data Compression

```python
import compression.zstd as zstd
import socket
import time

def network_compression_example():
    """Example of using Zstandard for network data compression"""

    # Simulate network data
    network_data = {
        "timestamp": time.time(),
        "data": [{"id": i, "value": f"network_data_{i}"} for i in range(1000)],
        "metadata": {"source": "sensor", "type": "telemetry"}
    }

    data_json = json.dumps(network_data).encode('utf-8')
    print(f"Original network data: {len(data_json)} bytes")

    # Compress for transmission
    start_time = time.time()
    compressed = zstd.compress(data_json, level=3)  # Fast compression for real-time
    compression_time = time.time() - start_time

    print(f"Compressed data: {len(compressed)} bytes")
    print(f"Compression ratio: {len(compressed)/len(data_json)*100:.1f}%")
    print(f"Compression time: {compression_time:.4f}s")

    # Simulate network transmission
    print(f"Network savings: {len(data_json) - len(compressed)} bytes")

    # Decompress on receiving end
    start_time = time.time()
    decompressed = zstd.decompress(compressed)
    decompression_time = time.time() - start_time

    print(f"Decompression time: {decompression_time:.4f}s")
    print(f"Data integrity: {data_json == decompressed}")

network_compression_example()
```

### Database Backup Compression

```python
import compression.zstd as zstd
import time
import json

def database_backup_compression():
    """Example of using Zstandard for database backup compression"""

    # Simulate database backup data
    backup_data = {
        "tables": {
            "users": [
                {"id": i, "name": f"User {i}", "email": f"user{i}@example.com"}
                for i in range(100000)
            ],
            "orders": [
                {"id": i, "user_id": i % 100000, "amount": 100 + (i % 1000)}
                for i in range(500000)
            ],
            "products": [
                {"id": i, "name": f"Product {i}", "price": 10 + (i % 100)}
                for i in range(10000)
            ]
        },
        "metadata": {
            "backup_date": "2024-01-15T10:30:00Z",
            "database_version": "1.0.0",
            "total_records": 610000
        }
    }

    # Convert to JSON
    backup_json = json.dumps(backup_data, indent=2).encode('utf-8')
    original_size = len(backup_json)
    print(f"Original backup size: {original_size} bytes ({original_size/1024/1024:.1f} MB)")

    # Test different compression levels for backup
    compression_levels = [1, 6, 15, 22]

    print("\nBackup Compression Results:")
    print("Level | Size (MB) | Ratio | Compress (s) | Decompress (s)")
    print("-" * 55)

    for level in compression_levels:
        # Compression
        start_time = time.time()
        compressed = zstd.compress(backup_json, level=level)
        compression_time = time.time() - start_time

        # Decompression
        start_time = time.time()
        decompressed = zstd.decompress(compressed)
        decompression_time = time.time() - start_time

        compressed_size_mb = len(compressed) / 1024 / 1024
        ratio = len(compressed) / original_size * 100

        print(f"{level:5d} | {compressed_size_mb:8.1f} | {ratio:5.1f}% | {compression_time:11.4f} | {decompression_time:13.4f}")

    # Verify integrity
    print(f"\nData integrity: {backup_json == decompressed}")

database_backup_compression()
```

## Best Practices

### 1. Choose Appropriate Compression Level

```python
import compression.zstd as zstd
import time

def choose_compression_level():
    """Guide for choosing appropriate compression level"""

    data = b"Sample data for compression level selection. " * 1000

    # Real-time applications (low latency)
    print("Real-time applications (low latency):")
    start_time = time.time()
    fast_compressed = zstd.compress(data, level=1)
    fast_time = time.time() - start_time
    print(f"Level 1: {len(fast_compressed)} bytes, {fast_time:.4f}s")

    # Balanced applications
    print("\nBalanced applications:")
    start_time = time.time()
    balanced_compressed = zstd.compress(data, level=6)
    balanced_time = time.time() - start_time
    print(f"Level 6: {len(balanced_compressed)} bytes, {balanced_time:.4f}s")

    # Storage applications (high compression)
    print("\nStorage applications (high compression):")
    start_time = time.time()
    high_compressed = zstd.compress(data, level=15)
    high_time = time.time() - start_time
    print(f"Level 15: {len(high_compressed)} bytes, {high_time:.4f}s")

    # Archive applications (maximum compression)
    print("\nArchive applications (maximum compression):")
    start_time = time.time()
    max_compressed = zstd.compress(data, level=22)
    max_time = time.time() - start_time
    print(f"Level 22: {len(max_compressed)} bytes, {max_time:.4f}s")

choose_compression_level()
```

### 2. Use Multi-threading for Large Data

```python
import compression.zstd as zstd
import threading
import time

def multi_threaded_compression():
    """Use multi-threading for large data compression"""

    # Large dataset
    large_data = b"Large dataset for multi-threaded compression. " * 100000

    # Single-threaded compression
    start_time = time.time()
    single_compressed = zstd.compress(large_data, level=6)
    single_time = time.time() - start_time

    # Multi-threaded compression
    start_time = time.time()
    multi_compressed = zstd.compress(large_data, level=6, threads=4)
    multi_time = time.time() - start_time

    print(f"Single-threaded: {single_time:.4f}s")
    print(f"Multi-threaded: {multi_time:.4f}s")
    print(f"Speedup: {single_time/multi_time:.2f}x")

    # Verify results are identical
    print(f"Results identical: {single_compressed == multi_compressed}")

multi_threaded_compression()
```

### 3. Error Handling

```python
import compression.zstd as zstd
import time

def safe_compression():
    """Safe compression with error handling"""

    data = b"Data to compress safely"

    try:
        # Compression with error handling
        compressed = zstd.compress(data, level=6)
        print(f"Compression successful: {len(compressed)} bytes")

        # Decompression with error handling
        decompressed = zstd.decompress(compressed)
        print(f"Decompression successful: {len(decompressed)} bytes")

        # Verify integrity
        if data == decompressed:
            print("Data integrity verified")
        else:
            print("Data integrity check failed")

    except zstd.ZstdError as e:
        print(f"Zstandard error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

safe_compression()
```

## Common Pitfalls

### 1. Over-compression

```python
# Bad: Using maximum compression for real-time applications
def bad_compression():
    data = b"Real-time data"
    compressed = zstd.compress(data, level=22)  # Too slow for real-time
    return compressed

# Good: Use appropriate compression level
def good_compression():
    data = b"Real-time data"
    compressed = zstd.compress(data, level=1)  # Fast compression
    return compressed
```

### 2. Memory Usage

```python
# Bad: Loading entire file into memory
def bad_file_compression(filename):
    with open(filename, 'rb') as f:
        data = f.read()  # Loads entire file into memory
    return zstd.compress(data)

# Good: Stream compression for large files
def good_file_compression(filename):
    compressed_chunks = []
    chunk_size = 1024 * 1024  # 1MB chunks

    with open(filename, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            compressed_chunk = zstd.compress(chunk)
            compressed_chunks.append(compressed_chunk)

    return b''.join(compressed_chunks)
```

### 3. Compression Level Selection

```python
# Bad: Always using default compression level
def bad_compression_level(data):
    return zstd.compress(data)  # Uses default level

# Good: Choose compression level based on use case
def good_compression_level(data, use_case):
    if use_case == "real-time":
        return zstd.compress(data, level=1)
    elif use_case == "balanced":
        return zstd.compress(data, level=6)
    elif use_case == "storage":
        return zstd.compress(data, level=15)
    else:
        return zstd.compress(data, level=6)  # Default
```

## Migration Guide

### From Third-Party Libraries

```python
# Old: Using third-party zstd library
# import zstandard as zstd
# compressed = zstd.compress(data)

# New: Using standard library
import compression.zstd as zstd
compressed = zstd.compress(data)
```

### From Other Compression Methods

```python
# Old: Using gzip for everything
import gzip
compressed = gzip.compress(data)

# New: Using Zstandard for better performance
import compression.zstd as zstd
compressed = zstd.compress(data, level=6)  # Better compression and speed
```

## Conclusion

PEP 784 introduces Zstandard compression to Python's standard library, providing:

- **Better Performance**: Faster compression and decompression than traditional methods
- **Better Compression**: Higher compression ratios than gzip
- **Flexibility**: Multiple compression levels for different use cases
- **Multi-threading**: Support for parallel compression
- **Standard Library**: No need for third-party dependencies

This enhancement makes Python more competitive for data-intensive applications while providing a modern, efficient compression solution.

## References

- [PEP 784: Zstandard Support](https://peps.python.org/pep-0784/)
- [Python 3.14 What's New](https://docs.python.org/3.14/whatsnew/3.14.html)
- [compression.zstd Documentation](https://docs.python.org/3.14/library/compression.zstd.html)
- [Zstandard Official Website](https://facebook.github.io/zstd/)
