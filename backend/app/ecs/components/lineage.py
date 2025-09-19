"""
Lineage Component

Agent family relationships and ancestry component.
"""

from ..core.component import Component


class LineageComponent(Component):
    """
    Agent family relationships and ancestry.

    Tracks the agent's family relationships including parents,
    children, ancestors, and descendants for genetic inheritance
    and family tree management.
    """

    def __init__(self, parents: list[str] | None = None) -> None:
        """
        Initialize the lineage component.

        Args:
            parents: List of parent agent IDs
        """
        super().__init__()
        self.parents = parents or []
        self.children: list[str] = []
        self.ancestors: list[str] = []
        self.descendants: list[str] = []
        self.generation = 1

    def add_child(self, child_id: str) -> None:
        """
        Add a child to this agent's lineage.

        Args:
            child_id: ID of the child agent
        """
        if child_id not in self.children:
            self.children.append(child_id)

    def add_parent(self, parent_id: str) -> None:
        """
        Add a parent to this agent's lineage.

        Args:
            parent_id: ID of the parent agent
        """
        if parent_id not in self.parents:
            self.parents.append(parent_id)

    def get_family_size(self) -> int:
        """
        Get the total family size including parents, children, and self.

        Returns:
            Total number of family members
        """
        return len(self.parents) + len(self.children) + 1

    def is_ancestor_of(self, other_id: str) -> bool:
        """
        Check if this agent is an ancestor of another agent.

        Args:
            other_id: ID of the potential descendant

        Returns:
            True if this agent is an ancestor, False otherwise
        """
        return other_id in self.descendants

    def __repr__(self) -> str:
        """String representation of the lineage component."""
        return f"LineageComponent(parents={len(self.parents)}, children={len(self.children)}, generation={self.generation})"
