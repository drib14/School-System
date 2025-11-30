from playwright.sync_api import sync_playwright
import time
import os

def run():
    unique_id = int(time.time())
    parent_email = f"parent_{unique_id}@test.com"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        # 1. Test Parent Auto-Approval
        print("Registering Parent...")
        page.goto("http://localhost:4173/register")
        page.fill('input[name="firstName"]', "Parent")
        page.fill('input[name="lastName"]', "User")
        page.fill('input[name="email"]', parent_email)
        page.fill('input[name="phone"]', "0000000000")
        page.select_option('select[name="role"]', "Parent")
        page.fill('input[name="password"]', "password")
        page.click("button[type='submit']")

        # Should redirect to login
        page.wait_for_url("**/login")
        print("Redirected to Login.")

        # Login as Parent
        print("Logging in as Parent...")
        page.fill('input[type="email"]', parent_email)
        page.fill('input[type="password"]', "password")
        page.click("button[type='submit']")

        # Should go to Dashboard immediately (no pending error)
        try:
            page.wait_for_selector(".sidebar", timeout=5000)
            print("SUCCESS: Parent Auto-Approved and Logged In.")
        except:
            print("FAILURE: Parent Login failed.")
            print(page.content())
            exit(1)

        page.click(".user-profile")
        page.click("text=Logout")

        # 2. Test Admin User Management
        print("Logging in as Admin...")
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")
        page.wait_for_selector(".sidebar")

        print("Checking User Management...")
        page.click("text=Users") # In sidebar
        try:
            page.wait_for_selector("text=User Management", timeout=5000)
            page.wait_for_selector(f"text={parent_email}", timeout=5000)
            print("SUCCESS: User Management Page loaded and Parent found.")
        except:
            print("FAILURE: User Management Page check failed.")
            exit(1)

        page.click(".user-profile")
        page.click("text=Logout")

        # 3. Test Student Dashboard
        print("Logging in as Student (assuming one exists or creating)...")
        # Reuse process_ email from previous test if possible, or create new
        student_email = f"student_{unique_id}@test.com"
        page.goto("http://localhost:4173/register")
        page.fill('input[name="firstName"]', "Student")
        page.fill('input[name="lastName"]', "Test")
        page.fill('input[name="email"]', student_email)
        page.fill('input[name="phone"]', "0000000000")
        page.select_option('select[name="role"]', "Student")
        page.fill('input[name="password"]', "password")
        page.click("button[type='submit']")
        page.wait_for_url("**/login")

        # Approve student first (since students still need approval)
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")
        page.wait_for_selector(".sidebar")
        page.click("text=Admissions")
        page.click("button.btn-success") # Approve
        page.click(".user-profile")
        page.click("text=Logout")

        # Login Student
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', student_email)
        page.fill('input[type="password"]', "password")
        page.click("button[type='submit']")

        # Might go to Enrollment if logic triggers, but we check Dashboard elements
        # If redirected to Enrollment, navigate to Dashboard (if sidebar available)
        # Note: Previous logic forces enrollment.
        # But we want to check "Student Friendly" UI components.
        # If forced to enrollment, we can't see dashboard.
        # So we must complete enrollment?
        # Or I can tweak ProtectedRoute to skip enrollment check for this test?
        # I'll just check if I land on Enrollment, it means logic works.
        # But to check Dashboard UI, I need to enroll.

        print("Completing Enrollment for UI Check...")
        page.wait_for_url("**/enrollment")
        page.select_option('select[name="department"]', "Senior High School")
        page.select_option('select[name="program"]', "STEM")
        page.select_option('select[name="yearLevel"]', "Grade 11")
        page.select_option('select[name="section"]', "A")
        page.click("text=Next: View Fees")
        page.click("text=Proceed to Payment")
        page.select_option('select[name="paymentMethod"]', "GCash")
        if not os.path.exists("dummy.png"):
            with open("dummy.png", "w") as f: f.write("d")
        file_inputs = page.query_selector_all('input[type="file"]')
        for inp in file_inputs: inp.set_input_files("dummy.png")
        page.click("button[type='submit']")
        time.sleep(2)

        # Now approve enrollment
        page.click(".user-profile"); page.click("text=Logout")
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")
        page.click("text=Admissions")
        page.click("text=Enrollment Requests")
        page.locator("table tbody tr:last-child button.btn-success").click()
        page.click(".user-profile"); page.click("text=Logout")

        # Login Student Again
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', student_email)
        page.fill('input[type="password"]', "password")
        page.click("button[type='submit']")

        # Now we should see Student Dashboard
        try:
            page.wait_for_selector("text=Welcome back, Student!", timeout=5000)
            page.wait_for_selector("text=Today's Schedule")
            page.wait_for_selector("text=Due Assignments")
            print("SUCCESS: Student Dashboard loaded with correct widgets.")
        except:
            print("FAILURE: Student Dashboard widgets not found.")
            # print(page.content())
            exit(1)

        # Check Sidebar Restrictions
        content = page.content()
        if "Users" in content or "Settings" in content: # specific Admin items
             print("FAILURE: Admin items found in Student Sidebar.")
             exit(1)

        # Check Canteen View
        page.click("text=Canteen")
        try:
            page.wait_for_selector("text=Canteen Menu & Ordering")
            if page.is_visible("text=Open POS"):
                print("FAILURE: Student can see POS button.")
                exit(1)
            print("SUCCESS: Student Canteen View correct.")
        except:
            print("FAILURE: Canteen page check failed.")
            exit(1)

        browser.close()

if __name__ == "__main__":
    run()
