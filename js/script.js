// Banco de dados local
let duplicatas = JSON.parse(localStorage.getItem('duplicatas')) || [];

// Configurações do credor
let configCredor = JSON.parse(localStorage.getItem('configCredor')) || {
    nome: "FRANKELLEY STEFANO ALVES AZEVEDO",
    fantasia: "FRANK MOTOS",
    cnpj: "33.917.740/0001-46",
    ie: "0000001109367",
    ccm: "11.222-3",
    contato: "(69) 98494-0207",
    endereco: "AV: MIGUEL VIEIRA FERREIRA, 5454",
    bairro: "Cidade Alta",
    cidade: "ROLIM DE MOURA",
    uf: "RO",
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
    
    const enderecoCompleto = `${rua}, Nº ${numero} - ${bairro}`;
    
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
            municipio: document.getElementById('municipio').value || cidade
        },
        valorExtenso: document.getElementById('valorExtenso').value,
        dataExtenso: document.getElementById('dataEmissaoFormatada').value,
        status: 'pendente',
        repm: '100'
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
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum cliente cadastrado</td></tr>';
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
                <button class="btn btn-sm btn-warning" onclick="imprimirDuplicata(${dup.id})" title="Imprimir Duplicata"><i class="bi bi-printer"></i></button>
                <button class="btn btn-sm btn-info" onclick="imprimirContrato(${dup.id})" title="Imprimir Contrato"><i class="bi bi-file-text"></i></button>
                <button class="btn btn-sm btn-success" onclick="marcarPago(${dup.id})" title="Marcar como Pago"><i class="bi bi-check-circle"></i></button>
                <button class="btn btn-sm btn-danger" onclick="excluirDuplicata(${dup.id})" title="Excluir"><i class="bi bi-trash"></i></button>
            </td>
        `;
    });
}

// Função para formatar data no padrão brasileiro
function formatarDataBR(dataString) {
    if (!dataString) return '';
    return dataString.split('-').reverse().join('/');
}

// Função para imprimir duplicata no formato A4
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
                /* ESTILO PARA FOLHA A4 */
                @page {
                    size: A4;
                    margin: 1.5cm;
                }
                body { 
                    font-family: 'Courier New', monospace; 
                    margin: 0;
                    padding: 0;
                    background: #fff;
                    width: 210mm;
                    min-height: 297mm;
                }
                .container-duplicata {
                    width: 100%;
                    max-width: 180mm;
                    margin: 0 auto;
                    padding: 10mm 0;
                }
                .titulo-principal {
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10mm;
                    text-transform: uppercase;
                }
                .info-credor {
                    border: 1px solid #000;
                    padding: 3mm;
                    margin-bottom: 5mm;
                    font-size: 12pt;
                }
                .linha-credor {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1mm;
                }
                .tabela-valores {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 5mm;
                    border: 1px solid #000;
                    font-size: 12pt;
                }
                .tabela-valores th, .tabela-valores td {
                    border: 1px solid #000;
                    padding: 2mm;
                    text-align: center;
                }
                .tabela-valores th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .desconto-condicoes {
                    border: 1px solid #000;
                    padding: 2mm;
                    margin-bottom: 5mm;
                    font-weight: bold;
                    font-size: 12pt;
                }
                .sacado {
                    border: 1px solid #000;
                    padding: 3mm;
                    margin-bottom: 3mm;
                    font-size: 12pt;
                }
                .linha-sacado {
                    display: flex;
                    margin-bottom: 1mm;
                }
                .label {
                    font-weight: bold;
                    width: 40mm;
                }
                .repm {
                    border: 1px solid #000;
                    padding: 1mm 3mm;
                    margin-bottom: 5mm;
                    font-weight: bold;
                    font-size: 12pt;
                }
                .multa-info {
                    border: 1px solid #000;
                    padding: 2mm;
                    margin-bottom: 5mm;
                    background-color: #fff3cd;
                    font-size: 12pt;
                    text-align: center;
                    font-weight: bold;
                }
                .rodape {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    margin-top: 10mm;
                    font-size: 12pt;
                }
                .assinatura-container {
                    margin-top: 15mm;
                    text-align: left;
                }
                .assinatura-label {
                    font-weight: bold;
                    margin-right: 5mm;
                }
                .linha-assinatura {
                    border-bottom: 1px solid #000;
                    width: 100%;
                    margin-top: 2mm;
                }
                .no-print {
                    margin-top: 10mm;
                    text-align: center;
                }
                .btn-print {
                    background: #ffc107;
                    border: none;
                    padding: 3mm 6mm;
                    font-size: 14pt;
                    cursor: pointer;
                    margin: 0 2mm;
                    border-radius: 2mm;
                }
                .btn-close {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 3mm 6mm;
                    font-size: 14pt;
                    cursor: pointer;
                    margin: 0 2mm;
                    border-radius: 2mm;
                }
                .desenvolvido {
                    margin-top: 10mm;
                    text-align: center;
                    font-size: 10pt;
                    color: #666;
                    border-top: 1px dashed #999;
                    padding-top: 2mm;
                }
                @media print {
                    .no-print { display: none; }
                    .desenvolvido { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container-duplicata">
                <div class="titulo-principal">Duplicata</div>
                
                <div class="info-credor">
                    <div class="linha-credor">
                        <span><strong>${configCredor.nome} ${configCredor.fantasia ? '- ' + configCredor.fantasia : ''}</strong></span>
                    </div>
                    <div class="linha-credor">
                        <span>${configCredor.endereco} - ${configCredor.bairro}</span>
                        <span>${configCredor.cidade} - ${configCredor.uf}</span>
                    </div>
                    <div class="linha-credor">
                        <span>C.N.P.J (MF) Nº ${configCredor.cnpj}</span>
                        <span>C.C.M Nº ${configCredor.ccm}</span>
                    </div>
                    <div class="linha-credor">
                        <span>Mun. ${configCredor.cidade} - ${configCredor.uf}</span>
                        <span>DATA DA EMISSÃO: ${dataEmissaoFormatada}</span>
                    </div>
                </div>
                
                <table class="tabela-valores">
                    <tr>
                        <th>NF FATURA N°</th>
                        <th>NF FAT/F/Duplicação - Valor</th>
                        <th>Duplicação de Ordem</th>
                        <th>Vencimento</th>
                        <th>PARA USO DA INSTITUIÇÃO FINANCEIRA</th>
                    </tr>
                    <tr>
                        <td>${duplicata.numNF || '______'}</td>
                        <td>R$ ${parseFloat(duplicata.valor).toFixed(2)}</td>
                        <td>${duplicata.numDuplicata || '038758-P'}</td>
                        <td>${vencimentoFormatado}</td>
                        <td></td>
                    </tr>
                </table>
                
                <div class="desconto-condicoes">
                    DESCONTO DE CONDIÇÕES ESPECIAIS<br>
                    % SOBRE ATÉ
                </div>
                
                <!-- INFORMAÇÕES DE MULTA E MORA -->
                <div class="multa-info">
                    ⚠️ APÓS O VENCIMENTO: MULTA DE 2% + MORA DIÁRIA DE R$ 2,14 ⚠️
                </div>
                
                <div class="sacado">
                    <div class="linha-sacado">
                        <span class="label">NOME DO SACADO:</span>
                        <span>${duplicata.devedor.nome.toUpperCase()}</span>
                    </div>
                    <div class="linha-sacado">
                        <span class="label">ENDEREÇO:</span>
                        <span>${duplicata.devedor.rua.toUpperCase()}, Nº ${duplicata.devedor.numero} - ${duplicata.devedor.bairro.toUpperCase()}</span>
                    </div>
                    <div class="linha-sacado">
                        <span class="label">CEP:</span>
                        <span>${duplicata.devedor.cep || '______'}</span>
                        <span style="margin-left: 15mm;" class="label">MUNICÍPIO:</span>
                        <span>${duplicata.devedor.cidade.toUpperCase()}</span>
                    </div>
                    <div class="linha-sacado">
                        <span class="label">PRAÇA DE PAGAMENTO:</span>
                        <span>${duplicata.devedor.cidade.toUpperCase()}</span>
                        <span style="margin-left: 15mm;" class="label">CNPJ / CPF (MF):</span>
                        <span>${formatarCPF(duplicata.devedor.cpf)}</span>
                    </div>
                    <div class="linha-sacado">
                        <span class="label">Insc. Est. Nº:</span>
                        <span>ISENTO</span>
                    </div>
                </div>
                
                <!-- REP.M: VALOR PADRÃO 30 - ALTERE AQUI SE NECESSÁRIO -->
                <div class="repm">
                    REP.M: 30
                </div>
                
                <div class="rodape">
                    <div>VALOR POR EXTENSO<br>${duplicata.valorExtenso.toUpperCase()}</div>
                    <div>DEVEDOR<br>${duplicata.devedor.nome.toUpperCase()}</div>
                    <div>PRAÇA DE PAGAMENTO<br>${duplicata.devedor.cidade.toUpperCase()}</div>
                </div>
                
                <!-- ASSINATURA SIMPLIFICADA -->
                <div class="assinatura-container">
                    <span class="assinatura-label">ASSINATURA:</span>
                    <div class="linha-assinatura"></div>
                </div>
                
                <!-- CRÉDITO DO DESENVOLVEDOR (aparece apenas na tela, não na impressão) -->
                <div class="desenvolvido no-print">
                    Este site foi desenvolvido por SIPRIANO WEB em parceria com FRANK MOTOS
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
        endereco += ', Nº ' + devedor.numero;
    }
    
    if (devedor.bairro) {
        endereco += ' - ' + devedor.bairro.toUpperCase();
    }
    
    return endereco || 'RUA DOS CRISTAMENTOS, Nº 0 - CENTRO';
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
            fantasia: "FRANK MOTOS",
            cnpj: "33.917.740/0001-46",
            ie: "0000001109367",
            ccm: "11.222-3",
            contato: "(69) 98494-0207",
            endereco: "AV: MIGUEL VIEIRA FERREIRA, 5454",
            bairro: "Cidade Alta",
            cidade: "ROLIM DE MOURA",
            uf: "RO",
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
    
    // Adicionar créditos do desenvolvedor em todas as páginas
    adicionarCreditosDesenvolvedor();
});

// Função para adicionar créditos do desenvolvedor em todas as páginas
function adicionarCreditosDesenvolvedor() {
    // Verificar se já existe um rodapé
    let footer = document.querySelector('footer');
    
    if (!footer) {
        // Criar rodapé se não existir
        footer = document.createElement('footer');
        footer.className = 'footer mt-5';
        document.body.appendChild(footer);
    }
    
    // Adicionar créditos
    footer.innerHTML = `
        <div class="container text-center">
            <hr>
            <p class="text-muted">
                <i class="bi bi-code-slash"></i> Este site foi desenvolvido por <strong>SIPRIANO WEB</strong> em parceria com <strong>FRANK MOTOS</strong>
            </p>
        </div>
    `;
}

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
        fantasia: document.getElementById('configFantasia').value,
        cnpj: document.getElementById('configCnpj').value,
        ie: document.getElementById('configIE').value,
        ccm: document.getElementById('configCCM').value,
        contato: document.getElementById('configContato').value,
        endereco: document.getElementById('configEndereco').value,
        bairro: document.getElementById('configBairro').value,
        cidade: document.getElementById('configCidade').value,
        uf: document.getElementById('configUF').value,
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
        document.getElementById('configFantasia').value = configCredor.fantasia || '';
        document.getElementById('configCnpj').value = configCredor.cnpj;
        document.getElementById('configIE').value = configCredor.ie;
        document.getElementById('configCCM').value = configCredor.ccm || '11.222-3';
        document.getElementById('configContato').value = configCredor.contato;
        document.getElementById('configEndereco').value = configCredor.endereco;
        document.getElementById('configBairro').value = configCredor.bairro;
        document.getElementById('configCidade').value = configCredor.cidade;
        document.getElementById('configUF').value = configCredor.uf;
        document.getElementById('configCep').value = configCredor.cep;
    }
}
