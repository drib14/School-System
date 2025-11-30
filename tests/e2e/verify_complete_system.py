from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        # Login Admin
        print("Logging in as Admin...")
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")
        page.wait_for_selector(".sidebar")

        # 1. Schedule Class
        print("Testing Scheduling...")
        page.click("text=Scheduling")
        page.click("text=Create Schedule")
        page.fill('input[name="subject"]', "BIO101")
        page.fill('input[name="startTime"]', "09:00")
        page.fill('input[name="endTime"]', "10:30")
        page.click("div.modal-footer button:has-text('Save Schedule')")
        page.wait_for_selector("text=BIO101")
        print("SUCCESS: Class Scheduled.")

        # 2. Schedule Exam
        print("Testing Exam Scheduling...")
        page.click("text=Examinations")
        page.click("text=Schedule Exam")
        page.fill('input[name="title"]', "Finals")
        page.fill('input[name="subject"]', "BIO101")
        page.fill('input[name="date"]', "2024-12-10")
        page.click("div.modal-footer button:has-text('Schedule')")
        page.wait_for_selector("text=Finals")
        print("SUCCESS: Exam Scheduled.")

        # 3. Add Book
        print("Testing Library...")
        page.click("text=Library")
        page.click("text=Add Book")
        page.fill('input[name="title"]', "The Great Gatsby")
        page.fill('input[name="author"]', "F. Scott Fitzgerald")
        page.fill('input[name="isbn"]', "1234567890")
        page.click("div.modal-footer button:has-text('Save Book')")
        page.wait_for_selector("text=The Great Gatsby")
        print("SUCCESS: Book Added.")

        # 4. Create Invoice
        print("Testing Finance...")
        page.click("text=Finance")
        page.click("text=Create Invoice")
        page.fill('input[name="student"]', "Test Student")
        page.fill('input[name="amount"]', "5000")
        page.click("div.modal-footer button:has-text('Create')")
        page.wait_for_selector("text=Test Student")
        print("SUCCESS: Invoice Created.")

        print("ALL TESTS PASSED.")
        browser.close()

if __name__ == "__main__":
    run()
