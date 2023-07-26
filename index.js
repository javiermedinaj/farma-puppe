import puppeteer from "puppeteer";
import fs from "fs/promises";

async function navigateWebPage() {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100
    });
    const page = await browser.newPage();

    await page.goto("https://www.farmaonline.com/")
    await page.click('a[href = "/ofertas-home"]')
    await page.screenshot({
        path: 'index.png'
    })
    await new Promise(resolve => setTimeout(resolve, 3000))
    await browser.close()
}

navigateWebPage()