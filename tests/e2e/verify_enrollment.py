from playwright.sync_api import sync_playwright
import time
import os
import time

def run():
    unique_id = int(time.time())
    email = f"process_{unique_id}@test.com"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture logs
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        # 1. Register
        print(f"Registering Student {email}...")
        page.goto("http://localhost:4173/")
        page.click("text=Enroll Now")
        page.wait_for_url("**/register")

        page.fill('input[name="firstName"]', "Enrollee")
        page.fill('input[name="lastName"]', "Process")
        page.fill('input[name="email"]', email)
        page.fill('input[name="phone"]', "0000000000")
        page.select_option('select[name="role"]', "Student")
        page.fill('input[name="password"]', "password")
        page.click("button[type='submit']")
        page.wait_for_url("**/login")

        # 2. Approve User as Admin
        print("Approving User as Admin...")
        page.goto("http://localhost:4173/")

        page.click("a[href='/login']")
        page.wait_for_url("**/login")

        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")

        # Wait for Dashboard Sidebar
        try:
            page.wait_for_selector(".sidebar", timeout=5000)
        except:
            print("FAILURE: Admin login failed or Dashboard not loaded.")
            print(page.content())
            exit(1)

        page.click("text=Admissions")
        # Approve User (First Tab)
        try:
            # wait for table
            page.wait_for_selector(f"text={email}", timeout=5000)
            page.locator("tr", has_text=email).locator("button.btn-success").click()
        except:
            print("FAILURE: Could not find Approve button for user.")
            print(page.content())
            exit(1)

        time.sleep(1)

        # Logout
        page.click(".user-profile")
        page.click("text=Logout")
        page.wait_for_url("**/login")

        # 3. Login as Student and Enroll
        print("Logging in as Student...")
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', "password")
        page.click("button[type='submit']")

        print("Completing Enrollment Flow...")
        # Should redirect to enrollment
        page.wait_for_url("**/enrollment")

        # Step 1: Academic
        page.select_option('select[name="department"]', "Senior High School")
        page.select_option('select[name="program"]', "STEM")
        page.select_option('select[name="yearLevel"]', "Grade 11")
        page.select_option('select[name="section"]', "A")
        page.click("text=Next: View Fees")

        # Step 2: Fees
        page.click("text=Proceed to Payment")

        # Step 3: Payment
        page.select_option('select[name="paymentMethod"]', "GCash")

        if not os.path.exists("dummy.png"):
            with open("dummy.png", "w") as f:
                f.write("dummy")

        file_inputs = page.query_selector_all('input[type="file"]')
        for inp in file_inputs:
            inp.set_input_files("dummy.png")

        page.click("button[type='submit']")
        time.sleep(2) # Wait for reload

        # Verify Pending Status
        try:
            page.wait_for_selector("text=Enrollment Pending", timeout=5000)
            print("SUCCESS: Enrollment Submitted (Pending).")
        except:
            print("FAILURE: Pending status not shown.")
            exit(1)

        # Logout
        page.click(".user-profile")
        page.click("text=Logout")

        # 4. Approve Enrollment as Admin
        print("Approving Enrollment as Admin...")
        page.goto("http://localhost:4173/login")
        page.fill('input[type="email"]', "admin@educore.edu")
        page.fill('input[type="password"]', "admin")
        page.click("button[type='submit']")

        page.wait_for_selector(".sidebar", timeout=5000)

        page.click("text=Admissions")
        page.click("text=Enrollment Requests") # Switch Tab

        try:
            # Wait for any enrollment row
            page.wait_for_selector("table tbody tr button.btn-success", timeout=5000)
            page.locator("table tbody tr:last-child button.btn-success").click()
        except:
             print("FAILURE: Could not find Approve button for enrollment.")
             print(page.content())
             exit(1)

        time.sleep(1)

        page.click(".user-profile")
        page.click("text=Logout")

        # 5. Verify Active Status as Student
        print("Verifying Active Status...")
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', "password")
        page.click("button[type='submit']")

        page.goto("http://localhost:4173/enrollment")
        try:
            page.wait_for_selector("text=Officially Enrolled!", timeout=5000)
            print("SUCCESS: Officially Enrolled.")
        except:
            print("FAILURE: COR not active.")
            exit(1)

        browser.close()

if __name__ == "__main__":
    run()
