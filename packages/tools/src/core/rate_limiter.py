from collections import defaultdict
import time


class RateLimiter:
    """
    A class to implement a rate limiting mechanism.

    This rate limiter allows a maximum number of attempts within a specified time window.
    If the attempts exceed the limit, the key (e.g., user ID, IP address) is blocked
    for a defined duration. After the blocking period, the attempts are reset.

    Attributes:
        max_attempts (int): The maximum number of allowed attempts before blocking.
        block_time_seconds (int): The duration (in seconds) for which a key is blocked.
        attempts (defaultdict): A dictionary to store the attempt history for each key,
                                including count, last attempt time, and blocked until timestamp.
    """

    def __init__(self, max_attempts: int, block_time_seconds: int):
        self.max_attempts = max_attempts
        self.block_time_seconds = block_time_seconds
        self.attempts = defaultdict(
            lambda: {"count": 0, "last_attempt_time": 0.0, "blocked_until": 0.0}
        )

    def is_allowed(self, key: str) -> bool:
        current_time = time.time()
        if current_time < self.attempts[key]["blocked_until"]:
            return False
        return True

    def record_attempt(self, key: str):
        current_time = time.time()
        if current_time > self.attempts[key]["blocked_until"]:
            if (
                current_time - self.attempts[key]["last_attempt_time"]
                > self.block_time_seconds
            ):
                # Reset count if the last attempt was outside the blocking window
                self.attempts[key]["count"] = 1
            else:
                self.attempts[key]["count"] += 1
            self.attempts[key]["last_attempt_time"] = current_time

            if self.attempts[key]["count"] >= self.max_attempts:
                self.attempts[key]["blocked_until"] = (
                    current_time + self.block_time_seconds
                )
                self.attempts[key]["count"] = 0  # Reset count after blocking

    def reset_attempts(self, key: str):
        if key in self.attempts:
            del self.attempts[key]
