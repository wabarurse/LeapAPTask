import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
const page = await browser.newPage();

// Login
await page.goto("https://app-dev.condoworks.co/security/login?return=/home/index");
await page.type("#Email", "coop.test@condoworks.co");
await page.type("#Password", "TheTest139");
await page.click("#btnSubmit");
await page.waitForNavigation({ waitUntil: 'networkidle2' });

// Navigate to Invoices -> All
try {
    await page.waitForSelector('.navbar-toggler', { visible: true, timeout: 50 });
    await page.click('.navbar-toggler');
    console.log("Navbar toggler is visible.");
    await page.waitForFunction(() => {
        const toggler = document.querySelector('.navbar-toggler');
        return toggler && toggler.classList.contains('show');
    }, { timeout: 100 });
} catch (err) {
    console.log("Navbar toggler is not visible, skipping the click.");
}

await page.waitForSelector('[id^="InvoicesMenuLink"]', { visible: true });
await page.click('[id^="InvoicesMenuLink"]');
await page.waitForSelector('.dropdown-menu.show', { visible: true });
await page.waitForSelector('a.dropdown-item[href="/invoices/all"]', { visible: true });
await page.click('a.dropdown-item[href="/invoices/all"]');

console.log("Clicked All link, waiting for page transition...");
// Now let's wait for the table to be fully initialized
await page.waitForSelector('#grid > tbody > tr', { visible: true, timeout: 20000 });
console.log("Found the grid table, waiting for it to populate...");


await page.waitForSelector('#grid', { visible: true, timeout: 20000 });
const tableDataToJson = await page.evaluate(() => {
    const table = document.getElementById("grid");

    const headerCells = Array.from(table.querySelectorAll("thead > tr > th"))

    const headers = headerCells
        .map(th => {
            const titleSpan = th.querySelector('.dt-column-title');
            const text = titleSpan ? titleSpan.textContent.trim() : "";
            return text || "empty";
        })
        .filter(header => header !== "empty")
        
    const data = {};
    headers.forEach(header => {
        data[header] = [];
    });

    headers.reverse();


    const rows = Array.from(table.querySelectorAll("tbody > tr"));
    rows.forEach(row => {
        const tableData = Array.from(row.querySelectorAll("td"))
        tableData.reverse();
        
        for(let i = 0; i < headers.length; i++) {
            data[headers[i]].push(tableData[i].textContent.trim());
        }
    });

    return JSON.stringify(data, null, 2);
});

console.log("Table data as JSON with column names:");
console.log(tableDataToJson);