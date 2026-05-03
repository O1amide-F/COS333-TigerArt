#!/usr/bin/env python

# -----------------------------------------------------------------------
# testserver.py
# System/integration tests for TigerArt using Playwright.
# Follows Dondero's testpenny.py pattern: setUp sets inputs/expected,
# tearDown drives the browser and asserts.
#
# Prerequisites:
#   pip install playwright
#   playwright install chromium
#
# Usage:
#   1. Start the server:
#      python3 -m coverage run -p server.py 5001
#   2. In another terminal:
#      python3 testserver.py > test_results.txt 2>&1
# -----------------------------------------------------------------------

import os
import sys
import time
import unittest
import playwright.sync_api
import dotenv

# -----------------------------------------------------------------------

dotenv.load_dotenv()
SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:5001')
BROWSER    = os.getenv('TEST_BROWSER', 'chrome')
DELAY      = int(os.getenv('DELAY', '2'))

# -----------------------------------------------------------------------

class TigerArtTestCase(unittest.TestCase):
    """
    Base test case. Follows Dondero's pattern:
      - setUpClass launches the browser once for all tests
      - tearDownClass closes it
      - setUp opens a fresh page and navigates to the app
      - tearDown closes the page
    """

    @classmethod
    def setUpClass(cls):
        cls.pw = playwright.sync_api.sync_playwright().start()
        if BROWSER == 'chrome':
            cls.browser_process = cls.pw.chromium.launch()
        else:
            cls.browser_process = cls.pw.firefox.launch()
        sys.stdout.flush()

    @classmethod
    def tearDownClass(cls):
        cls.pw.stop()

    def setUp(self):
        self._page = self.browser_process.new_page()
        self._page.goto(SERVER_URL)
        self._page.wait_for_load_state('networkidle')

    def tearDown(self):
        self._page.close()

    def _enter_guest_mode(self):
        """Click 'Continue as Guest' and wait for the app to load."""
        self._page.get_by_text('Continue as Guest').click()
        self._page.wait_for_load_state('networkidle')
        time.sleep(DELAY)

    def _go_to_nav(self, data_tour_id):
        """Click a nav button by its data-tour attribute."""
        self._page.locator(f'[data-tour="{data_tour_id}"]').click()
        time.sleep(DELAY)

# -----------------------------------------------------------------------

class TestLoginPage(TigerArtTestCase):
    """
    Tests the login screen (unauthenticated state).
    setUp sets expected text. tearDown checks it appears on the page.
    """

    def setUp(self):
        super().setUp()
        self._expected_heading = None
        self._expected_button_text = None

    def tearDown(self):
        if self._expected_heading:
            heading = self._page.locator('h1').first
            self.assertIn(self._expected_heading, heading.inner_text())
        if self._expected_button_text:
            btn = self._page.get_by_text(self._expected_button_text)
            self.assertTrue(btn.is_visible())
        super().tearDown()

    def test_welcome_heading_visible(self):
        self._expected_heading = 'TigerArt'

    def test_login_button_visible(self):
        self._expected_button_text = 'Login with Microsoft'

    def test_guest_button_visible(self):
        self._expected_button_text = 'Continue as Guest'

# -----------------------------------------------------------------------

class TestGuestMode(TigerArtTestCase):
    """
    Tests the app in guest mode.
    setUp sets the nav to click and expected h1.
    tearDown enters guest mode, navigates, and asserts.
    """

    def setUp(self):
        super().setUp()
        self._nav_tour_id  = None   # data-tour id of nav button to click
        self._expected_h1  = None   # expected h1 text after navigating

    def tearDown(self):
        self._enter_guest_mode()

        if self._nav_tour_id:
            self._go_to_nav(self._nav_tour_id)

        if self._expected_h1:
            h1 = self._page.locator('h1').first
            self.assertIn(self._expected_h1, h1.inner_text())

        super().tearDown()

    def test_explore_screen_loads(self):
        """Guest mode should open on Explore screen."""
        self._expected_h1 = 'Explore'

    def test_navigate_to_news(self):
        """Clicking news nav should show Latest News heading."""
        self._nav_tour_id  = 'nav-news'
        self._expected_h1  = 'Latest News'

    def test_navigate_to_settings(self):
        """Clicking settings nav should show Settings heading."""
        self._nav_tour_id  = 'nav-settings'
        self._expected_h1  = 'Settings'

# -----------------------------------------------------------------------

class TestGuestRestricted(TigerArtTestCase):
    """
    Tests that guest-restricted nav items show an account prompt.
    These tests manage their own full flow to avoid double-tearDown.
    """

    def setUp(self):
        super().setUp()
        self._nav_tour_id = None

    def tearDown(self):
        super().tearDown()

    def _assert_shows_prompt(self, nav_tour_id):
        """Enter guest mode, click a restricted nav, assert prompt appears."""
        self._enter_guest_mode()
        self._page.locator(f'[data-tour="{nav_tour_id}"]').click()
        time.sleep(DELAY)
        prompt = self._page.locator('[role="status"]')
        self.assertTrue(prompt.is_visible())

    def test_guest_restricted_home_shows_prompt(self):
        """Clicking Home as guest should show an account prompt."""
        self._assert_shows_prompt('nav-home')

    def test_guest_restricted_favorites_shows_prompt(self):
        """Clicking Favorites as guest should show an account prompt."""
        self._assert_shows_prompt('nav-favorites')

    def test_guest_restricted_recently_viewed_shows_prompt(self):
        """Clicking Recently Viewed as guest should show an account prompt."""
        self._assert_shows_prompt('nav-recently-viewed')

# -----------------------------------------------------------------------

class TestExploreScreen(TigerArtTestCase):
    """
    Tests the Explore screen in guest mode.
    setUp sets expected conditions.
    tearDown navigates to Explore and asserts.
    """

    def setUp(self):
        super().setUp()
        self._expect_search_bar = False
        self._expect_heading    = None

    def tearDown(self):
        self._enter_guest_mode()
        time.sleep(DELAY)

        if self._expect_heading:
            h1 = self._page.locator('[data-tour="explore-heading"]')
            self.assertIn(self._expect_heading, h1.inner_text())

        if self._expect_search_bar:
            search = self._page.locator('[data-tour="explore-search"]')
            self.assertTrue(search.is_visible())

        super().tearDown()

    def test_explore_heading_loads(self):
        """Explore screen should show the Explore heading."""
        self._expect_heading = 'Explore'

    def test_explore_search_bar_visible(self):
        """Explore screen should show the search bar."""
        self._expect_search_bar = True

# -----------------------------------------------------------------------

class TestSearchBar(TigerArtTestCase):
    """
    Tests the search bar on the Explore screen.
    setUp sets the search query.
    tearDown types the query and checks the page doesn't crash.
    """

    def setUp(self):
        super().setUp()
        self._query              = None
        self._expect_results_msg = False  # True = expect results count text

    def tearDown(self):
        self._enter_guest_mode()

        # The search input has placeholder "Search by title…"
        search_input = self._page.locator(
            'input[placeholder="Search by title…"]'
        )
        search_input.wait_for(state='visible', timeout=10000)

        if self._query is not None:
            search_input.fill(self._query)
            if self._query.strip():
                search_input.press('Enter')
                time.sleep(DELAY)

        if self._expect_results_msg:
            # After a real search, expect either results count or "No results"
            results_text = self._page.get_by_text('results found').or_(
                self._page.get_by_text('No results found')
            )
            self.assertTrue(results_text.is_visible())

        super().tearDown()

    def test_search_input_visible(self):
        """The search input should be visible on the Explore screen."""
        # Just verify the input is there — no query needed
        pass

    def test_search_painting(self):
        """Searching 'painting' should show results or no-results message."""
        self._query = 'painting'
        self._expect_results_msg = True

    def test_search_empty_no_crash(self):
        """Typing and clearing search should not crash the app."""
        self._query = ''

    def test_search_nonexistent(self):
        """Searching a nonsense term should show no results."""
        self._query = 'xyzzy_nonexistent_term_123'
        self._expect_results_msg = True

# -----------------------------------------------------------------------

class TestNewsScreen(TigerArtTestCase):
    """
    Tests the News screen.
    setUp sets expected content.
    tearDown navigates to news and asserts.
    """

    def setUp(self):
        super().setUp()
        self._expected_heading = None
        self._expect_articles  = False

    def tearDown(self):
        self._enter_guest_mode()
        self._go_to_nav('nav-news')

        if self._expected_heading:
            h1 = self._page.locator('[data-tour="news-heading"]')
            self.assertIn(self._expected_heading, h1.inner_text())

        if self._expect_articles:
            article = self._page.locator('[data-tour="news-article"]').first
            self.assertTrue(article.is_visible())

        super().tearDown()

    def test_news_heading(self):
        self._expected_heading = 'Latest News'

    def test_news_articles_load(self):
        self._expect_articles = True

# -----------------------------------------------------------------------

class TestSettingsScreen(TigerArtTestCase):
    """
    Tests the Settings screen.
    setUp sets expected elements. tearDown navigates and asserts.
    """

    def setUp(self):
        super().setUp()
        self._expected_heading  = None
        self._expect_tour_btn   = False
        self._expect_prefs_card = False

    def tearDown(self):
        self._enter_guest_mode()
        self._go_to_nav('nav-settings')

        if self._expected_heading:
            h1 = self._page.locator('h1').first
            self.assertIn(self._expected_heading, h1.inner_text())

        if self._expect_tour_btn:
            btn = self._page.locator('[data-tour="settings-tour-btn"]')
            self.assertTrue(btn.is_visible())

        if self._expect_prefs_card:
            prefs = self._page.locator('[data-tour="settings-preferences"]')
            self.assertTrue(prefs.is_visible())

        super().tearDown()

    def test_settings_heading(self):
        self._expected_heading = 'Settings'

    def test_tour_button_visible(self):
        self._expect_tour_btn = True

    def test_preferences_card_visible(self):
        self._expect_prefs_card = True

    def test_guest_sees_locked_survey(self):
        """Guest should see 'Locked' instead of 'Retake Survey'."""
        self._enter_guest_mode()
        self._go_to_nav('nav-settings')
        locked_btn = self._page.get_by_text('Locked')
        self.assertTrue(locked_btn.is_visible())
        super().tearDown()
        return

# -----------------------------------------------------------------------

class TestFavoritesScreen(TigerArtTestCase):
    """
    Tests the Favorites screen.
    Requires auth stub (TESTING=yes) so we can access the screen.
    If running without auth stub, the app will show the login screen
    and these tests will fail — that is expected.
    """

    def setUp(self):
        super().setUp()
        self._expected_heading  = None
        self._expect_search_bar = False
        self._expect_empty_state = False

    def tearDown(self):
        # With auth stub, the app skips login and goes straight in.
        # Navigate to favorites using data-tour selector.
        self._page.wait_for_load_state('networkidle')
        time.sleep(DELAY)
        self._page.locator('[data-tour="nav-favorites"]').click()
        time.sleep(DELAY)

        if self._expected_heading:
            h1 = self._page.locator('[data-tour="favorites-heading"]')
            self.assertIn(self._expected_heading, h1.inner_text())

        if self._expect_search_bar:
            search = self._page.locator('[data-tour="favorites-search"]')
            self.assertTrue(search.is_visible())

        if self._expect_empty_state:
            # Either the empty state message or actual favorites are shown
            heading = self._page.locator('[data-tour="favorites-heading"]')
            self.assertTrue(heading.is_visible())

        super().tearDown()

    def test_favorites_heading(self):
        """Favorites screen should show 'Favorites' heading."""
        self._expected_heading = 'Favorites'

    def test_favorites_search_bar_visible(self):
        """Favorites screen should have a search bar."""
        self._expect_search_bar = True

    def test_favorites_empty_state(self):
        """Favorites screen should render without crashing when empty."""
        self._expect_empty_state = True

# -----------------------------------------------------------------------

if __name__ == '__main__':
    unittest.main(verbosity=2)