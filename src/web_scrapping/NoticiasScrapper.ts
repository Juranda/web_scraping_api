import { Noticia } from "../models/Noticia.js";
import puppeteer from "puppeteer";

type Selector = Promise<puppeteer.ElementHandle<Element>> | HTMLElement | HTMLElement[] | NodeListOf<Element> | Element | Element[] | null;
type CreatePageBrowserParams = {
    headless?: boolean
};

export abstract class NoticiaScrapper {
    abstract buscarNoticias(): Promise<Noticia[]>;

    public async sleep(milliseconds: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    async selectUntilLoad<T extends Selector>(selectorFunction: () => T, delayInMilliseconds: number = 1000, retries: number = 5): Promise<T> {
        let select: T | null = null;
        let retriedTimes = 0;

        do {
            await this.sleep(delayInMilliseconds);
            select = selectorFunction();

            if (retriedTimes >= retries) {
                return select;
            }

            retriedTimes++;

            if (retriedTimes > 1) {
                console.warn(`Retrying to select element, attempt ${retriedTimes}...`);
            }
        } while (select === null || (Array.isArray(select) && select.length === 0));

        return select;
    }

    async createPageBrowser({ headless = true }: CreatePageBrowserParams): Promise<{ page: puppeteer.Page, browser: puppeteer.Browser }> {
        
        const browser = await puppeteer.launch({
            headless: headless
        });

        const page = await browser.newPage();
        page.on('console', (msg) => {
            switch (msg.type()) {
                case 'log': console.log(`PAGE CONSOLE: ${msg.text()}`); break;
                case 'error': console.error(`PAGE CONSOLE: ${msg.text()}`); break;
                case 'warn': console.warn(`PAGE CONSOLE: ${msg.text()}`); break;
                case 'info': console.info(`PAGE CONSOLE: ${msg.text()}`); break;
                case 'debug': console.debug(`PAGE CONSOLE: ${msg.text()}`); break;
                default: console.log(`Unknown console message type: ${msg.type()} - ${msg.text}}`);
            }
        });

        return { page, browser };
    }
}