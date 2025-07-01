import { lerNoticiasDoAno } from './web_scrapping/banco_central.js';
import { writeFile } from 'node:fs/promises';

const noticias = await lerNoticiasDoAno(2018);

writeFile('./data/noticias.json', JSON.stringify(noticias, null, "   "))
.then(() => {
    console.log('Arquivo escrito com sucesso!');
})
.catch((error) => {
    console.error('Erro ao escrever o arquivo:', error);
});