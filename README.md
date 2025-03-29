## Program 1: Parser problem 🗂️
- **Features:** Extracts key information from utility bill text files using regular expressions. It extracts:

- Customer/Account Numbers  
- Bill Period  
- Bill Number  
- Bill Date  
- Total New Charges  

**Run Command:**
```bash
node parsing.js <your-text-file.txt>
```

## Program 2: Scraper Problem 🥄

**Features:**  
A Puppeteer-based web scraper that:

- Navigates to the invoice system  
- Searches for a specific invoice  
- Downloads its PDF  

Includes:

- Automated login and navigation  
- Dynamic table column detection  
- Invoice search functionality  
- PDF extraction and download  

**Run Command:**
```bash
npm i
node scraper.js
```