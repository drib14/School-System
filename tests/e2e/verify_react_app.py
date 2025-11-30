from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture logs
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        print("Navigating to Login Page...")
        try:
            page.goto("http://localhost:4173/login", timeout=10000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            exit(1)

        # Login as Admin
        print("Logging in as Admin...")
        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")

        # Verify Dashboard
        print("Verifying Admin Dashboard...")
        try:
            page.wait_for_selector("text=Total Students", timeout=5000)
            print("SUCCESS: Admin Dashboard loaded.")
        except:
            print("FAILURE: Admin Dashboard not loaded.")
            print(page.content())
            exit(1)

        # Verify Sidebar Links
        if page.is_visible("text=Students") and page.is_visible("text=Finance"):
             print("SUCCESS: Sidebar links visible.")

        # Screenshot
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/react_dashboard_admin.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
