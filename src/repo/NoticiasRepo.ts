import { Noticia } from "../models/Noticia.js";

export interface NoticiasRepo {
    getNoticiasDaSemana(): Promise<Noticia[]>;
    saveNoticia(noticia: Noticia): Promise<Noticia>;
    saveNoticias(noticias: Noticia[]): Promise<Noticia[]>;
}

