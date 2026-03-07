// Banco de dados local
let duplicatas = JSON.parse(localStorage.getItem('duplicatas')) || [];

// Configurações do credor
let configCredor = JSON.parse(localStorage.getItem('configCredor')) || {
    nome: "FRANKELLEY STEFANO ALVES AZEVEDO",
    cnpj: "33.917.740/0001-46",
    ie: "0000001109367",
    contato: "(69) 98494-0207",
    endereco: "AV: MIGUEL VIEIRA FERREIRA, 5454 - Cidade Alta",
    cidade: "ROLIM DE MOURA - RO",
    cep: "76940-000"
};

// Função para converter número em extenso
function numeroPorExtenso(numero) {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezA19 = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    if (numero === 0) return 'zero reais';
    if (numero === 1) return 'um real';

    let extenso = '';
    let inteiro = Math.floor(numero);
    let centavos = Math.round((numero - inteiro) * 100);

    if (inteiro >= 1000) {
        let milhares = Math.floor(inteiro / 1000);
        inteiro = inteiro % 1000;
        
        if (milhares === 1) {
            extenso += 'um mil';
        } else {
            extenso += converterCentena(milhares, centenas, dezenas, unidades, dezA19) + ' mil';
        }
        
        if (inteiro > 0) {
            extenso += ' e ';
        }
    }

    extenso += converterCentena(inteiro, centenas, dezenas, unidades, dezA19);
    extenso += ' reais';

    if (centavos > 0) {
        extenso += ' e ' + converterCentena(centavos, centenas, dezenas, unidades, dezA19) + ' centavos';
    }

    return extenso;
}

function converterCentena(num, centenas, dezenas, unidades, dezA19) {
    if (num === 0) return '';
    if (num === 100) return 'cem';

    let resultado = '';
    let centena = Math.floor(num / 100);
    let resto = num % 100;

    if (centena > 0) {
        resultado += centenas[centena];
        if (resto > 0) {
            resultado += ' e ';
        }
    }

    if (resto >= 20) {
        let dezena = Math.floor(resto / 10);
        let unidade = resto % 10;
        resultado += dezenas[dezena];
        if (unidade > 0) {
            resultado += ' e ' + unidades[unidade];
        }
    } else if (resto >= 10) {
        resultado += dezA19[resto - 10];
    } else if (resto > 0) {
        resultado += unidades[resto];
    }

    return resultado;
}

// Função para converter valor do input para extenso
function converterValorPorExtenso() {
    const valor = parseFloat(document.getElementById('valor').value) || 0;
    const extenso = numeroPorExtenso(valor);
    document.getElementById('valorExtenso').value = extenso.charAt(0).toUpperCase() + extenso.slice(1);
}

// Função para formatar data
function formatarDataExtenso(dataString) {
    if (!dataString) return '';
    
    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const data = new Date(dataString + 'T12:00:00');
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    
    return `${dia} de ${mes} de ${ano}`;
}

// Função para atualizar data de emissão formatada
function atualizarDataFormatada() {
    const dataEmissao = document.getElementById('dataEmissao')?.value;
    if (dataEmissao) {
        document.getElementById('dataEmissaoFormatada').value = formatarDataExtenso(dataEmissao);
    }
}

// Salvar duplicata
document.getElementById('formDuplicata')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const rua = document.getElementById('ruaDevedor').value;
    const numero = document.getElementById('numeroDevedor').value;
    const bairro = document.getElementById('bairroDevedor').value;
    const cidade = document.getElementById('cidade').value;
    const cep = document.getElementById('cep').value;
    const estado = document.getElementById('estado').value;
    
    const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}${cep ? ', CEP: ' + cep : ''}`;
    
    const duplicata = {
        id: Date.now(),
        credor: configCredor,
        dataEmissao: document.getElementById('dataEmissao').value,
        numNF: document.getElementById('numNF').value,
        valor: document.getElementById('valor').value,
        numDuplicata: document.getElementById('numDuplicata').value,
        vencimento: document.getElementById('vencimento').value,
        devedor: {
            nome: document.getElementById('nomeDevedor').value,
            cpf: document.getElementById('cpfDevedor').value,
            estado: estado,
            rua: rua,
            numero: numero,
            bairro: bairro,
            endereco: enderecoCompleto,
            cidade: cidade,
            cep: cep,
            municipio: document.getElementById('municipio').value
        },
        valorExtenso: document.getElementById('valorExtenso').value,
        dataExtenso: document.getElementById('dataEmissaoFormatada').value,
        status: 'pendente'
    };
    
    duplicatas.push(duplicata);
    localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
    
    alert('Duplicata salva com sucesso!');
    window.location.href = 'clientes.html';
});

// Carregar dados na tabela de clientes
function carregarTabelaClientes() {
    const tbody = document.getElementById('tabelaClientes');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (duplicatas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum cliente cadastrado</td></tr>';
        return;
    }
    
    duplicatas.forEach((dup, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${dup.devedor.nome}</td>
            <td>${formatarCPF(dup.devedor.cpf)}</td>
            <td>${formatarDataBR(dup.dataEmissao)}</td>
            <td>R$ ${parseFloat(dup.valor).toFixed(2)}</td>
            <td>${formatarDataBR(dup.vencimento)}</td>
            <td><span class="badge bg-${dup.status === 'pago' ? 'success' : 'danger'}">${dup.status}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="imprimirDuplicata(${dup.id})"><i class="bi bi-printer"></i></button>
                <button class="btn btn-sm btn-success" onclick="marcarPago(${dup.id})"><i class="bi bi-check-circle"></i></button>
                <button class="btn btn-sm btn-danger" onclick="excluirDuplicata(${dup.id})"><i class="bi bi-trash"></i></button>
            </td>
        `;
    });
}

// Função para formatar data no padrão brasileiro
function formatarDataBR(dataString) {
    if (!dataString) return '';
    return dataString.split('-').reverse().join('/');
}

// Função para imprimir duplicata no formato da imagem
function imprimirDuplicata(id) {
    const duplicata = duplicatas.find(d => d.id === id);
    if (!duplicata) return;
    
    const vencimentoFormatado = formatarDataBR(duplicata.vencimento);
    const dataEmissaoFormatada = formatarDataBR(duplicata.dataEmissao);
    
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <html>
        <head>
            <title>Duplicata - ${duplicata.devedor.nome}</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    margin: 20px;
                    background: #fff;
                }
                .container-duplicata {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 2px solid #000;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .header h1 {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0;
                    text-transform: uppercase;
                }
                .header h2 {
                    font-size: 18px;
                    margin: 5px 0;
                    font-weight: normal;
                }
                .info-empresa {
                    border-bottom: 1px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                .tabela-valores {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    border: 1px solid #000;
                }
                .tabela-valores th, .tabela-valores td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                    font-size: 14px;
                }
                .tabela-valores th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .juros-condicoes {
                    border-bottom: 1px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                .sacado {
                    border-bottom: 1px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                .sacado p {
                    margin: 5px 0;
                }
                .valor-extenso {
                    border-bottom: 1px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                .reconhecimento {
                    border-bottom: 1px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 14px;
                    text-align: justify;
                }
                .assinatura {
                    margin-top: 30px;
                    font-size: 14px;
                }
                .linha-assinatura {
                    border-bottom: 1px solid #000;
                    width: 300px;
                    margin-top: 5px;
                }
                .no-print {
                    margin-top: 20px;
                    text-align: center;
                }
                .btn-print {
                    background: #ffc107;
                    border: none;
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 0 5px;
                    border-radius: 5px;
                }
                .btn-close {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 0 5px;
                    border-radius: 5px;
                }
                @media print {
                    .no-print { display: none; }
                    body { margin: 0; padding: 15px; }
                }
            </style>
        </head>
        <body>
            <div class="container-duplicata">
                <div class="header">
                    <h1>FRANK MOTOS</h1>
                    <h2>FRANKELLEY STEFANO ALVES AZEVEDO ME</h2>
                </div>
                
                <div class="info-empresa">
                    <strong>${configCredor.endereco}</strong><br>
                    Telefone: ${configCredor.contato} CNPJ: ${configCredor.cnpj} INS.ESTADUAL: ${configCredor.ie}
                </div>
                
                <table class="tabela-valores">
                    <tr>
                        <th>VALOR</th>
                        <th>NUMERO</th>
                        <th>VALOR</th>
                        <th>NUMERO</th>
                        <th>Vencimento</th>
                        <th>Para Uso Da Instituição Financeira</th>
                    </tr>
                    <tr>
                        <td>R$ ${parseFloat(duplicata.valor).toFixed(2)}</td>
                        <td>${duplicata.numNF || '______'}</td>
                        <td>R$ ${parseFloat(duplicata.valor).toFixed(2)}</td>
                        <td>${duplicata.numDuplicata ? duplicata.numDuplicata : '1/1'}</td>
                        <td>${vencimentoFormatado}</td>
                        <td></td>
                    </tr>
                </table>
                
                <div class="juros-condicoes">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cobrar Juros _____ % Após o Vencimento _____ Até _____</span>
                        <span>Condições Especiais _____</span>
                    </div>
                    <div style="margin-top: 5px;">
                        <strong>CUPOM N°: ${duplicata.numNF || '______'}</strong>
                    </div>
                </div>
                
                <div class="sacado">
                    <p><strong>Nome do sacado:</strong> ${duplicata.devedor.nome ? duplicata.devedor.nome.toUpperCase() : 'NOME DO DEVEDOR'}</p>
                    <p><strong>Endereço:</strong> ${formatarEndereco(duplicata.devedor)}</p>
                    <p><strong>Município:</strong> ${duplicata.devedor.cidade || 'ROLIM DE MOURA'} <span style="margin-left: 50px;"><strong>Praça de Pagamento</strong> ${duplicata.devedor.cidade || 'ROLIM DE MOURA'}</span></p>
                    <p><strong>Estado:</strong> ${duplicata.devedor.estado || 'RO'} <span style="margin-left: 50px;"><strong>Inscrição no CNPJ/CPF:</strong> ${formatarCPF(duplicata.devedor.cpf)}</span></p>
                </div>
                
                <div class="valor-extenso">
                    <strong>Valor por extenso:</strong> ${duplicata.valorExtenso ? duplicata.valorExtenso.toUpperCase() : 'SETENTA REAIS E OITENTA E TRÊS CENTAVOS'}
                    <span style="margin-left: 20px;">*******************************</span>
                </div>
                
                <div class="reconhecimento">
                    Reconhece(emos) a exatidão desta DUPLICATA de venda Mercantil na Importância acima que pagarei(emos) a FRANKELLEY STEFANO ALVES AZEVEDO ME (FRANK MOTOS)<br>
                    Ou, a sua ordem na praça e vencimento indicado
                </div>
                
                <div class="assinatura">
                    <p><strong>Assinatura do Sacado</strong></p>
                    <div class="linha-assinatura"></div>
                </div>
                
                <div class="no-print">
                    <button class="btn-print" onclick="window.print()">Imprimir Duplicata</button>
                    <button class="btn-close" onclick="window.close()">Fechar</button>
                </div>
            </div>
        </body>
        </html>
    `);
    janelaImpressao.document.close();
}

// Função auxiliar para formatar endereço
function formatarEndereco(devedor) {
    if (!devedor) return 'RUA DOS CRISTAMENTOS';
    
    let endereco = '';
    
    if (devedor.rua) {
        endereco += devedor.rua.toUpperCase();
    } else {
        endereco += 'RUA DOS CRISTAMENTOS';
    }
    
    if (devedor.numero) {
        endereco += ', ' + devedor.numero;
    }
    
    if (devedor.bairro) {
        endereco += ' - ' + devedor.bairro.toUpperCase();
    }
    
    return endereco || 'RUA DOS CRISTAMENTOS, 0 - CENTRO';
}

// Função auxiliar para formatar CPF/CNPJ
function formatarCPF(cpf) {
    if (!cpf) return '011.666.042-25';
    
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length === 11) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpf.length === 14) {
        return cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cpf;
}

// Funções auxiliares
function marcarPago(id) {
    duplicatas = duplicatas.map(d => {
        if (d.id === id) d.status = 'pago';
        return d;
    });
    localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
    carregarTabelaClientes();
    atualizarEstatisticas();
    alert('Duplicata marcada como paga!');
}

function excluirDuplicata(id) {
    if (confirm('Tem certeza que deseja excluir esta duplicata?')) {
        duplicatas = duplicatas.filter(d => d.id !== id);
        localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
        carregarTabelaClientes();
        atualizarEstatisticas();
        alert('Duplicata excluída com sucesso!');
    }
}

// Estatísticas para admin
function atualizarEstatisticas() {
    const totalDuplicatas = document.getElementById('totalDuplicatas');
    const totalPagas = document.getElementById('totalPagas');
    const totalPendentes = document.getElementById('totalPendentes');
    const valorTotal = document.getElementById('valorTotal');
    
    if (totalDuplicatas) {
        totalDuplicatas.textContent = duplicatas.length;
        totalPagas.textContent = duplicatas.filter(d => d.status === 'pago').length;
        totalPendentes.textContent = duplicatas.filter(d => d.status === 'pendente').length;
        
        const total = duplicatas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
        valorTotal.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Funções admin
function limparTodosDados() {
    if (confirm('ATENÇÃO! Isso irá apagar TODOS os dados. Tem certeza?')) {
        localStorage.clear();
        duplicatas = [];
        configCredor = {
            nome: "FRANKELLEY STEFANO ALVES AZEVEDO",
            cnpj: "33.917.740/0001-46",
            ie: "0000001109367",
            contato: "(69) 98494-0207",
            endereco: "AV: MIGUEL VIEIRA FERREIRA, 5454 - Cidade Alta",
            cidade: "ROLIM DE MOURA - RO",
            cep: "76940-000"
        };
        carregarTabelaClientes();
        atualizarEstatisticas();
        carregarConfigAdmin();
        alert('Todos os dados foram removidos!');
    }
}

function exportarDados() {
    const dados = {
        duplicatas: duplicatas,
        configCredor: configCredor
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frank_motos_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(readerEvent) {
            try {
                const dados = JSON.parse(readerEvent.target.result);
                duplicatas = dados.duplicatas || [];
                configCredor = dados.configCredor || configCredor;
                
                localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
                localStorage.setItem('configCredor', JSON.stringify(configCredor));
                
                carregarTabelaClientes();
                atualizarEstatisticas();
                carregarConfigAdmin();
                alert('Dados importados com sucesso!');
            } catch (error) {
                alert('Erro ao importar dados. Arquivo inválido.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    carregarTabelaClientes();
    atualizarEstatisticas();
    carregarConfigAdmin();
    
    const dataEmissao = document.getElementById('dataEmissao');
    if (dataEmissao) {
        const hoje = new Date().toISOString().slice(0,10);
        dataEmissao.value = hoje;
        dataEmissao.addEventListener('change', atualizarDataFormatada);
        atualizarDataFormatada();
    }
    
    const btnTopo = document.getElementById('btnTopo');
    if (btnTopo) {
        window.onscroll = function() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                btnTopo.style.display = "block";
            } else {
                btnTopo.style.display = "none";
            }
        };
    }
});

// Função para voltar ao topo
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Salvar configurações do credor
document.getElementById('formConfigCredor')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    configCredor = {
        nome: document.getElementById('configNomeCredor').value,
        cnpj: document.getElementById('configCnpj').value,
        ie: document.getElementById('configIE').value,
        contato: document.getElementById('configContato').value,
        endereco: document.getElementById('configEndereco').value,
        cidade: document.getElementById('configCidade').value,
        cep: document.getElementById('configCep').value
    };
    
    localStorage.setItem('configCredor', JSON.stringify(configCredor));
    alert('Configurações salvas com sucesso!');
});

// Carregar configurações na admin
function carregarConfigAdmin() {
    const nome = document.getElementById('configNomeCredor');
    if (nome) {
        document.getElementById('configNomeCredor').value = configCredor.nome;
        document.getElementById('configCnpj').value = configCredor.cnpj;
        document.getElementById('configIE').value = configCredor.ie;
        document.getElementById('configContato').value = configCredor.contato;
        document.getElementById('configEndereco').value = configCredor.endereco;
        document.getElementById('configCidade').value = configCredor.cidade;
        document.getElementById('configCep').value = configCredor.cep;
    }
}