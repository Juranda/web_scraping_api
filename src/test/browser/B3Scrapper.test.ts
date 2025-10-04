import assert from "node:assert";
import { describe, it } from "node:test";
import { B3Scrapper } from "../../web_scrapping/B3Scrapper.js";

describe("B3Scrapper deve funcionar", () => {
    it("Abrir navegador", async () => {
        const scrapper = new B3Scrapper();

        const noticias = await scrapper.buscarNoticias();

        assert.ok(noticias.length > 0);


        for(const noticia of noticias) {
            console.log(noticia);
        }
    });
});