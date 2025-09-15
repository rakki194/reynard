# Shell Script Optimization Patterns

> Advanced patterns for high-performance, efficient shell scripts

## Performance Principles

### The Optimization Hierarchy

1. **Algorithm Efficiency**: Choose the right approach
2. **I/O Optimization**: Minimize disk and network operations
3. **Process Management**: Reduce subprocess creation
4. **Memory Usage**: Efficient data structures
5. **Code Clarity**: Maintainable optimizations

### Essential Performance Setup

```bash
#!/bin/bash

# Performance-oriented setup
set -e
set -u
set -o pipefail

# Disable unnecessary features for performance
unset HISTFILE
unset HISTSIZE
unset SAVEHIST
```

## I/O Optimization Patterns

### Pattern 1: Batch File Operations

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Multiple individual operations
echo "Header" >> output.txt
echo "Line 1" >> output.txt
echo "Line 2" >> output.txt
echo "Footer" >> output.txt

# ✅ Efficient: Single batch operation
{
    echo "Header"
    echo "Line 1"
    echo "Line 2"
    echo "Footer"
} >> output.txt

# ✅ Most efficient: Here document
cat >> output.txt << EOF
Header
Line 1
Line 2
Footer
EOF
```

### Pattern 2: Minimize File Opens

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Multiple file opens
for file in *.txt; do
    echo "Processing: $file" >> log.txt
    wc -l "$file" >> log.txt
done

# ✅ Efficient: Single file open
{
    for file in *.txt; do
        echo "Processing: $file"
        wc -l "$file"
    done
} >> log.txt
```

### Pattern 3: Efficient File Reading

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Multiple cat calls
file1_content=$(cat file1.txt)
file2_content=$(cat file2.txt)
file3_content=$(cat file3.txt)

# ✅ Efficient: Single read operation
{
    file1_content=$(cat file1.txt)
    file2_content=$(cat file2.txt)
    file3_content=$(cat file3.txt)
} 2>/dev/null

# ✅ Most efficient: Parallel reading
(
    file1_content=$(cat file1.txt) &
    file2_content=$(cat file2.txt) &
    file3_content=$(cat file3.txt) &
    wait
)
```

## Process Optimization Patterns

### Pattern 1: Command Caching

```bash
#!/bin/bash
set -e

# ✅ Cache expensive commands
declare -A command_cache

cached_command() {
    local command="$1"
    local cache_key="${command//[^a-zA-Z0-9]/_}"

    if [[ -z "${command_cache[${cache_key}]:-}" ]]; then
        command_cache[${cache_key}]=$(${command})
    fi

    echo "${command_cache[${cache_key}]}"
}

# Usage
hostname=$(cached_command "hostname")
date_info=$(cached_command "date")
```

### Pattern 2: Parallel Processing

```bash
#!/bin/bash
set -e

# ✅ Parallel file processing
process_files_parallel() {
    local files=("$@")
    local max_jobs=4
    local job_count=0

    for file in "${files[@]}"; do
        # Wait if we've reached max jobs
        while [[ ${job_count} -ge ${max_jobs} ]]; do
            wait -n  # Wait for any job to complete
            ((job_count--))
        done

        # Start background job
        process_file "${file}" &
        ((job_count++))
    done

    # Wait for all remaining jobs
    wait
}

process_file() {
    local file="$1"
    echo "Processing: ${file}"
    # Simulate processing
    sleep 1
    echo "Completed: ${file}"
}
```

### Pattern 3: Efficient Command Chaining

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Multiple pipeline stages
files=$(find . -name "*.txt")
filtered=$(echo "$files" | grep -v "temp")
sorted=$(echo "$filtered" | sort)
count=$(echo "$sorted" | wc -l)

# ✅ Efficient: Single pipeline
count=$(find . -name "*.txt" | grep -v "temp" | sort | wc -l)

# ✅ Most efficient: Combined operations
count=$(find . -name "*.txt" -not -name "*temp*" | wc -l)
```

## Memory Optimization Patterns

### Pattern 1: Efficient String Operations

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Multiple string operations
result=""
for item in "${items[@]}"; do
    result="${result}${item},"
done
result="${result%,}"  # Remove trailing comma

# ✅ Efficient: Built-in join
IFS=','
result="${items[*]}"
unset IFS

# ✅ Most efficient: printf
printf -v result '%s,' "${items[@]}"
result="${result%,}"
```

### Pattern 2: Array Optimization

```bash
#!/bin/bash
set -e

# ✅ Efficient array operations
declare -a large_array

# Efficient population
mapfile -t large_array < <(seq 1 10000)

# Efficient filtering
filtered_array=()
for item in "${large_array[@]}"; do
    if [[ $((item % 2)) -eq 0 ]]; then
        filtered_array+=("$item")
    fi
done

# Efficient processing
for item in "${filtered_array[@]}"; do
    echo "Processing: $item"
done
```

### Pattern 3: Memory-Efficient File Processing

```bash
#!/bin/bash
set -e

# ✅ Memory-efficient: Process line by line
process_large_file() {
    local file="$1"

    while IFS= read -r line; do
        # Process line without loading entire file
        echo "Processing: $line"
    done < "$file"
}

# ✅ Memory-efficient: Stream processing
process_stream() {
    local input="$1"

    # Process without storing in memory
    "$input" | while IFS= read -r line; do
        echo "Stream processing: $line"
    done
}
```

## Algorithm Optimization Patterns

### Pattern 1: Efficient Searching

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Linear search
find_item_linear() {
    local target="$1"
    shift
    local items=("$@")

    for item in "${items[@]}"; do
        if [[ "$item" = "$target" ]]; then
            return 0
        fi
    done
    return 1
}

# ✅ Efficient: Associative array lookup
declare -A item_map

build_lookup_table() {
    local items=("$@")

    for item in "${items[@]}"; do
        item_map["$item"]=1
    done
}

find_item_hash() {
    local target="$1"
    [[ -n "${item_map[$target]:-}" ]]
}
```

### Pattern 2: Efficient Sorting

```bash
#!/bin/bash
set -e

# ✅ Efficient: Use system sort
sort_large_list() {
    local input_file="$1"
    local output_file="$2"

    # Use system sort for large datasets
    sort "$input_file" > "$output_file"
}

# ✅ Efficient: In-memory sort for small datasets
sort_small_list() {
    local items=("$@")

    # Use bash's built-in sorting
    IFS=$'\n'
    sorted_items=($(sort <<< "${items[*]}"))
    unset IFS

    printf '%s\n' "${sorted_items[@]}"
}
```

### Pattern 3: Efficient Deduplication

```bash
#!/bin/bash
set -e

# ✅ Efficient: Associative array deduplication
deduplicate_array() {
    local items=("$@")
    declare -A seen
    local unique_items=()

    for item in "${items[@]}"; do
        if [[ -z "${seen[$item]:-}" ]]; then
            seen["$item"]=1
            unique_items+=("$item")
        fi
    done

    printf '%s\n' "${unique_items[@]}"
}

# ✅ Efficient: Stream deduplication
deduplicate_stream() {
    local input="$1"

    # Use sort -u for stream deduplication
    "$input" | sort -u
}
```

## Network Optimization Patterns

### Pattern 1: Connection Pooling

```bash
#!/bin/bash
set -e

# ✅ Connection pooling simulation
declare -A connection_pool

get_connection() {
    local host="$1"
    local port="$2"
    local key="${host}:${port}"

    if [[ -z "${connection_pool[$key]:-}" ]]; then
        # Create new connection
        connection_pool[$key]=$(create_connection "$host" "$port")
    fi

    echo "${connection_pool[$key]}"
}

create_connection() {
    local host="$1"
    local port="$2"

    # Simulate connection creation
    echo "connection_${host}_${port}_$(date +%s)"
}
```

### Pattern 2: Batch Network Operations

```bash
#!/bin/bash
set -e

# ✅ Batch HTTP requests
batch_http_requests() {
    local urls=("$@")
    local max_concurrent=10
    local job_count=0

    for url in "${urls[@]}"; do
        while [[ ${job_count} -ge ${max_concurrent} ]]; do
            wait -n
            ((job_count--))
        done

        fetch_url "$url" &
        ((job_count++))
    done

    wait
}

fetch_url() {
    local url="$1"
    local output_file="response_$(basename "$url").txt"

    curl -s "$url" > "$output_file"
    echo "Fetched: $url"
}
```

## Caching Patterns

### Pattern 1: File-Based Caching

```bash
#!/bin/bash
set -e

# ✅ File-based cache with TTL
get_cached_result() {
    local cache_key="$1"
    local command="$2"
    local ttl="${3:-300}"  # 5 minutes default
    local cache_dir="/tmp/bash_cache"
    local cache_file="${cache_dir}/${cache_key}"

    mkdir -p "$cache_dir"

    # Check if cache exists and is fresh
    if [[ -f "$cache_file" ]] && [[ $(($(date +%s) - $(stat -c %Y "$cache_file"))) -lt $ttl ]]; then
        cat "$cache_file"
    else
        # Execute command and cache result
        $command > "$cache_file"
        cat "$cache_file"
    fi
}

# Usage
hostname=$(get_cached_result "hostname" "hostname" 600)
```

### Pattern 2: Memory-Based Caching

```bash
#!/bin/bash
set -e

# ✅ Memory-based cache with LRU
declare -A cache
declare -a cache_order
readonly MAX_CACHE_SIZE=100

cache_get() {
    local key="$1"
    echo "${cache[$key]:-}"
}

cache_set() {
    local key="$1"
    local value="$2"

    # Remove oldest if cache is full
    if [[ ${#cache[@]} -ge $MAX_CACHE_SIZE ]]; then
        local oldest_key="${cache_order[0]}"
        unset cache["$oldest_key"]
        cache_order=("${cache_order[@]:1}")
    fi

    # Add to cache
    cache["$key"]="$value"
    cache_order+=("$key")
}
```

## Profiling and Monitoring

### Pattern 1: Performance Timing

```bash
#!/bin/bash
set -e

# ✅ Performance timing functions
start_timer() {
    echo "Starting timer: $1"
    TIMER_START=$(date +%s.%N)
}

end_timer() {
    local operation="$1"
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $TIMER_START" | bc)
    echo "Timer: $operation took ${duration} seconds"
}

# Usage
start_timer "file processing"
# ... do work ...
end_timer "file processing"
```

### Pattern 2: Memory Monitoring

```bash
#!/bin/bash
set -e

# ✅ Memory usage monitoring
get_memory_usage() {
    local pid=$$
    local memory_kb=$(ps -o rss= -p $pid)
    echo "Memory usage: ${memory_kb} KB"
}

monitor_memory() {
    local operation="$1"
    local start_memory=$(get_memory_usage)

    echo "Memory before $operation: $start_memory"

    # ... do work ...

    local end_memory=$(get_memory_usage)
    echo "Memory after $operation: $end_memory"
}
```

## Optimization Best Practices

### Do's and Don'ts

```bash
# ✅ DO: Use built-in operations
result="${string//old/new}"  # Instead of sed

# ✅ DO: Use arrays for multiple values
declare -a items=("item1" "item2" "item3")

# ✅ DO: Use here documents for multi-line output
cat << EOF > output.txt
Line 1
Line 2
Line 3
EOF

# ✅ DO: Use process substitution for complex operations
diff <(sort file1) <(sort file2)

# ❌ DON'T: Use external commands for simple operations
result=$(echo "$string" | sed 's/old/new/')  # Use ${string//old/new}

# ❌ DON'T: Use multiple echo commands
echo "Line 1" >> file
echo "Line 2" >> file
echo "Line 3" >> file

# ❌ DON'T: Use temporary files unnecessarily
echo "$data" > temp.txt
process temp.txt
rm temp.txt
```

### Performance Testing

```bash
#!/bin/bash
set -e

# ✅ Performance testing framework
run_performance_test() {
    local test_name="$1"
    local iterations="${2:-100}"
    local command="$3"

    echo "Running performance test: $test_name"
    echo "Iterations: $iterations"

    local start_time=$(date +%s.%N)

    for ((i=1; i<=iterations; i++)); do
        eval "$command" > /dev/null
    done

    local end_time=$(date +%s.%N)
    local total_time=$(echo "$end_time - $start_time" | bc)
    local avg_time=$(echo "scale=6; $total_time / $iterations" | bc)

    echo "Total time: ${total_time} seconds"
    echo "Average time: ${avg_time} seconds"
    echo "Operations per second: $(echo "scale=2; $iterations / $total_time" | bc)"
}

# Usage
run_performance_test "String replacement" 1000 'result="${test_string//old/new}"'
run_performance_test "Array access" 1000 'item="${test_array[0]}"'
```

## Key Takeaways

1. **Batch operations** to minimize I/O
2. **Cache expensive operations** when possible
3. **Use built-in operations** instead of external commands
4. **Minimize subprocess creation** for better performance
5. **Use associative arrays** for efficient lookups
6. **Process data in streams** to reduce memory usage
7. **Profile your scripts** to identify bottlenecks
8. **Use parallel processing** for independent operations
9. **Optimize algorithms** before micro-optimizations
10. **Measure performance** to validate improvements

## Common Performance Pitfalls

### What to Avoid

```bash
# ❌ Inefficient: Multiple file operations
echo "line1" >> file
echo "line2" >> file
echo "line3" >> file

# ❌ Inefficient: External commands for simple operations
result=$(echo "$string" | tr '[:upper:]' '[:lower:]')

# ❌ Inefficient: Multiple subprocess calls
date1=$(date)
date2=$(date +%H:%M:%S)
date3=$(date +%A)

# ❌ Inefficient: Linear search in large datasets
for item in "${large_array[@]}"; do
    if [[ "$item" = "$target" ]]; then
        found=true
        break
    fi
done
```

### What to Use Instead

```bash
# ✅ Efficient: Batch file operations
{
    echo "line1"
    echo "line2"
    echo "line3"
} >> file

# ✅ Efficient: Built-in string operations
result="${string,,}"  # Convert to lowercase

# ✅ Efficient: Single subprocess call
date_info=$(date)
date1="$date_info"
date2=$(date +%H:%M:%S)
date3=$(date +%A)

# ✅ Efficient: Associative array lookup
declare -A lookup_table
for item in "${large_array[@]}"; do
    lookup_table["$item"]=1
done
found=[[ -n "${lookup_table[$target]:-}" ]]
```

## Reference

- [Bash Performance Tips](https://mywiki.wooledge.org/BashFAQ/032)
- [Shell Script Optimization](https://www.ibm.com/developerworks/library/l-bash3/index.html)
- [Advanced Bash Scripting Guide](https://tldp.org/LDP/abs/html/)

_Optimization is about making the right trade-offs. Measure first, optimize second, and always maintain readability._
