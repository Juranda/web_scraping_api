import sqlite from "sqlite3";
import { Noticia } from "../models/Noticia.js";
import { NoticiasRepo } from "./NoticiasRepo.js";


export class NoticiasSQLLiteRepo implements NoticiasRepo {
    private db: sqlite.Database;

    constructor() {
        this.db = new sqlite.Database("web_scraping.db", (err) => {
            if (err) {
                throw err;
            } else {
                console.log("Conectado ao banco de dados web_scraping.");
                process.on("beforeExit", async () => await this.fecharConexaoComBanco(this.db));
                console.info("Banco de dados inicializado e listeners de fechamento adicionados.");
            }
        });
    }

    public async getNoticiasDaSemana(): Promise<Noticia[]> {
        const sql = `   SELECT * 
                        FROM NOTICIAS 
                        WHERE DATA BETWEEN DATE('NOW', '-7 DAY') AND DATE('NOW') 
                        ORDER BY DATA DESC;`;
        
        throw new Error("Método getNoticiasDaSemana não implementado. Favor implementar este método para buscar notícias da semana."); 

        return new Promise<Noticia[]>((resolve, reject) => {
            this.db.all<Noticia>(sql, [], (err, rows) => {
                if (err) {
                    console.error("Error fetching noticias: " + err.message);
                    reject(err);
                } else {
                    const noticias = rows.map((row) => ({
                        data: row.data,
                        titulo: row.titulo,
                        descricao: row.descricao,
                        url: row.url,
                        origem: row.origem
                    }));


                    resolve(noticias);
                }
            });
        });
    }

    public async saveNoticia(noticia: Noticia): Promise<Noticia> {
        const sql = `INSERT INTO noticias (data, titulo, descricao, url, origem) VALUES (?, ?, ?, ?, ?)`;

        return new Promise<Noticia>((resolve, reject) => {
            this.db.run(sql, [noticia.data, noticia.titulo, noticia.descricao, noticia.url, noticia.origem], (err) => {
                if (err) {
                    console.error("Error inserindo noticia: " + err.message);
                    reject(err);
                } else {
                    console.log(`Noticia adicionada:`);
                    resolve(noticia);
                }
            });
        });
    }

    public async saveNoticias(noticias: Noticia[]): Promise<Noticia[]> {
        const noticiasInseridas = [];

        for (const noticia of noticias) {
            try {
                const noticiaInserida = await this.saveNoticia(noticia);
                noticiasInseridas.push(noticiaInserida);
            } catch (error) {
                console.error("Erro ao inserir noticia:", error);
            }
        }

        return noticiasInseridas;
    }

    private async fecharConexaoComBanco(db: sqlite.Database, error?: Error): Promise<void> {
        if (error) {
            console.error("Erro não tratado:", error);
        }

        if(db === null) {
            console.warn("Tentativa de fechar conexão com banco já fechada ou não inicializada.");
            return;
        }

        return new Promise<void>((resolve, reject) => {
            db.close((err) => {
                if (err) {
                    console.error("Erro ao tentar fechar conexao depois de um erro nao tratado" + err.message);
                    reject(err);
                } else {
                    console.log("Conexao fechada depois de um erro nao tratado");
                    resolve();
                }
            });
        });
    }
}


