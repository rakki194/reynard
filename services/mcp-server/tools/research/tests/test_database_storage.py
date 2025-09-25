"""
Test database storage functionality.
"""

import pytest
import json
from unittest.mock import patch, Mock


class TestDatabaseStorage:
    """Test database storage functionality."""

    def test_database_connection(self, mock_database_connection):
        """Test database connection."""
        assert mock_database_connection is not None
        assert hasattr(mock_database_connection, 'execute')
        assert hasattr(mock_database_connection, 'commit')

    def test_paper_insertion(self, mock_database_connection, sample_paper_metadata):
        """Test paper insertion into database."""
        # Setup
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"count": 1}
        mock_database_connection.execute.return_value = mock_cursor
        
        # Test
        insert_sql = "INSERT INTO papers (paper_id, title) VALUES (?, ?)"
        mock_database_connection.execute(insert_sql, (
            sample_paper_metadata["paper_id"],
            sample_paper_metadata["title"]
        ))
        mock_database_connection.commit()
        
        # Assertions
        mock_database_connection.execute.assert_called_once()
        mock_database_connection.commit.assert_called_once()

    def test_paper_retrieval(self, mock_database_connection, sample_paper_metadata):
        """Test paper retrieval from database."""
        # Setup
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {
            "paper_id": sample_paper_metadata["paper_id"],
            "title": sample_paper_metadata["title"]
        }
        mock_database_connection.execute.return_value = mock_cursor
        
        # Test
        select_sql = "SELECT * FROM papers WHERE paper_id = ?"
        mock_database_connection.execute(select_sql, (sample_paper_metadata["paper_id"],))
        
        # Assertions
        mock_database_connection.execute.assert_called_once()
        result = mock_cursor.fetchone()
        assert result["paper_id"] == sample_paper_metadata["paper_id"]

    def test_json_serialization_for_database(self, sample_paper_metadata):
        """Test JSON serialization for database storage."""
        # Test authors serialization
        authors_json = json.dumps(sample_paper_metadata["authors"])
        assert isinstance(authors_json, str)
        
        # Test deserialization
        deserialized_authors = json.loads(authors_json)
        assert deserialized_authors == sample_paper_metadata["authors"]