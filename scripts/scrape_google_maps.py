"""
Google Maps Lead Scraper
Automated script to extract business details from Google Maps
"""

import time
import csv
import json
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

def scrape_google_maps(query, max_results=20):
    """
    Scrape Google Maps for business listings
    
    Args:
        query: Search query (e.g., "restaurants in Pune")
        max_results: Maximum number of results to scrape
    
    Returns:
        List of business details
    """
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = None
    businesses = []
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Navigate to Google Maps
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        driver.get(url)
        
        # Wait for results to load
        time.sleep(3)
        
        # Scroll to load more results
        scrollable_div = driver.find_element(By.CSS_SELECTOR, 'div[role="feed"]')
        
        for i in range(5):  # Scroll 5 times to load more results
            driver.execute_script('arguments[0].scrollTop = arguments[0].scrollHeight', scrollable_div)
            time.sleep(2)
        
        # Find all business cards
        results = driver.find_elements(By.CSS_SELECTOR, 'div[role="article"]')
        
        print(f"Found {len(results)} results")
        
        for idx, result in enumerate(results[:max_results]):
            try:
                # Click on the business to open details panel
                result.click()
                time.sleep(2)
                
                business = {}
                
                # Extract business name
                try:
                    name_elem = driver.find_element(By.CSS_SELECTOR, 'h1.DUwDvf')
                    business['name'] = name_elem.text
                except:
                    business['name'] = 'N/A'
                
                # Extract rating
                try:
                    rating_elem = driver.find_element(By.CSS_SELECTOR, 'span.ceNzKf')
                    business['rating'] = rating_elem.get_attribute('aria-label').split(' ')[0]
                except:
                    business['rating'] = 'N/A'
                
                # Extract review count
                try:
                    reviews_elem = driver.find_element(By.CSS_SELECTOR, 'span.RDApEe')
                    reviews_text = reviews_elem.text
                    business['reviews'] = reviews_text.replace('(', '').replace(')', '').replace(',', '')
                except:
                    business['reviews'] = '0'
                
                # Extract category
                try:
                    category_elem = driver.find_element(By.CSS_SELECTOR, 'button[jsaction*="category"]')
                    business['category'] = category_elem.text
                except:
                    business['category'] = query.split(' ')[0]
                
                # Extract address
                try:
                    address_elem = driver.find_element(By.CSS_SELECTOR, 'button[data-item-id="address"]')
                    business['address'] = address_elem.get_attribute('aria-label').replace('Address: ', '')
                except:
                    business['address'] = 'N/A'
                
                # Extract phone
                try:
                    phone_elem = driver.find_element(By.CSS_SELECTOR, 'button[data-item-id*="phone"]')
                    business['phone'] = phone_elem.get_attribute('aria-label').replace('Phone: ', '')
                except:
                    business['phone'] = 'N/A'
                
                # Extract website
                try:
                    website_elem = driver.find_element(By.CSS_SELECTOR, 'a[data-item-id="authority"]')
                    business['website'] = website_elem.get_attribute('href')
                except:
                    business['website'] = 'N/A'
                
                # Extract opening hours
                try:
                    hours_elem = driver.find_element(By.CSS_SELECTOR, 'button[data-item-id*="oh"]')
                    business['hours'] = hours_elem.get_attribute('aria-label')
                except:
                    business['hours'] = 'N/A'
                
                # Get Google Maps URL
                business['google_maps_url'] = driver.current_url
                
                businesses.append(business)
                print(f"Scraped {idx + 1}/{max_results}: {business['name']}")
                
            except Exception as e:
                print(f"Error scraping business {idx + 1}: {str(e)}")
                continue
        
    except Exception as e:
        print(f"Error during scraping: {str(e)}")
    
    finally:
        if driver:
            driver.quit()
    
    return businesses

def save_to_csv(businesses, filename='leads.csv'):
    """Save scraped data to CSV"""
    if not businesses:
        print("No businesses to save")
        return
    
    keys = businesses[0].keys()
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(businesses)
    
    print(f"Saved {len(businesses)} businesses to {filename}")

if __name__ == "__main__":
    # Read arguments
    if len(sys.argv) < 2:
        print("Usage: python scrape_google_maps.py <query> [max_results]")
        sys.exit(1)
    
    query = sys.argv[1]
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    print(f"Scraping Google Maps for: {query}")
    print(f"Max results: {max_results}")
    
    # Scrape businesses
    businesses = scrape_google_maps(query, max_results)
    
    # Save to CSV
    if businesses:
        save_to_csv(businesses, 'leads.csv')
        
        # Also output as JSON for API consumption
        print("\n===JSON_OUTPUT_START===")
        print(json.dumps(businesses, indent=2))
        print("===JSON_OUTPUT_END===")
    else:
        print("No businesses found")
