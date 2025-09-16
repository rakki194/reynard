"""Type stub for robot_name_generator module."""

from typing import Optional

class ReynardRobotNamer:
    """Robot name generator for Reynard agents."""

    def __init__(self) -> None: ...
    def generate_name(
        self, spirit: Optional[str] = None, style: Optional[str] = None
    ) -> str:
        """Generate a robot name with given specialist and style."""
        ...

    def generate_batch(
        self, count: int, spirit: Optional[str] = None, style: Optional[str] = None
    ) -> list[str]:
        """Generate a batch of robot names."""
        ...

    def roll_spirit(self, weighted: bool = True) -> str:
        """Roll a random spirit."""
        ...
