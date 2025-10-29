"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline"); // Para leitura de entrada do usuário
var path = require("path"); // Para gerenciar caminhos de arquivo
var fs_1 = require("fs"); // Para operações de arquivo assíncronas
// ----------------------------------------------------------------------
// Variáveis Globais e Configuração
// ----------------------------------------------------------------------
var NOME_ARQUIVO_CSV = 'catalogo.csv';
// Define o caminho completo para o arquivo CSV
var arquivoCSV = path.join(__dirname, NOME_ARQUIVO_CSV);
// Array que armazena os dados na memória
var musicas = [];
// Configuração da interface de leitura de linha
var rl = readline.createInterface({
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
function salvarCSV() {
    return __awaiter(this, void 0, void 0, function () {
        var header, linhas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    header = 'nome,banda,produtora\n';
                    linhas = musicas.map(function (m) {
                        // Junta os valores separados por vírgula para formar a linha CSV
                        return [m.nome, m.banda, m.produtora].join(',');
                    }).join('\n');
                    return [4 /*yield*/, fs_1.promises.writeFile(arquivoCSV, header + linhas, 'utf8')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * @async
 * @function carregarCSV
 * @description Tenta ler o arquivo CSV existente e popular o array `musicas`.
 */
function carregarCSV() {
    return __awaiter(this, void 0, void 0, function () {
        var dados, linhas, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs_1.promises.readFile(arquivoCSV, 'utf8')];
                case 1:
                    dados = _a.sent();
                    linhas = dados.trim().split('\n');
                    // Ignora o cabeçalho (primeira linha) e mapeia o restante para objetos Musica
                    musicas = linhas.slice(1).map(function (linha) {
                        var _a = linha.split(','), nome = _a[0], banda = _a[1], produtora = _a[2];
                        return { nome: nome, banda: banda, produtora: produtora };
                    }).filter(function (m) { return m.nome && m.banda && m.produtora; }); // Filtra linhas incompletas
                    console.log("\n\u2705 ".concat(musicas.length, " m\u00FAsicas carregadas de ").concat(NOME_ARQUIVO_CSV, "."));
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    // Se o arquivo não existir (ENOENT), inicia com array vazio
                    if (err_1.code === 'ENOENT') {
                        musicas = [];
                        console.log('\nNenhum arquivo de catálogo encontrado. Iniciando um novo catálogo.');
                    }
                    else {
                        // Loga outros erros de leitura de arquivo
                        console.error("Erro ao carregar o CSV: ".concat(err_1.message));
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ----------------------------------------------------------------------
// Funções de Menu e Interação do Usuário
// ----------------------------------------------------------------------
/**
 * @function menu
 * @description Exibe o menu principal e solicita uma opção ao usuário.
 */
function menu() {
    console.log('\n\n=== 🎵 Catálogo Musical CLI (CSV) ===');
    console.log('1 - Cadastrar Nova Música');
    console.log('2 - Listar Todas as Músicas');
    console.log('3 - Consultar por Nome da Música');
    console.log('4 - Consultar por Banda/Artista');
    console.log('5 - Consultar por Produtora');
    console.log('6 -  Análise: Músicas por Produtora'); // NOVA OPÇÃO
    console.log('7 - Sair'); // Opção Sair mudou para 7
    rl.question('Escolha uma opção: ', function (opcao) {
        switch (opcao.trim()) {
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
                console.log(' Opção inválida! Por favor, escolha um número válido.');
                menu();
        }
    });
}
/**
 * @function cadastrarMusica
 * @description Solicita os dados da nova música e a adiciona ao catálogo.
 */
function cadastrarMusica() {
    var _this = this;
    rl.question('Nome da Música: ', function (nome) {
        // Verifica se já existe uma música com o mesmo nome (case-insensitive)
        if (musicas.some(function (m) { return m.nome.toLowerCase() === nome.toLowerCase(); })) {
            console.log(' Música já cadastrada com esse nome. Tente um nome diferente.');
            return menu();
        }
        rl.question('Banda/Artista: ', function (banda) {
            rl.question('Produtora: ', function (produtora) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Cria o novo objeto e o adiciona ao array
                            musicas.push({ nome: nome, banda: banda, produtora: produtora });
                            // Salva imediatamente no CSV
                            return [4 /*yield*/, salvarCSV()];
                        case 1:
                            // Salva imediatamente no CSV
                            _a.sent();
                            console.log("\u2705 M\u00FAsica \"".concat(nome, "\" cadastrada e salva!"));
                            menu();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
}
/**
 * @function listarMusicas
 * @description Exibe a lista completa de músicas.
 */
function listarMusicas() {
    if (musicas.length === 0) {
        console.log('\nNenhum registro no catálogo. Cadastre uma música primeiro (Opção 1).');
    }
    else {
        console.log('\n--- Catálogo Completo ---');
        musicas.forEach(function (m, i) {
            console.log("".concat(i + 1, ". M\u00FAsica: ").concat(m.nome, " | Banda: ").concat(m.banda, " | Produtora: ").concat(m.produtora));
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
function consultarPorCampo(campo, rotulo) {
    rl.question("Digite o termo de busca para ".concat(rotulo, ": "), function (termo) {
        // Filtra as músicas cujo campo contenha o termo (busca parcial e case-insensitive)
        var resultados = musicas.filter(function (m) {
            return m[campo].toLowerCase().includes(termo.toLowerCase());
        });
        if (resultados.length > 0) {
            console.log("\n--- Resultados da Busca por ".concat(rotulo, " ('").concat(termo, "') ---"));
            resultados.forEach(function (m, i) {
                console.log("".concat(i + 1, ". M\u00FAsica: ").concat(m.nome, " | Banda: ").concat(m.banda, " | Produtora: ").concat(m.produtora));
            });
        }
        else {
            console.log("\nNenhum resultado encontrado para ".concat(rotulo, " contendo '").concat(termo, "'."));
        }
        menu();
    });
}
/**
 * @function analisarProdutoras
 * @description Conta e exibe o número de músicas cadastradas por cada produtora.
 */
function analisarProdutoras() {
    if (musicas.length === 0) {
        console.log('\nCatálogo vazio. Cadastre músicas para fazer a análise.');
        return menu();
    }
    // Objeto para armazenar a contagem: { [nomeDaProdutora]: contagem }
    var contagemProdutoras = musicas.reduce(function (acc, musica) {
        var produtora = musica.produtora.trim(); // Garante que não há espaços
        acc[produtora] = (acc[produtora] || 0) + 1;
        return acc;
    }, {}); // O Record<string, number> ajuda o TypeScript a entender o formato
    console.log('\n---  Análise: Músicas por Produtora ---');
    // Converte o objeto de contagem em um array para facilitar a exibição
    var produtorasOrdenadas = Object.entries(contagemProdutoras).sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
    });
    produtorasOrdenadas.forEach(function (_a, i) {
        var produtora = _a[0], contagem = _a[1];
        var plural = contagem > 1 ? 'músicas' : 'música';
        console.log("".concat(i + 1, ". ").concat(produtora, ": ").concat(contagem, " ").concat(plural));
    });
    menu();
}
/**
 * @function finalizarPrograma
 * @description Mensagem de saída e fecha a interface de entrada.
 */
function finalizarPrograma() {
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
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, carregarCSV()];
            case 1:
                _a.sent();
                menu();
                return [2 /*return*/];
        }
    });
}); })();
