// index.ts

import * as readline from 'readline';
import { 
    initDB, 
    cadastrarMusicaDB, 
    listarMusicasDB, 
    buscarPorCampoDB, 
    analisarProdutorasDB, 
    fecharDB,
    Musica // Importa a interface Musica do db.ts
} from './db'; // Importa as funções e a interface do arquivo de banco de dados (db.ts)

// Configuração da interface de leitura de linha para interagir com o usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ----------------------------------------------------------------------
// Funções de Menu e Interação do Usuário
// ----------------------------------------------------------------------

/**
 * @function menu
 * @description Exibe o menu principal de opções para o usuário.
 */
function menu(): void {
  console.log('\n\n=== 🎵 Catálogo Musical CLI (PostgreSQL) ==='); // Título atualizado
  console.log('1 - Cadastrar Nova Música');
  console.log('2 - Listar Todas as Músicas');
  console.log('3 - Consultar por Nome da Música');
  console.log('4 - Consultar por Banda/Artista');
  console.log('5 - Consultar por Produtora');
  console.log('6 - ✨ Análise: Músicas por Produtora');
  console.log('7 - Sair');

  rl.question('Escolha uma opção: ', (opcao: string) => {
    switch(opcao.trim()) {
      case '1':
        cadastrarMusica();
        break;
      case '2':
        listarMusicas();
        break;
      case '3':
        consultarPorCampo('nome', 'Nome da Música'); 
        break;
      case '4':
        consultarPorCampo('banda', 'Banda/Artista'); 
        break;
      case '5':
        consultarPorCampo('produtora', 'Produtora');
        break;
      case '6':
        analisarProdutoras();
        break;
      case '7':
        finalizarPrograma();
        break;
      default:
        console.log('⚠️ Opção inválida! Por favor, escolha um número válido.');
        menu();
    }
  });
}

/**
 * @function cadastrarMusica
 * @description Solicita os dados de uma nova música ao usuário e a cadastra no banco de dados.
 */
function cadastrarMusica(): void {
  rl.question('Nome da Música: ', (nome: string) => {
    rl.question('Banda/Artista: ', (banda: string) => {
      rl.question('Produtora: ', async (produtora: string) => {
        try {
            const novaMusica = await cadastrarMusicaDB(nome, banda, produtora);
            console.log(`✅ Música "${novaMusica.nome}" cadastrada com ID: ${novaMusica.id}!`);
        } catch (error: any) {
            // Tratamento de erro para nome de música duplicado, como definido em db.ts
            if (error.message.includes("Música já cadastrada com este nome.")) { 
                console.log('⚠️ Erro: Já existe uma música cadastrada com este nome.');
            } else {
                console.error('❌ Erro ao cadastrar:', error.message);
            }
        }
        menu();
      });
    });
  });
}

/**
 * @function listarMusicas
 * @description Lista todas as músicas cadastradas no banco de dados.
 */
async function listarMusicas(): Promise<void> {
  try {
    const musicas: Musica[] = await listarMusicasDB();
    
    if (musicas.length === 0) {
      console.log('\nNenhum registro no catálogo.');
    } else {
      console.log('\n--- Catálogo Completo (PostgreSQL) ---');
      musicas.forEach((m) => {
        console.log(`ID: ${m.id} | Música: ${m.nome} | Banda: ${m.banda} | Produtora: ${m.produtora}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Erro ao listar músicas:', error.message);
  }
  menu();
}

/**
 * @function consultarPorCampo
 * @description Realiza uma busca de músicas por um campo específico (nome, banda ou produtora).
 * @param {'nome' | 'banda' | 'produtora'} campo - O campo da música para realizar a busca.
 * @param {string} rotulo - O rótulo exibido para o usuário no prompt de busca.
 */
function consultarPorCampo(campo: 'nome' | 'banda' | 'produtora', rotulo: string): void {
  rl.question(`Digite o termo de busca para ${rotulo}: `, async (termo: string) => {
    try {
        const resultados: Musica[] = await buscarPorCampoDB(campo, termo);
        
        if (resultados.length > 0) {
          console.log(`\n--- Resultados da Busca por ${rotulo} ('${termo}') ---`);
          resultados.forEach((m) => {
            console.log(`ID: ${m.id} | Música: ${m.nome} | Banda: ${m.banda} | Produtora: ${m.produtora}`);
          });
        } else {
          console.log(`\nNenhum resultado encontrado para ${rotulo} contendo '${termo}'.`);
        }
    } catch (error: any) {
        console.error('❌ Erro na consulta:', error.message);
    }
    menu();
  });
}

/**
 * @function analisarProdutoras
 * @description Realiza uma análise, contando o número de músicas por produtora.
 */
async function analisarProdutoras(): Promise<void> {
  try {
    const contagemProdutoras = await analisarProdutorasDB();

    if (contagemProdutoras.length === 0) {
      console.log('\nCatálogo vazio. Cadastre músicas para fazer a análise.');
    } else {
      console.log('\n--- 📊 Análise: Músicas por Produtora (SQL GROUP BY) ---');
      // Tipagem explícita para os parâmetros do forEach para evitar o erro TS7006
      contagemProdutoras.forEach((item: { produtora: string; count: number }, i: number) => { 
        const plural = item.count > 1 ? 'músicas' : 'música';
        console.log(`${i + 1}. ${item.produtora}: ${item.count} ${plural}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Erro na análise:', error.message);
  }
  menu();
}

/**
 * @function finalizarPrograma
 * @description Exibe uma mensagem de saída, fecha a interface de leitura e a conexão com o banco de dados.
 */
function finalizarPrograma(): void {
  console.log('\nEncerrando o Catálogo Musical. Obrigado!');
  fecharDB(); // Fecha a conexão com o banco de dados
  rl.close();
}

// ----------------------------------------------------------------------
// Ponto de Entrada do Aplicativo
// ----------------------------------------------------------------------

/**
 * @async
 * @description Função auto-executável que inicia o programa. 
 * Ela se conecta ao banco de dados e exibe o menu principal.
 */
(async () => {
  try {
      await initDB(); // Tenta inicializar a conexão e criar a tabela se necessário
      menu(); // Exibe o menu após a inicialização bem-sucedida do DB
  } catch (error) {
      console.error('\nERRO FATAL NA CONEXÃO OU INICIALIZAÇÃO DO DB:', error);
      console.log('\nVerifique se o container PostgreSQL Docker está rodando corretamente (docker ps).');
      fecharDB(); // Tenta fechar a conexão se houve erro na inicialização
      rl.close(); // Fecha a interface de leitura para sair do programa
  }
})();