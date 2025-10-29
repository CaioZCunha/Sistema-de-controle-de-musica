// db.ts

import knex, { Knex } from 'knex'; // Necessário para a inicialização e tipagem
import knexConfig from './knexfile';

// Inicializa a conexão Knex com base na configuração
const db: Knex = knex(knexConfig); // <-- Variável 'db' estava faltando

/**
 * @interface Musica
 * @description Estrutura de dados para um item musical no PostgreSQL.
 */
export interface Musica {
    id: number;
    nome: string;
    banda: string;
    produtora: string;
}

const TABELA_MUSICAS = 'Musicas'; // <-- Constante 'TABELA_MUSICAS' estava faltando

/**
 * @async
 * @function initDB
 * @description Inicializa o banco de dados e garante que a tabela exista.
 */
export async function initDB(): Promise<void> {
    
    // O Docker Compose já garante que o banco 'catalogomusicas' exista.
    
    // 1. Garante que a tabela 'Musicas' exista
    const tableExists = await db.schema.hasTable(TABELA_MUSICAS);

    if (!tableExists) {
        await db.schema.createTable(TABELA_MUSICAS, (table: Knex.CreateTableBuilder) => { // Tipagem Knex.CreateTableBuilder adicionada novamente
            table.increments('id').primary(); 
            table.string('nome', 255).notNullable().unique(); 
            table.string('banda', 255).notNullable();
            table.string('produtora', 255).notNullable();
        });
        console.log(`\n Tabela '${TABELA_MUSICAS}' criada no PostgreSQL.`);
    } else {
        console.log(`\n Conectado ao PostgreSQL. Tabela '${TABELA_MUSICAS}' encontrada.`);
    }
}

/**
 * @async
 * @function cadastrarMusicaDB
 * @description Insere uma nova música.
 */
export async function cadastrarMusicaDB(nome: string, banda: string, produtora: string): Promise<Musica> {
    try {
        // Knex para Postgres retorna [id]
        const [id] = await db(TABELA_MUSICAS).insert({ nome, banda, produtora }, ['id']); 
        
        // Em alguns ambientes Knex/Postgres o retorno é um objeto com id, então verificamos:
        const finalId = typeof id === 'object' && id !== null && 'id' in id ? id.id : id;
        
        return { id: finalId as number, nome, banda, produtora };
    } catch (e: any) {
        // Erro de unicidade do Postgres
        if (e.code === '23505') { 
             throw new Error("Música já cadastrada com este nome.");
        }
        throw e;
    }
}

/**
 * @async
 * @function listarMusicasDB
 */
export async function listarMusicasDB(): Promise<Musica[]> {
    return db(TABELA_MUSICAS).select('*').orderBy('nome');
}

/**
 * @async
 * @function buscarPorCampoDB
 */
export async function buscarPorCampoDB(campo: 'nome' | 'banda' | 'produtora', termo: string): Promise<Musica[]> {
    return db(TABELA_MUSICAS)
        .where(campo, 'ilike', `%${termo}%`) // 'ilike' é case-insensitive no Postgres
        .select('*');
}

/**
 * @async
 * @function analisarProdutorasDB
 */
export async function analisarProdutorasDB(): Promise<{ produtora: string; count: number }[]> {
    return db(TABELA_MUSICAS)
        .select('produtora')
        .count({ count: '*' }) 
        .groupBy('produtora')
        .orderBy('count', 'desc') as unknown as Promise<{ produtora: string; count: number }[]>;
}

/**
 * @function fecharDB
 * @description Fecha a conexão Knex.
 */
export function fecharDB(): void {
    db.destroy();
    console.log(' Conexão com o PostgreSQL fechada.');
}