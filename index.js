import puppeteer from "puppeteer";
import fs from "fs/promises";

async function navigateWebPage() {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100
    });
    const page = await browser.newPage();
    //El viewport es ese ya que en tamaño responsive cambian el nombre de los elementos
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto("https://www.farmaonline.com/");
    await page.waitForSelector(".vtex-input-prefix__group");
    const input = await page.$("#downshift-0-input");

    // Nombre del producto que se quiere buscar
    const productName = "serum";
    await input.type(productName);
    await input.press("Enter");
    // Espera 6 segundos para encontrar los elementos
    await new Promise(resolve => setTimeout(resolve, 6000))
    

    //fix scroll 
    async function scrollPageToBottom() {
        const previousHeight = await page.evaluate(() => document.body.scrollHeight);

        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });

        await new Promise(resolve => setTimeout(resolve, 3000)); // Espera un tiempo después del desplazamiento

        const currentHeight = await page.evaluate(() => document.body.scrollHeight);
        return currentHeight > previousHeight; // Retorna true si hay nuevos elementos cargados
    }

    // Captura los nombres y precios de todos los productos en la página (incluyendo los que se cargaron con el "infinite scroll")
    const products = [];

    let hasMoreProducts = true;
    while (hasMoreProducts) {
        hasMoreProducts = await scrollPageToBottom();

            const productsData = await page.evaluate(() => {
            const productElements = document.querySelectorAll("a.vtex-product-summary-2-x-clearLink.vtex-product-summary-2-x-clearLink--general-product-summary");
            const productsData = [];

            productElements.forEach((element) => {
                const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrandName");
                const priceElement = element.querySelector(".vtex-product-price-1-x-sellingPriceValue");
                const linkPartial = element.getAttribute("href"); 
                const domain = "https://www.farmaonline.com";


                const name = nameElement ? nameElement.innerText.trim() : "Nombre no encontrado";
                const price = priceElement ? priceElement.innerText.trim() : "Precio no encontrado";
                const link = domain + linkPartial;

                productsData.push({ name, price, link });
            });

            return productsData;
        });

        products.push(...productsData);

        // Espera un tiempo después de cada ciclo para que se carguen los nuevos elementos antes de verificar nuevamente
        await new Promise(resolve => setTimeout(resolve, 6000));
    }

    console.log(products);

    await fs.writeFile("farma.json", JSON.stringify(products, null, 2));


    await new Promise(resolve => setTimeout(resolve, 6000))

    await browser.close();
}

navigateWebPage()