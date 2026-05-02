#!/usr/bin/env python

# -----------------------------------------------------------------------
# testserver.py
# Tests for pure (no-DB) functions in server.py
# Run with: python -m coverage run -p testserver.py
# -----------------------------------------------------------------------

import unittest
from server import (
    parse_era,
    _year_to_era,
    tag_object,
    build_user_vector,
    dot_product,
    FEATURE_DIMS,
    N_DIMS,
)

# -----------------------------------------------------------------------

class TestYearToEra(unittest.TestCase):

    def test_ancient(self):
        self.assertEqual(_year_to_era(100), "ancient")

    def test_ancient_boundary(self):
        self.assertEqual(_year_to_era(499), "ancient")

    def test_medieval_boundary(self):
        self.assertEqual(_year_to_era(500), "medieval")

    def test_medieval(self):
        self.assertEqual(_year_to_era(1000), "medieval")

    def test_early_modern_boundary(self):
        self.assertEqual(_year_to_era(1500), "early_modern")

    def test_early_modern(self):
        self.assertEqual(_year_to_era(1700), "early_modern")

    def test_19th_century_boundary(self):
        self.assertEqual(_year_to_era(1800), "19th_century")

    def test_19th_century(self):
        self.assertEqual(_year_to_era(1850), "19th_century")

    def test_early_20th_boundary(self):
        self.assertEqual(_year_to_era(1900), "early_20th")

    def test_early_20th(self):
        self.assertEqual(_year_to_era(1920), "early_20th")

    def test_modern_boundary(self):
        self.assertEqual(_year_to_era(1945), "modern")

    def test_modern(self):
        self.assertEqual(_year_to_era(2000), "modern")

# -----------------------------------------------------------------------

class TestParseEra(unittest.TestCase):

    # Null / empty input
    def test_none_input(self):
        self.assertIsNone(parse_era(None))

    def test_empty_string(self):
        self.assertIsNone(parse_era(""))

    # BCE / BC → always ancient
    def test_bce(self):
        self.assertEqual(parse_era("ca. 580 BCE"), "ancient")

    def test_bc(self):
        self.assertEqual(parse_era("3rd century BC"), "ancient")

    def test_early_bce_century(self):
        self.assertEqual(parse_era("early 7th century BCE"), "ancient")

    # Named century (numeric ordinal)
    def test_18th_century(self):
        self.assertEqual(parse_era("18th century"), "early_modern")

    def test_19th_century(self):
        self.assertEqual(parse_era("19th century"), "19th_century")

    def test_early_20th_century(self):
        self.assertEqual(parse_era("early 20th century"), "early_20th")

    def test_late_20th_century(self):
        self.assertEqual(parse_era("late 20th century"), "modern")

    # Named century (written ordinal)
    def test_nineteenth_century(self):
        self.assertEqual(parse_era("nineteenth century"), "19th_century")

    def test_eighteenth_century(self):
        self.assertEqual(parse_era("eighteenth century"), "early_modern")

    # Century range (averaged)
    def test_mid19_mid20_century(self):
        result = parse_era("mid 19th century -mid 20th century")
        self.assertIn(result, ["19th_century", "early_20th"])  # averaged midpoint

    # Decade strings
    def test_1960s(self):
        self.assertEqual(parse_era("1960s"), "modern")

    def test_1980s(self):
        self.assertEqual(parse_era("1980s"), "modern")

    # Plain 4-digit years
    def test_plain_year(self):
        self.assertEqual(parse_era("1977"), "modern")

    def test_circa_year(self):
        self.assertEqual(parse_era("ca. 1880"), "19th_century")

    def test_year_range(self):
        # 1850-1900 averages to 1875 → 19th_century
        self.assertEqual(parse_era("1850-1900"), "19th_century")

    def test_year_with_printed(self):
        # "1938, printed 1980s" — years 1938 + 1985 avg ≈ 1961 → modern
        self.assertEqual(parse_era("1938, printed 1980s"), "modern")

    def test_before_year(self):
        self.assertEqual(parse_era("before 1885"), "19th_century")

# -----------------------------------------------------------------------

class TestTagObject(unittest.TestCase):

    def test_returns_correct_length(self):
        vec = tag_object(1, "painting", "european painting and sculpture", "1880")
        self.assertEqual(len(vec), N_DIMS)

    def test_all_values_zero_or_one(self):
        vec = tag_object(1, "painting", "european painting and sculpture", "1880")
        for v in vec:
            self.assertIn(v, [0.0, 1.0])

    def test_painting_classification(self):
        vec = tag_object(1, "paintings", "european painting and sculpture", "1880")
        idx = FEATURE_DIMS.index("painting")
        self.assertEqual(vec[idx], 1.0)

    def test_geography_european(self):
        vec = tag_object(1, "painting", "european painting and sculpture", "1880")
        idx = FEATURE_DIMS.index("european")
        self.assertEqual(vec[idx], 1.0)

    def test_era_19th_century(self):
        vec = tag_object(1, "painting", "european painting and sculpture", "1880")
        idx = FEATURE_DIMS.index("19th_century")
        self.assertEqual(vec[idx], 1.0)

    def test_unknown_classification(self):
        # Unknown classification should leave all classification dims at 0
        vec = tag_object(1, "unknown_type", "asian art", "1960")
        for dim in ["painting", "sculpture", "drawing", "print",
                    "photography", "textile", "decorative", "artifact"]:
            self.assertEqual(vec[FEATURE_DIMS.index(dim)], 0.0)

    def test_none_classification(self):
        # None inputs should not crash
        vec = tag_object(1, None, None, None)
        self.assertEqual(len(vec), N_DIMS)
        self.assertEqual(sum(vec), 0.0)

    def test_asian_department(self):
        vec = tag_object(1, "sculpture", "asian art", "1200")
        self.assertEqual(vec[FEATURE_DIMS.index("asian")], 1.0)

    def test_photography_department(self):
        vec = tag_object(1, "photographs", "photography", "1960")
        self.assertEqual(vec[FEATURE_DIMS.index("photography")], 1.0)
        self.assertEqual(vec[FEATURE_DIMS.index("modern_global")], 1.0)

# -----------------------------------------------------------------------

class TestBuildUserVector(unittest.TestCase):

    def test_returns_correct_length(self):
        answers = {
            "era": ["modern", "early_20th", "19th_century"],
            "classification": ["painting", "photography", "sculpture"],
            "geography": ["asian", "european", "modern_global"],
        }
        vec = build_user_vector(answers)
        self.assertEqual(len(vec), N_DIMS)

    def test_selected_tags_have_weight(self):
        answers = {
            "era": ["modern", "early_20th", "19th_century"],
            "classification": ["painting", "photography", "sculpture"],
            "geography": ["asian", "european", "modern_global"],
        }
        vec = build_user_vector(answers)
        self.assertAlmostEqual(vec[FEATURE_DIMS.index("modern")], 1/3, places=5)
        self.assertAlmostEqual(vec[FEATURE_DIMS.index("painting")], 1/3, places=5)
        self.assertAlmostEqual(vec[FEATURE_DIMS.index("asian")], 1/3, places=5)

    def test_unselected_tags_are_zero(self):
        answers = {
            "era": ["modern", "early_20th", "19th_century"],
            "classification": ["painting", "photography", "sculpture"],
            "geography": ["asian", "european", "modern_global"],
        }
        vec = build_user_vector(answers)
        self.assertEqual(vec[FEATURE_DIMS.index("ancient")], 0.0)
        self.assertEqual(vec[FEATURE_DIMS.index("african_oceanic")], 0.0)

    def test_empty_answers(self):
        vec = build_user_vector({})
        self.assertEqual(sum(vec), 0.0)

    def test_partial_answers(self):
        # Only era answered — classification and geography should be 0
        answers = {"era": ["modern", "early_20th", "19th_century"]}
        vec = build_user_vector(answers)
        self.assertAlmostEqual(vec[FEATURE_DIMS.index("modern")], 1/3, places=5)
        self.assertEqual(vec[FEATURE_DIMS.index("painting")], 0.0)

# -----------------------------------------------------------------------

class TestDotProduct(unittest.TestCase):

    def test_identical_vectors(self):
        v = [1.0, 0.5, 0.0, 0.333]
        self.assertAlmostEqual(dot_product(v, v), sum(x*x for x in v))

    def test_orthogonal_vectors(self):
        u = [1.0, 0.0, 0.0]
        v = [0.0, 1.0, 0.0]
        self.assertEqual(dot_product(u, v), 0.0)

    def test_zero_vector(self):
        u = [0.0] * N_DIMS
        v = [1.0] * N_DIMS
        self.assertEqual(dot_product(u, v), 0.0)

    def test_known_result(self):
        u = [1.0, 2.0, 3.0]
        v = [4.0, 5.0, 6.0]
        self.assertEqual(dot_product(u, v), 32.0)

# -----------------------------------------------------------------------

if __name__ == '__main__':
    unittest.main(verbosity=2)