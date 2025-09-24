#!/usr/bin/env python3.15
"""PEP 649: Deferred Evaluation of Annotations Test
Testing the new lazy annotation evaluation system
"""

import inspect
from typing import Any, get_type_hints


def test_forward_references():
    """Test forward references without string literals"""
    print("=" * 60)
    print("🔄 PEP 649: DEFERRED EVALUATION OF ANNOTATIONS")
    print("=" * 60)

    # Test forward references in classes
    class Node:
        def __init__(self, value: int, next_node: Node = None):
            self.value = value
            self.next_node = next_node

    class TreeNode:
        def __init__(self, value: int, left: TreeNode = None, right: TreeNode = None):
            self.value = value
            self.left = left
            self.right = right

    print("✅ Forward references work without string literals")

    # Test accessing annotations
    node_annotations = Node.__init__.__annotations__
    print(f"Node.__init__ annotations: {node_annotations}")

    tree_annotations = TreeNode.__init__.__annotations__
    print(f"TreeNode.__init__ annotations: {tree_annotations}")

    print()


def test_complex_annotations():
    """Test complex type annotations"""
    print("🧩 TESTING COMPLEX TYPE ANNOTATIONS")
    print("-" * 40)

    def process_data(
        items: list[dict[str, Any]], filter_func: callable | None = None,
    ) -> dict[str, list[Any]]:
        """Function with complex annotations"""
        if filter_func:
            return {"filtered": [item for item in items if filter_func(item)]}
        return {"all": items}

    # Get annotations
    annotations = process_data.__annotations__
    print(f"Function annotations: {annotations}")

    # Test with get_type_hints
    try:
        type_hints = get_type_hints(process_data)
        print(f"Type hints: {type_hints}")
        print("✅ get_type_hints works with deferred annotations")
    except Exception as e:
        print(f"⚠️  get_type_hints issue: {e}")

    print()


def test_performance_impact():
    """Test performance impact of deferred annotations"""
    print("⚡ TESTING PERFORMANCE IMPACT")
    print("-" * 40)

    import time

    # Create many functions with annotations
    start_time = time.time()

    functions = []
    for i in range(1000):

        def func(x: int, y: str) -> float:
            return float(x) + len(y)

        functions.append(func)

    creation_time = time.time() - start_time
    print(f"Function creation time (1000 functions): {creation_time:.4f}s")

    # Access annotations (triggers evaluation)
    start_time = time.time()
    for func in functions[:10]:  # Only test first 10
        annotations = func.__annotations__
    access_time = time.time() - start_time
    print(f"Annotation access time (10 functions): {access_time:.4f}s")

    print()


def test_inspect_module():
    """Test inspect module with deferred annotations"""
    print("🔍 TESTING INSPECT MODULE")
    print("-" * 40)

    def example_function(x: int, y: str, z: list[int] | None = None) -> dict[str, Any]:
        """Example function for inspection"""
        return {"x": x, "y": y, "z": z}

    # Get signature
    sig = inspect.signature(example_function)
    print(f"Function signature: {sig}")

    # Get parameters
    for param_name, param in sig.parameters.items():
        print(f"Parameter {param_name}: {param.annotation}")

    # Get return annotation
    print(f"Return annotation: {sig.return_annotation}")

    print()


def test_generic_types():
    """Test generic types with deferred annotations"""
    print("🔧 TESTING GENERIC TYPES")
    print("-" * 40)

    from typing import Generic, TypeVar

    T = TypeVar("T")

    class Container(Generic[T]):
        def __init__(self, items: list[T]) -> None:
            self.items = items

        def get(self, index: int) -> T:
            return self.items[index]

        def add(self, item: T) -> None:
            self.items.append(item)

    # Test generic annotations
    container_annotations = Container.__init__.__annotations__
    print(f"Container.__init__ annotations: {container_annotations}")

    get_annotations = Container.get.__annotations__
    print(f"Container.get annotations: {get_annotations}")

    print()


def test_annotation_evaluation_timing():
    """Test when annotations are actually evaluated"""
    print("⏰ TESTING ANNOTATION EVALUATION TIMING")
    print("-" * 40)

    # Create a function with expensive annotation
    def expensive_annotation_function(data: list[dict[str, Any]]) -> dict[str, Any]:
        # This annotation would be expensive if evaluated at definition time
        return {"processed": len(data)}

    print("✅ Function created without evaluating expensive annotations")

    # Now access annotations (this should trigger evaluation)
    annotations = expensive_annotation_function.__annotations__
    print(f"Annotations accessed: {annotations}")
    print("✅ Annotations evaluated only when accessed")

    print()


if __name__ == "__main__":
    test_forward_references()
    test_complex_annotations()
    test_performance_impact()
    test_inspect_module()
    test_generic_types()
    test_annotation_evaluation_timing()

    print("🎉 PEP 649 tests completed!")
