#!/usr/bin/env python

# -----------------------------------------------------------------------
# testdatabase.py
# Tests for DB helper functions in server.py, using the real PostgreSQL DB.
# Follows lecture examples
#
# Run with: python -m coverage run -p testdatabase.py
# -----------------------------------------------------------------------

import unittest
import json
from server import (
    get_connection,
    save_user_vector,
    load_user_vector,
    build_user_vector,
    N_DIMS,
    FEATURE_DIMS,
    DIM_INDEX,
)

TEST_USER = 'testuser_cos333'

# -----------------------------------------------------------------------

class TestUserVector(unittest.TestCase):
    """
    Tests save_user_vector and load_user_vector against the real DB.
    Follows lecture pattern: setUp initializes inputs/expected,
    tearDown performs the DB operation and assertion.
    """

    def setUp(self):
        self._vector = None
        self._expected = None

        # Clean up any leftover test data before each test
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM user_preferences WHERE user_id = %s",
            (TEST_USER,)
        )
        conn.commit()
        cur.close()
        conn.close()

    def tearDown(self):
        if self._vector is None:
            return

        # Save the vector to the real DB
        conn = get_connection()
        cur = conn.cursor()
        save_user_vector(cur, TEST_USER, self._vector)
        conn.commit()

        # Load it back and compare
        loaded = load_user_vector(cur, TEST_USER)
        cur.close()
        conn.close()

        self.assertIsNotNone(loaded)
        self.assertEqual(len(loaded), N_DIMS)
        for i in range(N_DIMS):
            self.assertAlmostEqual(loaded[i], self._expected[i], places=5)

        # Clean up after each test
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM user_preferences WHERE user_id = %s",
            (TEST_USER,)
        )
        conn.commit()
        cur.close()
        conn.close()

    def test_all_zeros(self):
        """A zero vector (user hasn't taken survey) round-trips correctly."""
        self._vector = [0.0] * N_DIMS
        self._expected = [0.0] * N_DIMS

    def test_survey_vector(self):
        """A vector built from survey answers round-trips correctly."""
        answers = {
            "era": ["modern", "early_20th", "19th_century"],
            "classification": ["painting", "photography", "sculpture"],
            "geography": ["asian", "european", "modern_global"],
        }
        self._vector = build_user_vector(answers)
        self._expected = self._vector[:]

    def test_all_ones(self):
        """A full-preference vector round-trips correctly."""
        self._vector = [1.0] * N_DIMS
        self._expected = [1.0] * N_DIMS

    def test_partial_preferences(self):
        """A vector with only era preferences set round-trips correctly."""
        answers = {"era": ["modern", "early_20th", "19th_century"]}
        self._vector = build_user_vector(answers)
        self._expected = self._vector[:]

    def test_upsert_updates_existing(self):
        """Saving a second vector for the same user overwrites the first."""
        conn = get_connection()
        cur = conn.cursor()

        # Save first vector
        first_vec = [0.0] * N_DIMS
        save_user_vector(cur, TEST_USER, first_vec)
        conn.commit()

        # Save second vector (upsert)
        second_vec = [1.0] * N_DIMS
        save_user_vector(cur, TEST_USER, second_vec)
        conn.commit()

        # Should get the second vector back
        loaded = load_user_vector(cur, TEST_USER)
        cur.close()
        conn.close()

        for i in range(N_DIMS):
            self.assertAlmostEqual(loaded[i], 1.0, places=5)

        # Clean up
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM user_preferences WHERE user_id = %s",
            (TEST_USER,)
        )
        conn.commit()
        cur.close()
        conn.close()

# -----------------------------------------------------------------------

class TestLoadUserVectorMissing(unittest.TestCase):
    """
    Tests that load_user_vector returns None for a user
    who has no preferences stored.
    """

    def setUp(self):
        self._user_id = None
        self._expected = None

        # Ensure test user has no preferences
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM user_preferences WHERE user_id = %s",
            (TEST_USER,)
        )
        conn.commit()
        cur.close()
        conn.close()

    def tearDown(self):
        if self._user_id is None:
            return

        conn = get_connection()
        cur = conn.cursor()
        result = load_user_vector(cur, self._user_id)
        cur.close()
        conn.close()

        self.assertEqual(result, self._expected)

    def test_missing_user_returns_none(self):
        """A user with no survey data should return None."""
        self._user_id = TEST_USER
        self._expected = None

    def test_nonexistent_user_returns_none(self):
        """A completely unknown user_id should return None."""
        self._user_id = 'totally_nonexistent_user_xyz_999'
        self._expected = None

# -----------------------------------------------------------------------

class TestFavoritesDB(unittest.TestCase):
    """
    Tests the saved_artworks table operations against the real DB.
    Uses a known objectid that exists in the artworks table.
    """

    # Use a real objectid from your artworks table
    TEST_OBJECTID = 8176

    def setUp(self):
        self._user_id = None
        self._objectid = None
        self._expected_count = None

        # Clean up before each test
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM saved_artworks WHERE user_id = %s",
            (TEST_USER,)
        )
        conn.commit()
        cur.close()
        conn.close()

    def tearDown(self):
        if self._user_id is None:
            return

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT COUNT(*) FROM saved_artworks WHERE user_id = %s",
            (self._user_id,)
        )
        count = cur.fetchone()[0]
        cur.close()
        conn.close()

        self.assertEqual(count, self._expected_count)

        # Clean up
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM saved_artworks WHERE user_id = %s",
            (TEST_USER,)
        )
        conn.commit()
        cur.close()
        conn.close()

    def test_add_favorite(self):
        """Adding a favorite should result in 1 saved artwork."""
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO saved_artworks (user_id, objectid) VALUES (%s, %s) "
            "ON CONFLICT DO NOTHING",
            (TEST_USER, self.TEST_OBJECTID)
        )
        conn.commit()
        cur.close()
        conn.close()

        self._user_id = TEST_USER
        self._expected_count = 1

    def test_remove_favorite(self):
        """Removing a favorite should result in 0 saved artworks."""
        conn = get_connection()
        cur = conn.cursor()
        # Add then remove
        cur.execute(
            "INSERT INTO saved_artworks (user_id, objectid) VALUES (%s, %s) "
            "ON CONFLICT DO NOTHING",
            (TEST_USER, self.TEST_OBJECTID)
        )
        cur.execute(
            "DELETE FROM saved_artworks WHERE user_id = %s AND objectid = %s",
            (TEST_USER, self.TEST_OBJECTID)
        )
        conn.commit()
        cur.close()
        conn.close()

        self._user_id = TEST_USER
        self._expected_count = 0

    def test_duplicate_favorite_ignored(self):
        """Adding the same artwork twice should still result in 1 saved artwork."""
        conn = get_connection()
        cur = conn.cursor()
        for _ in range(2):
            cur.execute(
                "INSERT INTO saved_artworks (user_id, objectid) VALUES (%s, %s) "
                "ON CONFLICT DO NOTHING",
                (TEST_USER, self.TEST_OBJECTID)
            )
        conn.commit()
        cur.close()
        conn.close()

        self._user_id = TEST_USER
        self._expected_count = 1

    def test_no_favorites(self):
        """A user with no favorites should have count 0."""
        self._user_id = TEST_USER
        self._expected_count = 0

# -----------------------------------------------------------------------

if __name__ == '__main__':
    unittest.main(verbosity=2)