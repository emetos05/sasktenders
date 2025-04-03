## About the project

**DISCLAIMER**

- [SaskTenders Warranty Disclaimer](https://sasktenders.ca/Content/Public/Disclaimer.aspx)
- I take no responsibility for what others do with this code, totally discourage scraping websites for profit without permission. This repo is for learning purpose only.

### Webscraping project

Scrape tender details from a public website and save to CSV.

### Tools used

- [Puppeteer](https://pptr.dev/) - A high-level API to control headless Chrome over the DevTools Protocol.

- To run the project:
  -- Clone the repo
  -- Ensure you have Node.js and npm installed
  -- Run npm install
  -- Replace [URL_HERE] with "https://sasktenders.ca/content/public/Search.aspx"
  -- Choose a Category from the "Category" dropdown at the URL
  -- Replace [CATEGORY_HERE] with the chosen Category
  -- Choose a Status from the "Competition Status" dropdown at the URL
  -- Replace [STATUS_HERE] with the chosen Status
  -- Run the command "node scraper.js" in terminal/CMD
