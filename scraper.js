import puppeteer from "puppeteer";
import fs from "fs";

const browser = await puppeteer.launch({ headless: false });
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
    await page.waitForFunction(() => {
        const toggler = document.querySelector('.navbar-toggler');
        return toggler && toggler.classList.contains('show');
    }, { timeout: 100 });
} catch (err) {}

await page.waitForSelector('[id^="InvoicesMenuLink"]', { visible: true });
await page.click('[id^="InvoicesMenuLink"]');
await page.waitForSelector('.dropdown-menu.show', { visible: true });
await page.waitForSelector('a.dropdown-item[href="/invoices/all"]', { visible: true });
await page.click('a.dropdown-item[href="/invoices/all"]');

// Wait for the table header row to appear
await page.waitForSelector('#grid thead tr', { visible: true });

// Find the Invoice # column
const headers = await page.$$('#grid > thead > tr:nth-child(1) > th');
let invoiceNumber = -1;
for (let i = 0; i < headers.length; i++) {
    const headersText = await headers[i].evaluate(r => r.innerText);
    if (headersText.includes("Invoice #")) {
        invoiceNumber = i + 1; // selectors are 1-indexed
        break;
    }
}


// Enter "123" in the Invoice # field
await page.evaluate((selector) => {
    const input = document.querySelector(selector);
    if (input) {
        input.value = '123';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    }
}, `tr > th:nth-child(${invoiceNumber}) input`);

await new Promise(resolve => setTimeout(resolve, 1000));

// Find and click the "View/Edit" link for Invoice # 123444
const rows = await page.$$('tbody > tr');
for (const row of rows) {
    const rowText = await row.evaluate(r => r.innerText);
    if (rowText.includes('123444')) {
        const link = await row.$('a[title="View/Edit"]');
        if (link) {
            await link.click();
        } else {
            console.log("Could not find the 'View/Edit' link in the row.");
        }
        break;
    }
}

// Wait for and extract PDF
await page.waitForSelector('object.kv-preview-data.file-preview-pdf', { visible: true });
const pdfUrl = await page.evaluate(() => {
    const obj = document.querySelector('object.kv-preview-data.file-preview-pdf');
    if (obj) {
        const dataUrl = obj.getAttribute('data');
        return new URL(dataUrl, window.location.href).href;
    }
    return null;
});

// Save the PDF locally
if (pdfUrl) {
    const filePath = "./invoice_123444.pdf";

    // Download the PDF using the browser context fetch with credentials
    const pdfBufferArray = await page.evaluate(async (pdfUrl) => {
        const response = await fetch(pdfUrl, { credentials: 'include' });
        const arrayBuffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
    }, pdfUrl);

    // Convert the array to a Buffer and save the file
    const pdfBuffer = Buffer.from(pdfBufferArray);
    fs.writeFileSync(filePath, pdfBuffer);
    console.log("Download completed.\nSaved file at:", filePath);
} else {
    console.log("No embedded PDF found.");
}