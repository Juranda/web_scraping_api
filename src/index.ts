import express from 'express';
import { NoticiasRepo } from './repo/NoticiasRepo.js';
import { NoticiasSQLLiteRepo } from "./repo/NoticiasSQLLiteRepo.js";
import { asyncErrorHandler, globalErrorHandler } from './error/errorHandling.js';

const noticiasRepo: NoticiasRepo = new NoticiasSQLLiteRepo();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json({
    type: 'application/json',
}));

app.route('/noticias')
    .get(asyncErrorHandler(async (_, res) => {
        const noticias = await noticiasRepo.getNoticiasDaSemana();
        res.json(noticias);
    }));

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
    if (error) {
        console.error('Erro ao iniciar o servidor:', error);
        return;
    }

    console.log(`Servidor rodando na porta ${PORT}`);
});