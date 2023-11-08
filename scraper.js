import puppeteer from "puppeteer";
import fs from "fs";

// INPUT CONSTANTS TO PAGE
const CATEGORY = "[CATEGORY_HERE]";
const STATUS = "[STATUS_HERE]";

// Function to extract tender details from URL
const getTenders = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("[URL_HERE]", {
    waitUntil: "domcontentloaded",
  });

  const selectCategory = await page.$(
    'select[name="ctl00$ContentPlaceHolder1$ddlCommodityList"]'
  );
  await selectCategory.type(CATEGORY);

  const selectStatus = await page.$(
    'select[name="ctl00$ContentPlaceHolder1$ddlStatusList"]'
  );
  await selectStatus.type(STATUS);

  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click(".search_criteria_search"),
  ]);

  // Variables declaration
  const rowHeaderData = [];
  const rowDetails = [];

  // Get page data
  const scrapePage = async () => {
    const headerSelector =
      "#ContentPlaceHolder1.HeaderAccordionPlusFormat > table > tbody > tr";

    const getHeaderData = await page.$$eval(headerSelector, (items) =>
      items.map((item) =>
        [...item.querySelectorAll("td")].map((e) => e.textContent.trim())
      )
    );

    getHeaderData.forEach((item) => item.shift());

    rowHeaderData.push(getHeaderData);

    const detailsSelector =
      "#ContentPlaceHolder1 > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody";

    const getDetails = await page.$$eval(detailsSelector, (items) =>
      items.map((item) =>
        [...item.querySelectorAll("td")].map((e) =>
          e.textContent.trim().replace(/\s+/gm, " ")
        )
      )
    );

    getDetails.forEach((item) => item.splice(0, 4));
    getDetails.forEach((item) => item.splice(1, 1));
    getDetails.forEach((item) => item.splice(2, 1));
    getDetails.forEach((item) => item.splice(3, 5));
    const details = getDetails.map((items) =>
      items.filter(
        (e) => !e.includes("PDF") || !e.includes("DOC") || !e.includes("DOCX")
      )
    );
    details.forEach((item) => {
      for (let i = 3; i < item.length; i++) {
        if (item[3].startsWith("Award")) {
          break;
        }
        item.splice(3, 1);
      }
    });

    const filteredDetails = details.map((items) =>
      items.filter((e) => !e.startsWith("Award"))
    );

    rowDetails.push(filteredDetails);

    const nextPageInactive = await page.$(
      "#ContentPlaceHolder1_upnlSearchResults > div.result_details_section > div > div > div > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.aspNetDisabled"
    );

    if (!nextPageInactive) {
      const [response] = await Promise.all([
        page.click("#ContentPlaceHolder1_lnkNextPage"),
        new Promise((_) => setTimeout(_, 30000)),
      ]);

      return scrapePage();
    }

    // Close browser
    await browser.close();

    return [rowHeaderData.flat(), rowDetails.flat()];
  };

  const data = await scrapePage();
  return data;
};

// Merge data
const tenders = await getTenders();

const fullTenderDetails = tenders[0].map((element, index) =>
  element.concat(tenders[1][index])
);

// Find longest sub-array
const longestTender = Math.max(...fullTenderDetails.map((item) => item.length));

// Fill short sub-arrays with empty cell
const finalTenders = fullTenderDetails.map((item) => {
  while (item.length < longestTender) {
    item.push("");
  }
  return item;
});

// Add headers to tenders before csv processing
const headers = [
  "COMPETITION NAME",
  "ORGANIZATION NAME",
  "COMPETITION #",
  "OPEN DATE",
  "CLOSE DATE",
  "STATUS",
  "COMPETITION TYPE",
  "AGREEMENT TYPE",
  "PUBLIC OPENING",
  "WINNER",
  "ADDRESS",
  "AMOUNT",
  "DATE",
];
const combinedData = [headers, ...finalTenders.map((item) => item)]
  .map((e) => e.join("|"))
  .join("\n");

// Convert to csv and save to file
const filePath = `${CATEGORY}.csv`;
fs.writeFile(filePath, combinedData, (err) => {
  if (err) {
    console.error("Error occured while saving file:", err);
  } else {
    console.log("File was saved successfully:", filePath);
  }
});
