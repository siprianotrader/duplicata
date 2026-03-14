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

// ===== FUNÇÕES DE CONVERSÃO =====

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

// Função para formatar data no padrão brasileiro
function formatarDataBR(dataString) {
    if (!dataString) return '';
    return dataString.split('-').reverse().join('/');
}

// Função para formatar data por extenso
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

// ===== FUNÇÕES DO FORMULÁRIO =====

// Função para converter valor do input para extenso
function converterValorPorExtenso() {
    const valor = parseFloat(document.getElementById('valor').value) || 0;
    const extenso = numeroPorExtenso(valor);
    document.getElementById('valorExtenso').value = extenso.charAt(0).toUpperCase() + extenso.slice(1);
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

// ===== FUNÇÕES DA TABELA DE CLIENTES =====

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

// ===== FUNÇÕES DE IMPRESSÃO =====

// Função para imprimir duplicata
function imprimirDuplicata(id) {
    const duplicata = duplicatas.find(d => d.id === id);
    if (!duplicata) {
        alert('Duplicata não encontrada!');
        return;
    }
    
    const vencimentoFormatado = formatarDataBR(duplicata.vencimento);
    const dataEmissaoFormatada = formatarDataBR(duplicata.dataEmissao);
    
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <html>
        <head>
            <title>Duplicata - ${duplicata.devedor.nome}</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { 
                    font-family: 'Courier New', monospace; 
                    margin: 0;
                    padding: 20px;
                    background: #fff;
                }
                .container-duplicata {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .titulo-principal {
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                }
                .info-credor {
                    border: 1px solid #000;
                    padding: 10px;
                    margin-bottom: 20px;
                }
                .linha-credor {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .tabela-valores {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 1px solid #000;
                }
                .tabela-valores th, .tabela-valores td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }
                .tabela-valores th {
                    background-color: #f0f0f0;
                }
                .desconto-condicoes {
                    border: 1px solid #000;
                    padding: 8px;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .multa-info {
                    border: 1px solid #000;
                    padding: 8px;
                    margin-bottom: 20px;
                    background-color: #fff3cd;
                    text-align: center;
                    font-weight: bold;
                }
                .sacado {
                    border: 1px solid #000;
                    padding: 10px;
                    margin-bottom: 10px;
                }
                .linha-sacado {
                    display: flex;
                    margin-bottom: 5px;
                }
                .label {
                    font-weight: bold;
                    width: 150px;
                }
                .repm {
                    border: 1px solid #000;
                    padding: 5px 10px;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .rodape {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    margin-top: 30px;
                }
                .assinatura-container {
                    margin-top: 40px;
                    text-align: left;
                }
                .assinatura-label {
                    font-weight: bold;
                    margin-right: 10px;
                }
                .linha-assinatura {
                    border-bottom: 1px solid #000;
                    width: 100%;
                    margin-top: 5px;
                }
                .no-print {
                    margin-top: 30px;
                    text-align: center;
                }
                .btn-print, .btn-close {
                    padding: 10px 20px;
                    margin: 0 5px;
                    cursor: pointer;
                    border: none;
                    border-radius: 5px;
                }
                .btn-print { background: #ffc107; }
                .btn-close { background: #6c757d; color: white; }
                .desenvolvido {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }
                @media print { .no-print { display: none; } }
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
                        <span style="margin-left: 50px;" class="label">MUNICÍPIO:</span>
                        <span>${duplicata.devedor.cidade.toUpperCase()}</span>
                    </div>
                    <div class="linha-sacado">
                        <span class="label">PRAÇA DE PAGAMENTO:</span>
                        <span>${duplicata.devedor.cidade.toUpperCase()}</span>
                        <span style="margin-left: 50px;" class="label">CNPJ / CPF (MF):</span>
                        <span>${formatarCPF(duplicata.devedor.cpf)}</span>
                    </div>
                    <div class="linha-sacado">
                        <span class="label">Insc. Est. Nº:</span>
                        <span>ISENTO</span>
                    </div>
                </div>
                
                <div class="repm">
                    REP.M: 30
                </div>
                
                <div class="rodape">
                    <div>VALOR POR EXTENSO<br>${duplicata.valorExtenso.toUpperCase()}</div>
                    <div>DEVEDOR<br>${duplicata.devedor.nome.toUpperCase()}</div>
                    <div>PRAÇA DE PAGAMENTO<br>${duplicata.devedor.cidade.toUpperCase()}</div>
                </div>
                
                <div class="assinatura-container">
                    <span class="assinatura-label">ASSINATURA:</span>
                    <div class="linha-assinatura"></div>
                </div>
                
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

// Função para imprimir contrato
function imprimirContrato(id) {
    const duplicata = duplicatas.find(d => d.id === id);
    if (!duplicata) {
        alert('Duplicata não encontrada!');
        return;
    }
    
    const dataAtual = new Date();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const dataExtenso = `${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}`;
    
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <html>
        <head>
            <title>Contrato - ${duplicata.devedor.nome}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { 
                    font-family: 'Times New Roman', serif; 
                    margin: 0;
                    padding: 20px;
                    background: #fff;
                    font-size: 12pt;
                    line-height: 1.5;
                }
                .container-contrato {
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1 {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                }
                h2 {
                    text-align: center;
                    font-size: 18px;
                    margin-bottom: 30px;
                }
                .contrato-numero {
                    text-align: right;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .partes {
                    margin-bottom: 20px;
                    text-align: justify;
                }
                .clausula {
                    margin-bottom: 15px;
                    text-align: justify;
                }
                .clausula-titulo {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .multa-destaque {
                    border: 2px solid #000;
                    padding: 10px;
                    margin: 20px 0;
                    background-color: #f8f9fa;
                    text-align: center;
                    font-weight: bold;
                }
                .assinaturas {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                }
                .assinatura {
                    text-align: center;
                    width: 45%;
                }
                .linha-assinatura {
                    border-bottom: 1px solid #000;
                    margin: 10px 0 15px 0;
                    height: 30px;
                }
                .data-local {
                    margin-top: 30px;
                    text-align: right;
                }
                .no-print {
                    margin-top: 30px;
                    text-align: center;
                }
                .btn-print, .btn-close {
                    padding: 10px 20px;
                    margin: 0 5px;
                    cursor: pointer;
                    border: none;
                    border-radius: 5px;
                }
                .btn-print { background: #ffc107; }
                .btn-close { background: #6c757d; color: white; }
                .desenvolvido {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="container-contrato">
                <div class="contrato-numero">
                    CONTRATO Nº ${duplicata.numNF || duplicata.id.toString().slice(-6)}
                </div>
                
                <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
                <h2>FRANK MOTOS - OFICINA ESPECIALIZADA EM MOTOCICLETAS</h2>
                
                <div class="partes">
                    <p><strong>CONTRATANTE:</strong> ${duplicata.devedor.nome}, inscrito no CPF/CNPJ sob nº ${formatarCPF(duplicata.devedor.cpf)}, residente e domiciliado na ${duplicata.devedor.rua}, nº ${duplicata.devedor.numero}, ${duplicata.devedor.bairro}, ${duplicata.devedor.cidade} - ${duplicata.devedor.estado}, CEP ${duplicata.devedor.cep || '______'}.</p>
                    
                    <p><strong>CONTRATADA:</strong> FRANKELLEY STEFANO ALVES AZEVEDO ME, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${configCredor.cnpj}, com sede na ${configCredor.endereco}, ${configCredor.bairro}, ${configCredor.cidade} - ${configCredor.uf}, CEP ${configCredor.cep}, doravante denominada simplesmente CONTRATADA.</p>
                </div>
                
                <p>As partes acima identificadas têm, entre si, justo e acordado o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente instrumento.</p>
                
                <div class="clausula">
                    <div class="clausula-titulo">CLÁUSULA PRIMEIRA - DO OBJETO</div>
                    <p>O presente contrato tem como objeto a prestação de serviços de oficina mecânica em motocicletas, incluindo mão de obra e fornecimento de peças necessárias para o reparo/conservação do veículo do CONTRATANTE, conforme descrito na Ordem de Serviço e Nota Fiscal nº ${duplicata.numNF}, emitida em ${formatarDataBR(duplicata.dataEmissao)}.</p>
                </div>
                
                <div class="clausula">
                    <div class="clausula-titulo">CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO</div>
                    <p>O valor total dos serviços e peças é de R$ ${parseFloat(duplicata.valor).toFixed(2)} (${duplicata.valorExtenso}), que será pago pelo CONTRATANTE à CONTRATADA na data de vencimento da duplicata, qual seja, ${formatarDataBR(duplicata.vencimento)}.</p>
                    <p>O pagamento será efetuado mediante apresentação da Duplicata de Venda Mercantil vinculada a este contrato.</p>
                </div>
                
                <div class="clausula">
                    <div class="clausula-titulo">CLÁUSULA TERCEIRA - DA MORA E INADIMPLEMENTO</div>
                    <p>Ocorrendo mora, o débito em atraso sofrerá incidência de:</p>
                    <p>a) <strong>MULTA DE 2% (DOIS POR CENTO)</strong> sobre o valor do débito, aplicável imediatamente após o vencimento;</p>
                    <p>b) <strong>MORA DIÁRIA DE R$ 2,14 (DOIS REAIS E QUATORZE CENTAVOS)</strong> por dia de atraso, a partir do primeiro dia útil seguinte ao vencimento;</p>
                    <p>c) Correção monetária pelo IPCA-E ou índice que vier a substituí-lo.</p>
                    <p>O não pagamento do valor devido até a data do vencimento autoriza a CONTRATADA a protestar a duplicata e inscrever o nome do CONTRATANTE em órgãos de proteção ao crédito, além de possibilitar a cobrança judicial dos valores devidos acrescidos dos encargos moratórios aqui estipulados.</p>
                </div>
                
                <div class="multa-destaque">
                    ⚠️ APÓS O VENCIMENTO: MULTA DE 2% + MORA DIÁRIA DE R$ 2,14 ⚠️
                </div>
                
                <div class="clausula">
                    <div class="clausula-titulo">CLÁUSULA QUARTA - DA GARANTIA</div>
                    <p>A CONTRATADA garante os serviços prestados e as peças fornecidas pelo prazo de 90 (noventa) dias, contados da data da emissão da Nota Fiscal, contra defeitos de fabricação ou erro na execução do serviço, excluídos os danos decorrentes de mau uso, acidentes ou manutenção inadequada por parte do CONTRATANTE.</p>
                </div>
                
                <div class="clausula">
                    <div class="clausula-titulo">CLÁUSULA QUINTA - DO FORO</div>
                    <p>Fica eleito o foro da comarca de ${configCredor.cidade} - ${configCredor.uf} para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
                </div>
                
                <div class="data-local">
                    <p>${configCredor.cidade} - ${configCredor.uf}, ${dataExtenso}.</p>
                </div>
                
                <div class="assinaturas">
                    <div class="assinatura">
                        <div class="linha-assinatura"></div>
                        <p><strong>CONTRATANTE</strong><br>${duplicata.devedor.nome}</p>
                    </div>
                    <div class="assinatura">
                        <div class="linha-assinatura"></div>
                        <p><strong>CONTRATADA</strong><br>FRANK MOTOS<br>${configCredor.nome}</p>
                    </div>
                </div>
                
                <div class="desenvolvido no-print">
                    Este site foi desenvolvido por SIPRIANO WEB em parceria com FRANK MOTOS
                </div>
                
                <div class="no-print">
                    <button class="btn-print" onclick="window.print()">Imprimir Contrato</button>
                    <button class="btn-close" onclick="window.close()">Fechar</button>
                </div>
            </div>
        </body>
        </html>
    `);
    janelaImpressao.document.close();
}

// ===== FUNÇÕES DE BACKUP EM XML =====

// Função auxiliar para escapar caracteres especiais em XML
function escapeXML(texto) {
    if (!texto) return '';
    return texto.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Função auxiliar para obter valor de tag XML
function getXMLValue(parent, tagName) {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent : '';
}

// Função para exportar dados em XML
function exportarXML() {
    try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<frank_motos_backup>\n';
        xml += '  <data_backup>' + new Date().toLocaleString('pt-BR') + '</data_backup>\n';
        xml += '  <versao>1.0</versao>\n';
        
        xml += '  <credor>\n';
        xml += '    <nome>' + escapeXML(configCredor.nome) + '</nome>\n';
        xml += '    <fantasia>' + escapeXML(configCredor.fantasia) + '</fantasia>\n';
        xml += '    <cnpj>' + escapeXML(configCredor.cnpj) + '</cnpj>\n';
        xml += '    <ie>' + escapeXML(configCredor.ie) + '</ie>\n';
        xml += '    <ccm>' + escapeXML(configCredor.ccm) + '</ccm>\n';
        xml += '    <contato>' + escapeXML(configCredor.contato) + '</contato>\n';
        xml += '    <endereco>' + escapeXML(configCredor.endereco) + '</endereco>\n';
        xml += '    <bairro>' + escapeXML(configCredor.bairro) + '</bairro>\n';
        xml += '    <cidade>' + escapeXML(configCredor.cidade) + '</cidade>\n';
        xml += '    <uf>' + escapeXML(configCredor.uf) + '</uf>\n';
        xml += '    <cep>' + escapeXML(configCredor.cep) + '</cep>\n';
        xml += '  </credor>\n';
        
        xml += '  <duplicatas>\n';
        
        duplicatas.forEach((dup, index) => {
            xml += '    <duplicata id="' + dup.id + '">\n';
            xml += '      <indice>' + (index + 1) + '</indice>\n';
            xml += '      <data_emissao>' + dup.dataEmissao + '</data_emissao>\n';
            xml += '      <num_nf>' + escapeXML(dup.numNF || '') + '</num_nf>\n';
            xml += '      <valor>' + dup.valor + '</valor>\n';
            xml += '      <num_duplicata>' + escapeXML(dup.numDuplicata || '') + '</num_duplicata>\n';
            xml += '      <vencimento>' + dup.vencimento + '</vencimento>\n';
            xml += '      <status>' + dup.status + '</status>\n';
            xml += '      <valor_extenso>' + escapeXML(dup.valorExtenso || '') + '</valor_extenso>\n';
            xml += '      <repm>' + (dup.repm || '30') + '</repm>\n';
            
            xml += '      <devedor>\n';
            xml += '        <nome>' + escapeXML(dup.devedor.nome) + '</nome>\n';
            xml += '        <cpf>' + escapeXML(dup.devedor.cpf) + '</cpf>\n';
            xml += '        <estado>' + escapeXML(dup.devedor.estado) + '</estado>\n';
            xml += '        <rua>' + escapeXML(dup.devedor.rua || '') + '</rua>\n';
            xml += '        <numero>' + escapeXML(dup.devedor.numero || '') + '</numero>\n';
            xml += '        <bairro>' + escapeXML(dup.devedor.bairro || '') + '</bairro>\n';
            xml += '        <cidade>' + escapeXML(dup.devedor.cidade || '') + '</cidade>\n';
            xml += '        <cep>' + escapeXML(dup.devedor.cep || '') + '</cep>\n';
            xml += '        <municipio>' + escapeXML(dup.devedor.municipio || '') + '</municipio>\n';
            xml += '      </devedor>\n';
            xml += '    </duplicata>\n';
        });
        
        xml += '  </duplicatas>\n';
        xml += '</frank_motos_backup>';
        
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frank_motos_backup_${new Date().toISOString().slice(0,10)}.xml`;
        a.click();
        
        alert('Backup XML exportado com sucesso!');
    } catch (error) {
        alert('Erro ao exportar XML: ' + error.message);
    }
}

// Função para importar dados de XML
function importarXML() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(readerEvent) {
            try {
                const xmlString = readerEvent.target.result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
                
                const root = xmlDoc.documentElement;
                if (root.nodeName !== 'frank_motos_backup') {
                    throw new Error('Arquivo XML inválido - não é um backup do Frank Motos');
                }
                
                const credorNode = xmlDoc.getElementsByTagName('credor')[0];
                if (credorNode) {
                    configCredor = {
                        nome: getXMLValue(credorNode, 'nome') || configCredor.nome,
                        fantasia: getXMLValue(credorNode, 'fantasia') || configCredor.fantasia,
                        cnpj: getXMLValue(credorNode, 'cnpj') || configCredor.cnpj,
                        ie: getXMLValue(credorNode, 'ie') || configCredor.ie,
                        ccm: getXMLValue(credorNode, 'ccm') || configCredor.ccm,
                        contato: getXMLValue(credorNode, 'contato') || configCredor.contato,
                        endereco: getXMLValue(credorNode, 'endereco') || configCredor.endereco,
                        bairro: getXMLValue(credorNode, 'bairro') || configCredor.bairro,
                        cidade: getXMLValue(credorNode, 'cidade') || configCredor.cidade,
                        uf: getXMLValue(credorNode, 'uf') || configCredor.uf,
                        cep: getXMLValue(credorNode, 'cep') || configCredor.cep
                    };
                }
                
                const duplicatasNodes = xmlDoc.getElementsByTagName('duplicata');
                const novasDuplicatas = [];
                
                for (let i = 0; i < duplicatasNodes.length; i++) {
                    const dup = duplicatasNodes[i];
                    const devedorNode = dup.getElementsByTagName('devedor')[0];
                    
                    if (devedorNode) {
                        const duplicata = {
                            id: parseInt(dup.getAttribute('id')) || Date.now() + i,
                            dataEmissao: getXMLValue(dup, 'data_emissao') || '',
                            numNF: getXMLValue(dup, 'num_nf') || '',
                            valor: parseFloat(getXMLValue(dup, 'valor')) || 0,
                            numDuplicata: getXMLValue(dup, 'num_duplicata') || '',
                            vencimento: getXMLValue(dup, 'vencimento') || '',
                            status: getXMLValue(dup, 'status') || 'pendente',
                            valorExtenso: getXMLValue(dup, 'valor_extenso') || '',
                            repm: getXMLValue(dup, 'repm') || '30',
                            devedor: {
                                nome: getXMLValue(devedorNode, 'nome') || '',
                                cpf: getXMLValue(devedorNode, 'cpf') || '',
                                estado: getXMLValue(devedorNode, 'estado') || 'RO',
                                rua: getXMLValue(devedorNode, 'rua') || '',
                                numero: getXMLValue(devedorNode, 'numero') || '',
                                bairro: getXMLValue(devedorNode, 'bairro') || '',
                                cidade: getXMLValue(devedorNode, 'cidade') || '',
                                cep: getXMLValue(devedorNode, 'cep') || '',
                                municipio: getXMLValue(devedorNode, 'municipio') || ''
                            }
                        };
                        
                        duplicata.devedor.endereco = `${duplicata.devedor.rua}, Nº ${duplicata.devedor.numero} - ${duplicata.devedor.bairro}`;
                        
                        if (!duplicata.valorExtenso && duplicata.valor) {
                            duplicata.valorExtenso = numeroPorExtenso(duplicata.valor);
                        }
                        
                        if (duplicata.dataEmissao) {
                            duplicata.dataExtenso = formatarDataExtenso(duplicata.dataEmissao);
                        }
                        
                        duplicata.credor = configCredor;
                        
                        novasDuplicatas.push(duplicata);
                    }
                }
                
                if (novasDuplicatas.length > 0) {
                    duplicatas = novasDuplicatas;
                    localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
                    localStorage.setItem('configCredor', JSON.stringify(configCredor));
                    
                    carregarTabelaClientes();
                    atualizarEstatisticas();
                    carregarConfigAdmin();
                    
                    alert(`Backup importado com sucesso! ${novasDuplicatas.length} duplicatas carregadas.`);
                } else {
                    alert('Nenhuma duplicata encontrada no arquivo XML.');
                }
                
            } catch (error) {
                alert('Erro ao importar XML: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ===== FUNÇÕES AUXILIARES =====

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

// Funções admin (mantendo compatibilidade)
function exportarDados() {
    exportarXML();
}

function importarDados() {
    importarXML();
}

function limparTodosDados() {
    if (confirm('ATENÇÃO! Isso irá apagar TODOS os dados. Tem certeza?')) {
        if (confirm('Faça um backup antes! Deseja continuar mesmo assim?')) {
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
}

// ===== CONFIGURAÇÕES E INICIALIZAÇÃO =====

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

// Função para adicionar créditos do desenvolvedor
function adicionarCreditosDesenvolvedor() {
    let footer = document.querySelector('footer');
    
    if (!footer) {
        footer = document.createElement('footer');
        footer.className = 'footer mt-5';
        document.body.appendChild(footer);
    }
    
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

// Inicialização quando a página carrega
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
    
    adicionarCreditosDesenvolvedor();
});
