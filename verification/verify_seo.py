from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for server to be ready (naive)
        print("Waiting for server...")
        time.sleep(10)

        try:
            # 1. Verify Home Page
            print("Navigating to Home...")
            page.goto("http://127.0.0.1:3000", timeout=60000)
            page.screenshot(path="verification/home.png")
            print("Home screenshot taken.")

            # 2. Verify Courses Page
            print("Navigating to Courses...")
            page.goto("http://127.0.0.1:3000/courses", timeout=60000)
            page.screenshot(path="verification/courses.png")
            print("Courses screenshot taken.")

            # 3. Verify About Page
            print("Navigating to About...")
            page.goto("http://127.0.0.1:3000/about", timeout=60000)
            page.screenshot(path="verification/about.png")
            print("About screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
