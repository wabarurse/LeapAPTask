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
try { // we check if the navbar toggler is visible, if it is, we click it. Its visible when the page width is reduced.
    await page.waitForSelector('.navbar-toggler', { visible: true, timeout: 50 });
    await page.click('.navbar-toggler');
    await page.waitForFunction(() => {
        const toggler = document.querySelector('.navbar-toggler');
        return toggler && toggler.classList.contains('show');
    }, { timeout: 100 });
} catch (err) {}

// wait and click on invoices then wait and click on all
await page.waitForSelector('[id^="InvoicesMenuLink"]', { visible: true });
await page.click('[id^="InvoicesMenuLink"]');
await page.waitForSelector('.dropdown-menu.show', { visible: true });
await page.waitForSelector('a.dropdown-item[href="/invoices/all"]', { visible: true });
await page.click('a.dropdown-item[href="/invoices/all"]');

await page.waitForSelector('#grid thead tr', { visible: true });


// find the invoice # column index
const headers = await page.$$('#grid > thead > tr:nth-child(1) > th');
let invoiceNumber = -1;
for (let i = 0; i < headers.length; i++) {
    const headersText = await headers[i].evaluate(r => r.innerText);
    if (headersText.includes("Invoice #")) {
        invoiceNumber = i + 1; // + 1 because selectors are 1-indexed
        break;
    }
}


// Use the found invoice # column index to enter 123 in the invoice # search. Also works when the input is not visible.
await page.evaluate((selector) => {
    const input = document.querySelector(selector);
    if (input) {
        input.value = '123';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    }
}, `tr > th:nth-child(${invoiceNumber}) input`);

await new Promise(resolve => setTimeout(resolve, 1000)); // wait for one second


// Find  the row containing Invoice # 123444 and click the "View/Edit" link
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

// Extract pdf link
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

    // Use a buffer to save the pdf as numbers because I was having corruption issues with the pdf
    const pdfBufferArray = await page.evaluate(async (pdfUrl) => {
        const response = await fetch(pdfUrl, { credentials: 'include' });
        const arrayBuffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
    }, pdfUrl);

    // Convert the array of numbers back to a Node.js Buffer for file writing (this fixed the corruption issue I was having)
    const pdfBuffer = Buffer.from(pdfBufferArray);

    // Save the pdf
    fs.writeFileSync(filePath, pdfBuffer);
    console.log("Download completed.\nSaved file at:", filePath);
} else {
    console.log("No embedded PDF found.");
}