import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        print("Navigating to login page...")
        await page.goto("http://localhost:5173/login")

        # Click on Student role in quick login to select role
        await page.get_by_text("Student", exact=True).click()

        # Try to fill email
        await page.get_by_placeholder("email@iscp.edu.ph").fill("25-00001")
        await page.get_by_placeholder("••••••••").fill("25-00001R")

        print("Submitting login...")
        await page.get_by_role("button", name="Sign In").click()

        print("Waiting for navigation...")
        try:
            await page.wait_for_url("**/student-dashboard", timeout=10000)
            print("Successfully navigated to student dashboard.")
        except Exception as e:
            print(f"Failed to navigate: {e}")

        print("Taking screenshot...")
        await page.screenshot(path="/home/jules/verification/student_dash_after_login2.png")

        await browser.close()

asyncio.run(main())
