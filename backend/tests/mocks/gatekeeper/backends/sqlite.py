"""
Mock SQLite backend for gatekeeper.
"""

class SQLiteBackend:
    """Mock SQLite backend."""
    
    def __init__(self, db_path=None):
        self.db_path = db_path
        self.data = {}
    
    def get(self, key):
        return self.data.get(key)
    
    def set(self, key, value):
        self.data[key] = value
    
    def delete(self, key):
        if key in self.data:
            del self.data[key]
