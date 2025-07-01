import { Noticia } from "../models/noticia.js";
import { createPageBrowser, sleep } from "./page_utils.js";

type Ano = 2025 | 2024 | 2023 | 2022 | 2021 | 2020 | 2019 | 2018 | 2017 | 2016;

export async function lerNoticiasDoAno(ano: Ano): Promise<Noticia[]> {
    const { browser, page } = await createPageBrowser();
    
    const baseUrl = 'https://www.bcb.gov.br';
    const response = await page.goto(baseUrl + '/noticiasporano?ano=' + ano);

    if (response === null) {
        console.warn('Erro ao acessar o site. Verifique a URL ou a conexão com a internet.');
        return [];
    }

    if (response.ok() === false) {
        console.warn('Erro ao entrar no site: ' + await response.text());
        return [];
    }

    await sleep(10000);

    const noticias: Noticia[] = [];
    const cardElements = await page.$$('.card');

    if (cardElements.length === 0) {
        console.warn('Nenhum card encontrado. Verifique se a página foi carregada corretamente.');
        return [];
    }

    for (let i = 0; i < cardElements.length; i++) {
        const cardElement = cardElements[i];
        const mesCardHeaderElement = await cardElement.$('.card-header h2 button span');

        if( mesCardHeaderElement === null) {
            console.warn('Nenhum elemento de cabeçalho encontrado no card do mês: ' + i);
            continue;
        }

        const mes = await page.evaluate(el => el.textContent?.split(' ')[0].toUpperCase(), mesCardHeaderElement);
        const noticiaElements = await cardElement.$$('.d-md-flex.item-custom');
        console.log(`Processando mês: ${mes}`);

        if (noticiaElements.length === 0) {
            console.warn('Nenhum elemento de notícia encontrado no card do mês: ' + mes);
            continue;
        }

        for (let j = 0; j < noticiaElements.length; j++) {
            const noticiaElement = noticiaElements[j];
            const dataElement = await noticiaElement.$('h3');
            const tituloElement = await noticiaElement.$('div dynamic-comp');
            const descricaoElement = await noticiaElement.$('.titulo p');
            const urlElement = await noticiaElement.$('div a');

            if (dataElement === null || tituloElement === null || urlElement === null) {
                console.warn(`Algum elemento de notícia está faltando no card do mês: ${mes} data ${dataElement ?? 'N/A' + ' ' + `numero: ${j}`}`);
                continue;
            }

            const data = await page.evaluate(el => el.textContent?.trim(), dataElement);
            const titulo = await page.evaluate(el => el.textContent?.trim(), tituloElement);
            const descricao = descricaoElement === null ? "" : await page.evaluate(el => el.textContent?.replaceAll('\n', '').trim(), descricaoElement);
            const url = await page.evaluate(el => el.getAttribute('href'), urlElement);

            console.log(`Notícia ${j + 1} do mês ${mes}:`, {
                data: `"${data} de ${mes} de ${ano}"`,
                titulo,
                descricao,
                url
            });

            noticias.push({
                'data': `${ano}-${mesParaNumero(mes)}-${data.substring(data.length - 2).trim()}`,
                'titulo': titulo ?? "",
                'descricao': descricao ?? "",
                'url': url === null ? "" : baseUrl + url,
            });
        }
    }

    await browser.close();

    return noticias;
}

function mesParaNumero(mes: string): number {
    const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    return meses.indexOf(mes.toUpperCase()) + 1;
}

export async function lerNoticiasDosAnos(anos?: Ano[]): Promise<Noticia[]> {
    if(anos === undefined || anos.length === 0) {
        anos = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];
    }

    const noticias: Noticia[] = [];

    for (const ano of anos) {
        for(const noticia of await lerNoticiasDoAno(ano)) {
            noticias.push(noticia);
        }
    }

    return noticias;
}
