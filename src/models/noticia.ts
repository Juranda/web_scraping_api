export type Noticia = {
    id?: number;
    data: string;
    titulo: string;
    descricao: string;
    url: string;
    origem: OrigemNoticia;
}


export type OrigemNoticia = "Banco Central" | "B3"