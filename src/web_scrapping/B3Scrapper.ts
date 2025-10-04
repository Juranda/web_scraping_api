import { ElementHandle } from "puppeteer";
import { Noticia } from "../models/Noticia.js";
import { NoticiaScrapper } from "./NoticiasScrapper.js";

export class B3Scrapper extends NoticiaScrapper {
    public async buscarNoticias(): Promise<Noticia[]> {
        const noticias: Noticia[] = [];
        const { page, browser } = await this.createPageBrowser({
            headless: false
        });
        const baseUrl = "https://www.b3.com.br/pt_br/noticias/";
        let currentPage = 1;
        let nextPageAnchor: ElementHandle<HTMLAnchorElement> | null = null;
        
        const response = await page.goto(baseUrl);

        if (!response?.ok()) {
            console.error("Ocorreu um erro ao tentar entrar no site da B3. status #%d content: ", response?.status(), await response?.content());

            return [];
        }

        while (nextPageAnchor || currentPage === 1) {
            console.log("Escaniando a pagina " + currentPage);
            const pagination = await page.waitForSelector("ul.pagination", {
                timeout: 5000
            });
            
            if(pagination === null) {
                console.error("Pagination nao foi encontrado dentro do timeout");
                break;
            }

            const as = await pagination.$$('a');

            for(const a of as) {
                const aNumber = await a.evaluate(el => {
                    try {
                        return Number.parseInt(el.innerText);
                    } catch(err) {
                        return -1;
                    }
                });

                if(aNumber === currentPage + 1) {
                    nextPageAnchor = a;
                }
            }

            const links = await page.$$('a#link-noticia');

            if (links.length === 0) {
                console.warn("Nenhuma noticia encontrada na pagina");
                break;
            }

            for (const link of links) {
                const noticia = await link.$("div.card.clickable");

                if (noticia === null) {
                    console.error("Noticia nao encontrada no link");
                    continue;
                }

                const ps = await noticia.$$("p");
                const subheader = await noticia.$("h4.subheader");

                if (subheader === null) {
                    console.error("Descricao nao encontrada");
                    continue;
                }

                const dataTexto = await ps[0].evaluate(el => el.innerText);
                const titulo = await subheader.evaluate(el => el.innerText);
                const descricao = await ps[1].evaluate(el => el.innerText);
                const urlTexto = await link.evaluate(el => el.href);
                const url = urlTexto;
                const [dia, mes, ano] = dataTexto.split('/');
                const data = `${ano}-${mes}-${dia}T03:00`;

                noticias.push({
                    data,
                    descricao,
                    titulo,
                    url,
                    origem: 'B3'
                });
            }

            currentPage++;

            const url = await nextPageAnchor?.evaluate(el => el.href);
            
            if(url === undefined) {
                break;
            }

            await page.goto(url);
        }
        console.log("As paginas acabaram!")

        await browser.close();

        return noticias;
    }
}