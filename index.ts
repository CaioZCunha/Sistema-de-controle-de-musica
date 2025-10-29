import * as readline from 'readline'; // Para leitura de entrada do usuário
import * as path from 'path'; // Para gerenciar caminhos de arquivo
import { promises as fs } from 'fs'; // Para operações de arquivo assíncronas

/**
 * @interface Musica
 * @description Define a estrutura de dados para um item musical.
 * @property {string} nome - O título da música.
 * @property {string} banda - O nome do artista ou banda.
 * @property {string} produtora - O nome da produtora ou gravadora.
 */
interface Musica {
  nome: string;
  banda: string;
  produtora: string;
}

// ----------------------------------------------------------------------
// Variáveis Globais e Configuração
// ----------------------------------------------------------------------

const NOME_ARQUIVO_CSV = 'catalogo.csv';
// Define o caminho completo para o arquivo CSV
const arquivoCSV = path.join(__dirname, NOME_ARQUIVO_CSV); 
// Array que armazena os dados na memória
let musicas: Musica[] = []; 

// Configuração da interface de leitura de linha
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ----------------------------------------------------------------------
// Funções de Persistência (Leitura/Escrita CSV)
// ----------------------------------------------------------------------

/**
 * @async
 * @function salvarCSV
 * @description Converte o array `musicas` para o formato CSV e o salva no disco.
 */
async function salvarCSV(): Promise<void> {
  const header = 'nome,banda,produtora\n';
  const linhas = musicas.map(m =>
    // Junta os valores separados por vírgula para formar a linha CSV
    [m.nome, m.banda, m.produtora].join(',')
  ).join('\n'); // Junta as linhas com quebras de linha

  await fs.writeFile(arquivoCSV, header + linhas, 'utf8');
}

/**
 * @async
 * @function carregarCSV
 * @description Tenta ler o arquivo CSV existente e popular o array `musicas`.
 */
async function carregarCSV(): Promise<void> {
  try {
    const dados = await fs.readFile(arquivoCSV, 'utf8');
    const linhas = dados.trim().split('\n');
    
    // Ignora o cabeçalho (primeira linha) e mapeia o restante para objetos Musica
    musicas = linhas.slice(1).map(linha => {
      const [nome, banda, produtora] = linha.split(',');
      return { nome, banda, produtora };
    }).filter(m => m.nome && m.banda && m.produtora); // Filtra linhas incompletas
    
    console.log(`\n✅ ${musicas.length} músicas carregadas de ${NOME_ARQUIVO_CSV}.`);
  } catch (err: any) {
    // Se o arquivo não existir (ENOENT), inicia com array vazio
    if (err.code === 'ENOENT') {
        musicas = [];
        console.log('\nNenhum arquivo de catálogo encontrado. Iniciando um novo catálogo.');
    } else {
        // Loga outros erros de leitura de arquivo
        console.error(`Erro ao carregar o CSV: ${err.message}`);
    }
  }
}

// ----------------------------------------------------------------------
// Funções de Menu e Interação do Usuário
// ----------------------------------------------------------------------

/**
 * @function menu
 * @description Exibe o menu principal e solicita uma opção ao usuário.
 */
function menu(): void {
  console.log('\n\n=== 🎵 Catálogo Musical CLI (CSV) ===');
  console.log('1 - Cadastrar Nova Música');
  console.log('2 - Listar Todas as Músicas');
  console.log('3 - Consultar por Nome da Música');
  console.log('4 - Consultar por Banda/Artista');
  console.log('5 - Consultar por Produtora');
  console.log('6 - ✨ Análise: Músicas por Produtora'); // NOVA OPÇÃO
  console.log('7 - Sair'); // Opção Sair mudou para 7

  rl.question('Escolha uma opção: ', (opcao) => {
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
      case '6': // NOVO CASE
        analisarProdutoras();
        break;
      case '7': // CASE ATUALIZADO
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
 * @description Solicita os dados da nova música e a adiciona ao catálogo.
 */
function cadastrarMusica(): void {
  rl.question('Nome da Música: ', (nome) => {
    // Verifica se já existe uma música com o mesmo nome (case-insensitive)
    if (musicas.some(m => m.nome.toLowerCase() === nome.toLowerCase())) {
      console.log('⚠️ Música já cadastrada com esse nome. Tente um nome diferente.');
      return menu();
    }
    
    rl.question('Banda/Artista: ', (banda) => {
      rl.question('Produtora: ', async (produtora) => {
        // Cria o novo objeto e o adiciona ao array
        musicas.push({ nome, banda, produtora });
        
        // Salva imediatamente no CSV
        await salvarCSV(); 
        
        console.log(`✅ Música "${nome}" cadastrada e salva!`);
        menu();
      });
    });
  });
}

/**
 * @function listarMusicas
 * @description Exibe a lista completa de músicas.
 */
function listarMusicas(): void {
  if (musicas.length === 0) {
    console.log('\nNenhum registro no catálogo. Cadastre uma música primeiro (Opção 1).');
  } else {
    console.log('\n--- Catálogo Completo ---');
    musicas.forEach((m, i) => {
      console.log(`${i + 1}. Música: ${m.nome} | Banda: ${m.banda} | Produtora: ${m.produtora}`);
    });
  }
  menu();
}

/**
 * @function consultarPorCampo
 * @description Função genérica para buscar músicas por qualquer um dos campos (nome, banda, produtora).
 * @param {'nome' | 'banda' | 'produtora'} campo - A propriedade da interface Musica a ser consultada.
 * @param {string} rotulo - O rótulo a ser exibido no prompt para o usuário.
 */
function consultarPorCampo(campo: 'nome' | 'banda' | 'produtora', rotulo: string): void {
  rl.question(`Digite o termo de busca para ${rotulo}: `, (termo) => {
    
    // Filtra as músicas cujo campo contenha o termo (busca parcial e case-insensitive)
    const resultados = musicas.filter(m => 
      m[campo].toLowerCase().includes(termo.toLowerCase())
    );

    if (resultados.length > 0) {
      console.log(`\n--- Resultados da Busca por ${rotulo} ('${termo}') ---`);
      resultados.forEach((m, i) => {
        console.log(`${i + 1}. Música: ${m.nome} | Banda: ${m.banda} | Produtora: ${m.produtora}`);
      });
    } else {
      console.log(`\nNenhum resultado encontrado para ${rotulo} contendo '${termo}'.`);
    }

    menu();
  });
}

/**
 * @function analisarProdutoras
 * @description Conta e exibe o número de músicas cadastradas por cada produtora.
 */
function analisarProdutoras(): void {
  if (musicas.length === 0) {
    console.log('\nCatálogo vazio. Cadastre músicas para fazer a análise.');
    return menu();
  }

  // Objeto para armazenar a contagem: { [nomeDaProdutora]: contagem }
  const contagemProdutoras = musicas.reduce((acc, musica) => {
    const produtora = musica.produtora.trim(); // Garante que não há espaços
    acc[produtora] = (acc[produtora] || 0) + 1;
    return acc;
  }, {} as Record<string, number>); // O Record<string, number> ajuda o TypeScript a entender o formato

  console.log('\n--- 📊 Análise: Músicas por Produtora ---');
  
  // Converte o objeto de contagem em um array para facilitar a exibição
  const produtorasOrdenadas = Object.entries(contagemProdutoras).sort(([, a], [, b]) => b - a);

  produtorasOrdenadas.forEach(([produtora, contagem], i) => {
    const plural = contagem > 1 ? 'músicas' : 'música';
    console.log(`${i + 1}. ${produtora}: ${contagem} ${plural}`);
  });

  menu();
}

/**
 * @function finalizarPrograma
 * @description Mensagem de saída e fecha a interface de entrada.
 */
function finalizarPrograma(): void {
  console.log('Encerrando o Catálogo Musical. Obrigado!');
  rl.close();
}

// ----------------------------------------------------------------------
// Ponto de Entrada do Aplicativo (IIFE)
// ----------------------------------------------------------------------

/**
 * @async
 * @description Função auto-executável para iniciar o programa.
 */
(async () => {
  await carregarCSV();
  menu();
})();