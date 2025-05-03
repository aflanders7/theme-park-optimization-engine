from flask import Flask, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv() 

@app.route('/check')
def check_dining():
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--disable-blink-features=AutomationControlled")

    driver = webdriver.Chrome(options=options)

    email = os.getenv("DISNEY_EMAIL")
    password = os.getenv("DISNEY_PASSWORD")

    try:

        driver.get("https://disneyworld.disney.go.com/dine-res/availability")
        time.sleep(10)
        print("here0")

        driver.get("https://disneyworld.disney.go.com/login/")
        time.sleep(3)
        print("here")

        iframe = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "oneid-iframe")))
        driver.switch_to.frame(iframe)

        print("success")

        email_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "InputIdentityFlowValue")))
        email_input.send_keys(email)

        print("success2")

        driver.find_element(By.ID, "BtnSubmit").click()
        time.sleep(2)


        pw_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "InputPassword")))
        pw_input.send_keys(password)
        print("success3")

        driver.find_element(By.ID, "BtnSubmit").click()
        time.sleep(2)
        print("success4")
        page_data = driver.page_source

        return jsonify({"status": "success", "data_snippet": page_data[:500]})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
    finally:
        driver.quit()

# Entry point
if __name__ == "__main__":
    app.run(debug=True, port=5001)
