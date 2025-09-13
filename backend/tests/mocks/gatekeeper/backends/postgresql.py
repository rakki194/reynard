"""
Mock PostgreSQL backend for gatekeeper.
"""

class PostgreSQLBackend:
    """Mock PostgreSQL backend."""
    
    def __init__(self, connection_string=None):
        self.connection_string = connection_string
        self.data = {}
    
    def get(self, key):
        return self.data.get(key)
    
    def set(self, key, value):
        self.data[key] = value
    
    def delete(self, key):
        if key in self.data:
            del self.data[key]