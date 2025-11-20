import express from 'express';
import { NoticiasRepo } from './repo/NoticiasRepo.js';
import { NoticiasSQLLiteRepo } from "./repo/NoticiasSQLLiteRepo.js";
import { globalErrorHandler } from './error/errorHandling.js';
import { BancoCentralScrapper } from './web_scrapping/BancoCentralScrapper.js';
import { B3Scrapper } from './web_scrapping/B3Scrapper.js';

const noticiasRepo: NoticiasRepo = new NoticiasSQLLiteRepo();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json({
    type: 'application/json',
}));

app.route('/noticias')
    .get(async (_, res) => {
        const noticias = await noticiasRepo.getNoticiasDaSemana();
        res.json(noticias);
    });

app.route('/teste')
    .get(async (req, res, next) => {
        throw new Error('Eedd d');
    });

app.route('/scrap')
    .post(async (req, res) => {
        const bacenScrapper = new B3Scrapper();

        const noticias = await bacenScrapper.buscarNoticias();

        await noticiasRepo.saveNoticias(noticias);

        res.json(noticias);
    });

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
    if (error) {
        console.error('Erro ao iniciar o servidor:', error);
        return;
    }

    console.log(`Servidor rodando em http://localhost:${PORT}/`);
});