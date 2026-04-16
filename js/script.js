// ===== BANCO DE DADOS LOCAL =====
let duplicatas = JSON.parse(localStorage.getItem('duplicatas')) || [];
let pontuacoes = JSON.parse(localStorage.getItem('pontuacoes')) || {};
let solicitacoesPagamento = JSON.parse(localStorage.getItem('solicitacoesPagamento')) || [];
let notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];

let configCredor = JSON.parse(localStorage.getItem('configCredor')) || {
    nome: "FRANKELLEY STEFANO ALVES AZEVEDO", fantasia: "FRANK MOTOS", cnpj: "33.917.740/0001-46",
    ie: "0000001109367", ccm: "11.222-3", contato: "(69) 98494-0207",
    endereco: "Av Dr Miguel Vieira Ferreira, 5454", bairro: "Cidade Alta",
    cidade: "ROLIM DE MOURA", uf: "RO", cep: "76940-000"
};

// ===== FUNÇÕES AUXILIARES =====
function formatarDataBR(dataString) { 
    if (!dataString) return ''; 
    return dataString.split('-').reverse().join('/'); 
}

function formatarDataBRComBarras(dataString) {
    if (!dataString) return '___/___/______';
    return dataString.split('-').reverse().join('/');
}

function formatarDataExtenso(dataString) {
    if (!dataString) return '';
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const data = new Date(dataString + 'T12:00:00');
    return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

function formatarCPF(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length === 11) return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (cpf.length === 14) return cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return cpf;
}

function aplicarMascaraCPFouCNPJ(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    input.value = valor;
}

function validarCPFouCNPJ(valor) {
    valor = valor.replace(/\D/g, '');
    if (valor.length === 11) {
        if (/^(\d)\1{10}$/.test(valor)) return false;
        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(valor.charAt(i)) * (10 - i);
        let resto = 11 - (soma % 11);
        let digito1 = resto >= 10 ? 0 : resto;
        if (parseInt(valor.charAt(9)) !== digito1) return false;
        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(valor.charAt(i)) * (11 - i);
        resto = 11 - (soma % 11);
        let digito2 = resto >= 10 ? 0 : resto;
        return parseInt(valor.charAt(10)) === digito2;
    } else if (valor.length === 14) {
        if (/^(\d)\1{13}$/.test(valor)) return false;
        return true;
    }
    return false;
}

function getPrimeiroNome(nomeCompleto) { 
    return nomeCompleto ? nomeCompleto.split(' ')[0] : 'Cliente'; 
}

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
        if (milhares === 1) extenso += 'um mil';
        else extenso += converterCentena(milhares, centenas, dezenas, unidades, dezA19) + ' mil';
        if (inteiro > 0) extenso += ' e ';
    }
    extenso += converterCentena(inteiro, centenas, dezenas, unidades, dezA19);
    extenso += ' reais';
    if (centavos > 0) extenso += ' e ' + converterCentena(centavos, centenas, dezenas, unidades, dezA19) + ' centavos';
    return extenso;
}

function converterCentena(num, centenas, dezenas, unidades, dezA19) {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    let resultado = '';
    let centena = Math.floor(num / 100);
    let resto = num % 100;
    if (centena > 0) { resultado += centenas[centena]; if (resto > 0) resultado += ' e '; }
    if (resto >= 20) {
        let dezena = Math.floor(resto / 10);
        let unidade = resto % 10;
        resultado += dezenas[dezena];
        if (unidade > 0) resultado += ' e ' + unidades[unidade];
    } else if (resto >= 10) resultado += dezA19[resto - 10];
    else if (resto > 0) resultado += unidades[resto];
    return resultado;
}

function calcularVencimentoParcela(dataBase, numeroParcela) {
    const data = new Date(dataBase);
    data.setMonth(data.getMonth() + (numeroParcela - 1));
    return data.toISOString().slice(0, 10);
}

// ===== FUNÇÕES DE NOTIFICAÇÃO =====
function adicionarNotificacao(clienteCpf, clienteNome, titulo, mensagem, tipo) {
    const notificacao = {
        id: Date.now(),
        cpf: clienteCpf,
        nome: clienteNome,
        titulo: titulo,
        mensagem: mensagem,
        tipo: tipo,
        data: new Date().toLocaleString(),
        lida: false
    };
    notificacoes.push(notificacao);
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
    
    if (window.location.pathname.includes('frankscore.html')) {
        const notifArea = document.getElementById('notificacaoArea');
        if (notifArea) {
            const bgColor = tipo === 'success' ? '#28a745' : tipo === 'warning' ? '#ffc107' : '#17a2b8';
            const icone = tipo === 'success' ? 'check-circle-fill' : tipo === 'warning' ? 'exclamation-triangle-fill' : 'info-circle-fill';
            const notif = document.createElement('div');
            notif.className = 'notificacao';
            notif.style.backgroundColor = bgColor;
            notif.style.color = '#fff';
            notif.innerHTML = `<i class="bi bi-${icone}"></i> <strong>${titulo}</strong><br>${mensagem}`;
            notifArea.appendChild(notif);
            setTimeout(() => { notif.remove(); }, 8000);
        }
    }
    return notificacao;
}

// ===== FUNÇÕES FRANKSCORE =====
function getNivelScore(pontos) {
    if (pontos >= 1000) return { nome: "DIAMANTE", cor: "nivel-diamante", icone: "💎", descricao: "Cliente Diamante - Benefícios Especiais!" };
    if (pontos >= 750) return { nome: "PLATINA", cor: "nivel-platina", icone: "🏆", descricao: "Cliente Platina - Descontos especiais!" };
    if (pontos >= 500) return { nome: "OURO", cor: "nivel-ouro", icone: "🥇", descricao: "Cliente Ouro - Prioridade no atendimento!" };
    if (pontos >= 250) return { nome: "PRATA", cor: "nivel-prata", icone: "🥈", descricao: "Cliente Prata - Continue acumulando pontos!" };
    return { nome: "BRONZE", cor: "nivel-bronze", icone: "🥉", descricao: "Cliente Bronze - Realize serviços para ganhar pontos!" };
}

function calcularPorcentagemScore(pontos) { 
    return (pontos / 1000) * 100; 
}

function adicionarPontos(cpf, pontos, motivo) {
    if (!pontuacoes[cpf]) pontuacoes[cpf] = { pontos: 0, historico: [] };
    let novosPontos = Math.min(1000, pontuacoes[cpf].pontos + pontos);
    pontuacoes[cpf].pontos = novosPontos;
    pontuacoes[cpf].historico.unshift({ data: new Date().toLocaleString(), pontos: pontos, motivo: motivo, totalAtual: novosPontos });
    localStorage.setItem('pontuacoes', JSON.stringify(pontuacoes));
    return novosPontos;
}

function removerPontos(cpf, pontos, motivo) {
    if (!pontuacoes[cpf]) pontuacoes[cpf] = { pontos: 0, historico: [] };
    let novosPontos = Math.max(0, pontuacoes[cpf].pontos - pontos);
    pontuacoes[cpf].pontos = novosPontos;
    pontuacoes[cpf].historico.unshift({ data: new Date().toLocaleString(), pontos: -pontos, motivo: motivo, totalAtual: novosPontos });
    localStorage.setItem('pontuacoes', JSON.stringify(pontuacoes));
    return novosPontos;
}

// ===== FUNÇÕES DE PAGAMENTO (CLIENTE) =====
function solicitarPagamento() {
    const parcelaId = sessionStorage.getItem('parcelaId');
    const cpf = sessionStorage.getItem('clienteCpf');
    
    if (!parcelaId || !cpf) { alert('Erro: Parcela não identificada!'); return; }
    
    const index = duplicatas.findIndex(d => d.id == parcelaId);
    if (index !== -1 && duplicatas[index].status === 'pendente') {
        duplicatas[index].status = 'aguardando_confirmacao';
        duplicatas[index].dataSolicitacao = new Date().toLocaleString();
        localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
        
        solicitacoesPagamento.push({
            id: Date.now(),
            parcelaId: parcelaId,
            cpf: cpf,
            clienteNome: duplicatas[index].devedor.nome,
            parcela: duplicatas[index].parcela,
            totalParcelas: duplicatas[index].totalParcelas,
            valor: duplicatas[index].valor,
            dataSolicitacao: new Date().toLocaleString(),
            status: 'pendente_confirmacao'
        });
        localStorage.setItem('solicitacoesPagamento', JSON.stringify(solicitacoesPagamento));
        
        adicionarNotificacao(cpf, duplicatas[index].devedor.nome, 'Pagamento Solicitado', 
            `Sua solicitação de pagamento da ${duplicatas[index].parcela}ª parcela foi enviada. Aguarde a confirmação da loja.`, 'warning');
        
        alert('✅ Solicitação de pagamento enviada! Aguarde a confirmação da loja.');
        window.location.href = 'frankscore.html';
    } else {
        alert('Esta parcela já foi paga ou está aguardando confirmação!');
    }
}

// ===== FUNÇÕES ADMIN (CONFIRMAÇÃO DE PAGAMENTO) =====
function carregarSolicitacoesAdmin() {
    const tbody = document.getElementById('tabelaSolicitacoes');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const solicitacoesPendentes = solicitacoesPagamento.filter(s => s.status === 'pendente_confirmacao');
    
    const alertDiv = document.getElementById('alertNovasSolicitacoes');
    if (alertDiv) {
        if (solicitacoesPendentes.length > 0) {
            alertDiv.style.display = 'block';
            alertDiv.innerHTML = `<i class="bi bi-bell-fill"></i> <strong>🔔 ${solicitacoesPendentes.length} NOVA(S) SOLICITAÇÃO(ÕES) DE PAGAMENTO AGUARDANDO CONFIRMAÇÃO!</strong>`;
        } else {
            alertDiv.style.display = 'none';
        }
    }
    
    if (solicitacoesPagamento.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">📭 Nenhuma solicitação de pagamento encontrada</td></tr>';
        return;
    }
    
    solicitacoesPagamento.sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao));
    
    solicitacoesPagamento.forEach(sol => {
        const row = tbody.insertRow();
        let statusClass = '';
        let statusText = '';
        let actionsHtml = '';
        
        if (sol.status === 'confirmado') {
            statusClass = 'status-confirmado';
            statusText = '✅ CONFIRMADO';
            actionsHtml = '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Confirmado</span>';
        } else if (sol.status === 'nao_confirmado') {
            statusClass = 'status-nao-confirmado';
            statusText = '❌ NÃO CONFIRMADO';
            actionsHtml = '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Negado</span>';
        } else if (sol.status === 'pendente_confirmacao') {
            statusClass = 'status-pendente-confirmacao';
            statusText = '⏳ AGUARDANDO';
            actionsHtml = `
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-confirmar" onclick="confirmarPagamentoAdmin(${sol.id})" title="Confirmar pagamento">
                        <i class="bi bi-check-circle-fill"></i> Confirmar
                    </button>
                    <button class="btn btn-negar" onclick="negarPagamentoAdmin(${sol.id})" title="Negar pagamento">
                        <i class="bi bi-x-circle-fill"></i> Negar
                    </button>
                </div>
            `;
        } else {
            statusClass = 'status-pendente';
            statusText = '⏰ PENDENTE';
            actionsHtml = '<span class="text-muted">Aguardando</span>';
        }
        
        row.innerHTML = `
            <td class="text-center align-middle"><strong>${sol.clienteNome}</strong></td>
            <td class="text-center align-middle">${sol.parcela}ª / ${sol.totalParcelas}</td>
            <td class="text-center align-middle"><strong class="text-success">R$ ${parseFloat(sol.valor).toFixed(2)}</strong></td>
            <td class="text-center align-middle">${sol.dataSolicitacao}</td>
            <td class="text-center align-middle"><span class="${statusClass}">${statusText}</span></td>
            <td class="text-center align-middle">${actionsHtml}</td>
        `;
    });
}

function confirmarPagamentoAdmin(solicitacaoId) {
    const solicitacao = solicitacoesPagamento.find(s => s.id === solicitacaoId);
    if (!solicitacao) return;
    
    const parcelaIndex = duplicatas.findIndex(d => d.id == solicitacao.parcelaId);
    if (parcelaIndex !== -1) {
        duplicatas[parcelaIndex].status = 'pago';
        duplicatas[parcelaIndex].dataPagamento = new Date().toISOString().slice(0, 10);
        localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
        
        solicitacao.status = 'confirmado';
        localStorage.setItem('solicitacoesPagamento', JSON.stringify(solicitacoesPagamento));
        
        const novosPontos = adicionarPontos(solicitacao.cpf, 7, 'Pagamento em Dia');
        adicionarPontos(solicitacao.cpf, 2, 'Parcela Paga');
        
        adicionarNotificacao(solicitacao.cpf, solicitacao.clienteNome, 'Pagamento Confirmado!', 
            `Seu pagamento da ${solicitacao.parcela}ª parcela foi confirmado! +9 pontos adicionados. Seu score agora é ${novosPontos} pontos.`, 'success');
        
        alert(`✅ Pagamento confirmado! Cliente notificado.`);
        carregarSolicitacoesAdmin();
        atualizarEstatisticas();
        carregarTabelaClientes();
    }
}

function negarPagamentoAdmin(solicitacaoId) {
    const solicitacao = solicitacoesPagamento.find(s => s.id === solicitacaoId);
    if (!solicitacao) return;
    
    const parcelaIndex = duplicatas.findIndex(d => d.id == solicitacao.parcelaId);
    if (parcelaIndex !== -1) {
        duplicatas[parcelaIndex].status = 'pendente';
        localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
        
        solicitacao.status = 'nao_confirmado';
        localStorage.setItem('solicitacoesPagamento', JSON.stringify(solicitacoesPagamento));
        
        adicionarNotificacao(solicitacao.cpf, solicitacao.clienteNome, 'Pagamento Não Confirmado', 
            `Seu pagamento da ${solicitacao.parcela}ª parcela não foi confirmado. Entre em contato com a loja para regularizar.`, 'danger');
        
        alert(`⚠️ Pagamento negado! Cliente notificado.`);
        carregarSolicitacoesAdmin();
        carregarTabelaClientes();
    }
}

// ===== FUNÇÕES DO FORMULÁRIO =====
function buscarClientePorCPF() {
    const cpf = document.getElementById('cpfDevedor').value.replace(/\D/g, '');
    if (cpf.length < 11) return;
    
    const clienteExistente = duplicatas.find(d => d.devedor.cpf === cpf);
    if (clienteExistente) {
        document.getElementById('clienteExistenteAlert').style.display = 'block';
        document.getElementById('nomeDevedor').value = clienteExistente.devedor.nome;
        document.getElementById('ruaDevedor').value = clienteExistente.devedor.rua;
        document.getElementById('numeroDevedor').value = clienteExistente.devedor.numero;
        document.getElementById('bairroDevedor').value = clienteExistente.devedor.bairro;
        document.getElementById('cidade').value = clienteExistente.devedor.cidade;
        document.getElementById('cep').value = clienteExistente.devedor.cep || '';
        document.getElementById('estado').value = clienteExistente.devedor.estado;
        document.getElementById('municipio').value = clienteExistente.devedor.municipio || '';
        document.getElementById('clienteExistenteAlert').scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('clienteExistenteAlert').style.display = 'none';
    }
}

function converterValorPorExtenso() {
    const valor = parseFloat(document.getElementById('valor').value) || 0;
    document.getElementById('valorExtenso').value = numeroPorExtenso(valor).charAt(0).toUpperCase() + numeroPorExtenso(valor).slice(1);
}

function atualizarDataFormatada() {
    const data = document.getElementById('dataEmissao')?.value;
    if (data) document.getElementById('dataEmissaoFormatada').value = formatarDataExtenso(data);
}

function toggleParcelas() {
    const select = document.getElementById('quantidadeParcelas');
    const div = document.getElementById('parcelasContainer');
    if (select && div) { 
        div.style.display = select.value === '1' ? 'none' : 'block'; 
        if (select.value !== '1') gerarCamposParcelas(); 
    }
}

function gerarCamposParcelas() {
    const qtd = parseInt(document.getElementById('quantidadeParcelas').value);
    const total = parseFloat(document.getElementById('valor').value) || 0;
    const valorParcela = total / qtd;
    const data = document.getElementById('dataEmissao').value;
    const container = document.getElementById('parcelasContainer');
    if (!container) return;
    let html = '<h6 class="mt-3 mb-2">📋 Detalhes das Parcelas:</h6><div class="table-responsive"><table class="table table-sm table-bordered"><thead class="table-dark"><tr><th>Nº</th><th>Valor (R$)</th><th>Data Vencimento</th></tr></thead><tbody>';
    for (let i = 1; i <= qtd; i++) {
        const venc = calcularVencimentoParcela(data, i);
        html += `<tr><td class="text-center">${i}ª</td><td class="text-center">R$ ${valorParcela.toFixed(2)}</td><td class="text-center">${formatarDataBR(venc)}</td></tr>`;
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

document.getElementById('formDuplicata')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const qtd = parseInt(document.getElementById('quantidadeParcelas').value);
    const valorTotal = parseFloat(document.getElementById('valor').value);
    const valorParcela = valorTotal / qtd;
    const dataEmissao = document.getElementById('dataEmissao').value;
    const cpf = document.getElementById('cpfDevedor').value.replace(/\D/g, '');
    const numDuplicata = document.getElementById('numDuplicata').value;
    const numNF = document.getElementById('numNF').value;
    
    // Validar CPF/CNPJ
    if (!validarCPFouCNPJ(cpf)) {
        alert('⚠️ CPF/CNPJ inválido! Verifique o documento do cliente.');
        return;
    }
    
    // VALIDAÇÃO DE DATA
    const primeiraDataVencimento = calcularVencimentoParcela(dataEmissao, 1);
    if (primeiraDataVencimento < dataEmissao) {
        alert('⚠️ ATENÇÃO: A data de vencimento da primeira parcela é anterior à data de emissão!\n\nIsso impede o protesto da duplicata. Corrija as datas antes de salvar.');
        return;
    }
    
    const devedorBase = {
        nome: document.getElementById('nomeDevedor').value, 
        cpf: cpf,
        estado: document.getElementById('estado').value, 
        rua: document.getElementById('ruaDevedor').value,
        numero: document.getElementById('numeroDevedor').value, 
        bairro: document.getElementById('bairroDevedor').value,
        cidade: document.getElementById('cidade').value, 
        cep: document.getElementById('cep').value,
        municipio: document.getElementById('municipio').value || document.getElementById('cidade').value,
        endereco: `${document.getElementById('ruaDevedor').value}, Nº ${document.getElementById('numeroDevedor').value} - ${document.getElementById('bairroDevedor').value}`
    };
    
    const idOriginal = Date.now();
    for (let i = 1; i <= qtd; i++) {
        const venc = calcularVencimentoParcela(dataEmissao, i);
        duplicatas.push({
            id: idOriginal + i, 
            idOriginal: idOriginal, 
            parcela: i, 
            totalParcelas: qtd,
            credor: configCredor, 
            dataEmissao: dataEmissao, 
            numNF: numNF,
            valor: valorParcela, 
            valorTotal: valorTotal, 
            numDuplicata: numDuplicata ? `${numDuplicata}-${i}` : `${i}/${qtd}`,
            vencimento: venc, 
            devedor: devedorBase,
            valorExtenso: numeroPorExtenso(valorParcela).charAt(0).toUpperCase() + numeroPorExtenso(valorParcela).slice(1),
            dataExtenso: document.getElementById('dataEmissaoFormatada').value, 
            status: 'pendente', 
            repm: '30', 
            dataPagamento: null
        });
    }
    localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
    alert(`${qtd} parcela(s) salva(s) com sucesso!`);
    window.location.href = 'clientes.html';
});

// ===== FUNÇÕES DA TABELA DE CLIENTES =====
function carregarTabelaClientes() {
    const tbody = document.getElementById('tabelaClientes');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (duplicatas.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum cliente cadastrado</td></tr>'; 
        return; 
    }
    const clientesMap = new Map();
    duplicatas.forEach(dup => { 
        const cpf = dup.devedor.cpf; 
        if (!clientesMap.has(cpf)) clientesMap.set(cpf, { devedor: dup.devedor, duplicatas: [] }); 
        clientesMap.get(cpf).duplicatas.push(dup); 
    });
    let idx = 1;
    for (const [cpf, cliente] of clientesMap) {
        const totalValor = cliente.duplicatas.reduce((s, d) => s + parseFloat(d.valor), 0);
        const pago = cliente.duplicatas.filter(d => d.status === 'pago').length;
        const aguardando = cliente.duplicatas.filter(d => d.status === 'aguardando_confirmacao').length;
        const total = cliente.duplicatas.length;
        const statusText = pago === total ? '✅ Todas pagas' : (aguardando > 0 ? '⏳ Aguardando confirmação' : '⚠️ Pendente');
        const row = tbody.insertRow();
        row.innerHTML = `
            <td class="text-center">${idx}</td>
            <td><strong>${cliente.devedor.nome}</strong></td>
            <td>${formatarCPF(cpf)}</td>
            <td class="text-center">${total}x</td>
            <td class="text-center">R$ ${totalValor.toFixed(2)}</td>
            <td class="text-center">${statusText}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-info" onclick="verParcelas('${cpf}')"><i class="bi bi-list-ul"></i></button>
                <button class="btn btn-sm btn-warning" onclick="imprimirDuplicataTotal('${cpf}')"><i class="bi bi-receipt"></i></button>
                <button class="btn btn-sm btn-primary" onclick="imprimirContratoTotal('${cpf}')"><i class="bi bi-file-text"></i></button>
                <button class="btn btn-sm btn-danger" onclick="excluirCliente('${cpf}')"><i class="bi bi-trash"></i></button>
            </td>
        `;
        idx++;
    }
}

function verParcelas(cpf) {
    const parcelas = duplicatas.filter(d => d.devedor.cpf === cpf);
    if (parcelas.length === 0) return;
    const devedor = parcelas[0].devedor;
    let modalHTML = `<div class="modal fade" id="modalParcelas" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header bg-warning"><h5 class="modal-title"><i class="bi bi-receipt"></i> Parcelas - ${devedor.nome}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="table-responsive"><table class="table table-bordered"><thead class="table-dark"><tr><th>Parcela</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
    parcelas.sort((a,b) => a.parcela - b.parcela).forEach(dup => {
        let statusClass = '', statusText = '';
        if (dup.status === 'pago') { statusClass = 'success'; statusText = 'PAGA'; }
        else if (dup.status === 'aguardando_confirmacao') { statusClass = 'info'; statusText = 'AGUARDANDO'; }
        else { statusClass = 'danger'; statusText = 'PENDENTE'; }
        
        modalHTML += `<tr><td class="text-center">${dup.parcela}ª / ${dup.totalParcelas}</td><td class="text-center">R$ ${parseFloat(dup.valor).toFixed(2)}</td><td class="text-center">${formatarDataBR(dup.vencimento)}</td>
            <td class="text-center"><span class="badge bg-${statusClass}">${statusText}</span></td>
            <td class="text-center">${dup.status !== 'pago' && dup.status !== 'aguardando_confirmacao' ? `<button class="btn btn-sm btn-success" onclick="solicitarPagamentoAdminModal(${dup.id}, '${cpf}')"><i class="bi bi-credit-card"></i> Solicitar Pagamento</button>` : dup.status === 'aguardando_confirmacao' ? '<span class="text-info">Aguardando confirmação</span>' : '<span class="text-success">✓ Paga</span>'}
            <button class="btn btn-sm btn-warning" onclick="imprimirDuplicata(${dup.id})"><i class="bi bi-printer"></i></button></td></tr>`;
    });
    modalHTML += `</tbody></table></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button></div></div></div></div>`;
    const existing = document.getElementById('modalParcelas'); if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalParcelas'));
    modal.show();
    document.getElementById('modalParcelas').addEventListener('hidden.bs.modal', function() { this.remove(); });
}

function solicitarPagamentoAdminModal(parcelaId, cpf) {
    sessionStorage.setItem('parcelaId', parcelaId);
    sessionStorage.setItem('clienteCpf', cpf);
    window.location.href = 'pagamento.html';
}

function excluirCliente(cpf) {
    if (confirm('Tem certeza que deseja excluir TODAS as parcelas deste cliente?')) {
        duplicatas = duplicatas.filter(d => d.devedor.cpf !== cpf);
        localStorage.setItem('duplicatas', JSON.stringify(duplicatas));
        carregarTabelaClientes(); 
        atualizarEstatisticas();
        alert('Cliente excluído com sucesso!');
    }
}

// ===== FUNÇÕES FRANKSCORE (CLIENTE) =====
function consultarScore() {
    const cpf = document.getElementById('cpfConsulta').value.replace(/\D/g, '');
    if (!cpf || cpf.length < 11) { 
        alert('Digite um CPF válido com 11 números'); 
        return; 
    }
    const cliente = duplicatas.find(d => d.devedor.cpf === cpf);
    if (!cliente && !pontuacoes[cpf]) { 
        document.getElementById('erroConsulta').style.display = 'block'; 
        document.getElementById('resultadoScore').style.display = 'none'; 
        return; 
    }
    document.getElementById('erroConsulta').style.display = 'none';
    document.getElementById('resultadoScore').style.display = 'block';
    
    const nome = cliente ? cliente.devedor.nome : 'Cliente Frank Motos';
    const primeiroNome = getPrimeiroNome(nome);
    const pontos = pontuacoes[cpf] ? pontuacoes[cpf].pontos : 0;
    const nivel = getNivelScore(pontos);
    const porcentagem = calcularPorcentagemScore(pontos);
    
    document.getElementById('saudacaoCliente').innerHTML = `<h4><i class="bi bi-person-circle"></i> Olá, ${primeiroNome}!</h4><p id="cpfCliente">${formatarCPF(cpf)}</p>`;
    document.getElementById('pontuacaoAtual').innerHTML = pontos;
    document.getElementById('barraProgresso').style.width = `${porcentagem}%`;
    document.getElementById('barraProgresso').innerHTML = `${Math.floor(porcentagem)}%`;
    document.getElementById('nivelCliente').innerHTML = `${nivel.icone} ${nivel.nome}`;
    document.getElementById('badgeNivel').innerHTML = `<span class="badge-nivel ${nivel.cor}">${nivel.nome}</span>`;
    document.getElementById('mensagemNivel').innerHTML = nivel.descricao;
    
    const parcelasCliente = duplicatas.filter(d => d.devedor.cpf === cpf);
    const tbodyParcelas = document.getElementById('tabelaParcelasCliente');
    tbodyParcelas.innerHTML = '';
    let temPendente = false;
    if (parcelasCliente.length === 0) { 
        tbodyParcelas.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma parcela encontrada</td></tr>'; 
    } else {
        parcelasCliente.sort((a,b) => a.parcela - b.parcela).forEach(p => {
            let statusClass = '', statusText = '';
            if (p.status === 'pago') { statusClass = 'status-pago'; statusText = 'PAGA'; }
            else if (p.status === 'aguardando_confirmacao') { statusClass = 'status-aguardando'; statusText = 'AGUARDANDO CONFIRMAÇÃO'; }
            else { statusClass = 'status-pendente'; statusText = 'PENDENTE'; temPendente = true; }
            const row = tbodyParcelas.insertRow();
            row.innerHTML = `
                <td class="text-center">${p.parcela}ª / ${p.totalParcelas}</td>
                <td class="text-center">R$ ${parseFloat(p.valor).toFixed(2)}</td>
                <td class="text-center">${formatarDataBR(p.vencimento)}</td>
                <td class="text-center"><span class="${statusClass}">${statusText}</span></td>
                <td class="text-center">${p.status === 'pendente' ? `<button class="btn btn-sm btn-success" onclick="irParaPagamento('${cpf}', ${p.id})">Pagar</button>` : (p.status === 'aguardando_confirmacao' ? '<span class="text-info">⏳ Aguardando</span>' : '<span class="text-success">✓ Pago</span>')}</td>
            `;
        });
    }
    document.getElementById('btnPagar').style.display = temPendente ? 'block' : 'none';
    
    const tbodyHistorico = document.getElementById('tabelaHistorico');
    if (tbodyHistorico) {
        tbodyHistorico.innerHTML = '';
        const historico = pontuacoes[cpf] ? pontuacoes[cpf].historico : [];
        historico.forEach(h => {
            const row = tbodyHistorico.insertRow();
            const pontosClass = h.pontos > 0 ? 'text-success' : 'text-danger';
            row.innerHTML = `<td>${h.data}</td><td class="${pontosClass} fw-bold">${h.pontos > 0 ? '+' + h.pontos : h.pontos}</td><td>${h.motivo}</td>`;
        });
        if (historico.length === 0) tbodyHistorico.innerHTML = '缘<td colspan="3" class="text-center">Nenhum histórico disponível</td>';
    }
    
    sessionStorage.setItem('clienteCpf', cpf);
    
    const notificacoesNaoLidas = notificacoes.filter(n => n.cpf === cpf && !n.lida);
    notificacoesNaoLidas.forEach(n => {
        adicionarNotificacao(cpf, nome, n.titulo, n.mensagem, n.tipo);
        n.lida = true;
    });
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
}

function irParaPagamento(cpf, parcelaId) {
    if (cpf) { 
        sessionStorage.setItem('clienteCpf', cpf); 
        sessionStorage.setItem('parcelaId', parcelaId); 
    }
    window.location.href = 'pagamento.html';
}

function copiarChavePix() {
    const chave = document.getElementById('chavePixDisplay').innerText;
    navigator.clipboard.writeText(chave).then(() => alert('✅ Chave PIX copiada!\nCNPJ: ' + chave + '\n\n⚠️ Confirme os dados antes de pagar!'));
}

function voltar() { 
    window.location.href = 'frankscore.html'; 
}

// ===== FUNÇÕES ADMIN (PONTOS) =====
function adicionarPontosAdmin(pontos, motivo) {
    const select = document.getElementById('selectClienteScore');
    const cpf = select.value;
    if (!cpf) { 
        alert('Selecione um cliente primeiro!'); 
        return; 
    }
    const novosPontos = adicionarPontos(cpf, pontos, motivo);
    const cliente = duplicatas.find(d => d.devedor.cpf === cpf);
    adicionarNotificacao(cpf, cliente?.devedor.nome || 'Cliente', 'Pontos Adicionados!', 
        `Você ganhou +${pontos} pontos! Motivo: ${motivo}. Seu score agora é ${novosPontos} pontos.`, 'success');
    alert(`✅ +${pontos} pontos adicionados! Cliente notificado.`);
    carregarSelectClientes();
    atualizarExibicaoScore(cpf);
}

function removerPontosAdmin(pontos, motivo) {
    const select = document.getElementById('selectClienteScore');
    const cpf = select.value;
    if (!cpf) { 
        alert('Selecione um cliente primeiro!'); 
        return; 
    }
    const novosPontos = removerPontos(cpf, pontos, motivo);
    const cliente = duplicatas.find(d => d.devedor.cpf === cpf);
    adicionarNotificacao(cpf, cliente?.devedor.nome || 'Cliente', 'Pontos Removidos', 
        `Foram removidos ${pontos} pontos. Motivo: ${motivo}. Seu score agora é ${novosPontos} pontos.`, 'danger');
    alert(`⚠️ -${pontos} pontos removidos! Cliente notificado.`);
    carregarSelectClientes();
    atualizarExibicaoScore(cpf);
}

function aplicarDescontoGoogle(percentual) {
    const select = document.getElementById('selectClienteScore');
    const cpf = select.value;
    if (!cpf) { 
        alert('Selecione um cliente primeiro!'); 
        return; 
    }
    const novosPontos = adicionarPontos(cpf, 20, 'Avaliação no Google');
    const cliente = duplicatas.find(d => d.devedor.cpf === cpf);
    adicionarNotificacao(cpf, cliente?.devedor.nome || 'Cliente', 'Avaliação no Google!', 
        `Você avaliou a Frank Motos no Google! Ganhou +20 pontos e ${percentual}% de desconto na próxima compra!`, 'success');
    alert(`🎉 Cliente ganhou +20 pontos e ${percentual}% de desconto!`);
    carregarSelectClientes();
}

function carregarSelectClientes() {
    const select = document.getElementById('selectClienteScore');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    const clientesMap = new Map();
    duplicatas.forEach(dup => { 
        const cpf = dup.devedor.cpf; 
        if (!clientesMap.has(cpf)) clientesMap.set(cpf, { nome: dup.devedor.nome, cpf: cpf }); 
    });
    for (const [cpf, cliente] of clientesMap) {
        const pontos = pontuacoes[cpf] ? pontuacoes[cpf].pontos : 0;
        select.innerHTML += `<option value="${cpf}">${cliente.nome} - ${formatarCPF(cpf)} (${pontos} pts)</option>`;
    }
    select.addEventListener('change', function() { 
        if (this.value) atualizarExibicaoScore(this.value); 
    });
}

function atualizarExibicaoScore(cpf) {
    const pontuacaoSpan = document.getElementById('pontuacaoAtualAdmin');
    const barra = document.getElementById('barraProgressoAdmin');
    const nivelSpan = document.getElementById('nivelAdmin');
    if (pontuacaoSpan && barra && nivelSpan) {
        const pontos = pontuacoes[cpf] ? pontuacoes[cpf].pontos : 0;
        const nivel = getNivelScore(pontos);
        const porcentagem = calcularPorcentagemScore(pontos);
        pontuacaoSpan.innerText = pontos;
        barra.style.width = `${porcentagem}%`;
        barra.innerHTML = `${Math.floor(porcentagem)}%`;
        nivelSpan.innerHTML = `${nivel.icone} ${nivel.nome}`;
    }
}

// ===== FUNÇÃO IMPRIMIR DUPLICATA TOTAL (LAYOUT DA IMAGEM) =====
function imprimirDuplicataTotal(cpf) {
    const parcelas = duplicatas.filter(d => d.devedor.cpf === cpf);
    if (parcelas.length === 0) return;
    const dup = parcelas[0];
    const valorTotal = dup.valorTotal;
    const dataEmissao = formatarDataBR(dup.dataEmissao);
    const numNF = dup.numNF || '________';
    const numDuplicata = dup.numDuplicata || `${dup.parcela}/${dup.totalParcelas}`;
    const vencimentoPrimeira = formatarDataBR(dup.vencimento);
    const valorTotalFormatado = parseFloat(valorTotal).toFixed(2);
    const valorParcelaFormatado = parseFloat(dup.valor).toFixed(2);
    
    // VALIDAÇÃO DE DATA
    const dataVencimento = new Date(dup.vencimento);
    const dataEmissaoDate = new Date(dup.dataEmissao);
    if (dataVencimento < dataEmissaoDate) {
        alert('⚠️ ATENÇÃO: A data de vencimento é anterior à data de emissão!\n\nIsso impede o protesto da duplicata. Corrija as datas antes de prosseguir.');
        return;
    }
    
    const janela = window.open('', '_blank');
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Duplicata de Venda Mercantil - Frank Motos</title>
    <style>
        @page {
            size: A4;
            margin: 1.5cm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11pt;
            background: #fff;
            color: #000;
        }
        .duplicata {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 15px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
        }
        .credor-nome {
            font-weight: bold;
            font-size: 12pt;
        }
        .credor-endereco {
            font-size: 10pt;
        }
        .titulo-duplicata {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin: 10px 0;
            letter-spacing: 2px;
        }
        .cnpj {
            text-align: center;
            font-size: 10pt;
            margin-bottom: 15px;
        }
        .tabela-principal {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10pt;
        }
        .tabela-principal th, .tabela-principal td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        .tabela-principal th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .descontos {
            margin-bottom: 15px;
            font-size: 10pt;
        }
        .sacado {
            margin-bottom: 15px;
        }
        .sacado-label {
            font-weight: bold;
        }
        .tabela-endereco {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10pt;
        }
        .tabela-endereco td {
            border: 1px solid #000;
            padding: 5px;
        }
        .reconhecimento {
            margin: 20px 0;
            text-align: justify;
            font-size: 10pt;
            line-height: 1.4;
        }
        .aceite {
            margin-top: 30px;
            text-align: center;
        }
        .linha-assinatura {
            border-bottom: 1px solid #000;
            width: 60%;
            margin: 10px auto;
            height: 30px;
        }
        .data-aceite {
            font-size: 10pt;
        }
        .no-print {
            text-align: center;
            margin-top: 20px;
        }
        .no-print button {
            padding: 8px 20px;
            margin: 0 5px;
            cursor: pointer;
            background: #ffc107;
            border: none;
            border-radius: 5px;
            font-weight: bold;
        }
        @media print {
            .no-print {
                display: none;
            }
            .duplicata {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="duplicata">
        <div class="header">
            <div class="credor-nome">${configCredor.nome.toUpperCase()} - ${configCredor.fantasia}</div>
            <div class="credor-endereco">${configCredor.endereco}</div>
            <div class="credor-endereco">${configCredor.bairro.toUpperCase()}–${configCredor.cidade.toUpperCase()}–${configCredor.uf}</div>
            <div class="credor-endereco">CEP ${configCredor.cep}</div>
        </div>
        
        <div class="titulo-duplicata">DUPLICATA</div>
        <div class="cnpj">C.N.P.J ${configCredor.cnpj}</div>
        
        <table class="tabela-principal">
            <thead>
                <tr><th>Nota Fiscal</th>
                    <th>Data de Emissão</th>
                    <th>Duplicata</th>
                    <th>Valor R$:</th>
                    <th>Vencimento</th>
                    <th>Para uso da Instituição Financeira</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>${numNF}</td>
                    <td>${dataEmissao}</td>
                    <td>${numDuplicata}</td>
                    <td>${valorTotalFormatado}</td>
                    <td>${vencimentoPrimeira}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        
        <div class="descontos">
            Descontos de ______ % sobre ______ Até ______ Condições Especiais __________________
        </div>
        
        <div class="sacado">
            <div><span class="sacado-label">Nome do Sacado:</span> ${dup.devedor.nome.toUpperCase()}</div>
            <div><span class="sacado-label">Endereço de Cobrança</span></div>
            <div>${dup.devedor.rua.toUpperCase()}, ${dup.devedor.numero} - ${dup.devedor.bairro.toUpperCase()}</div>
        </div>
        
        <table class="tabela-endereco">
            <tr>
                <td><strong>Cidade</strong></td>
                <td><strong>Estado</strong></td>
                <td><strong>CEP</strong></td>
                <td><strong>Telefone</strong></td>
                <td><strong>Pagamento</strong></td>
            </tr>
            <tr>
                <td>${dup.devedor.cidade.toUpperCase()}</td>
                <td>${dup.devedor.estado.toUpperCase()}</td>
                <td>${dup.devedor.cep || '________'}</td>
                <td>${configCredor.contato}</td>
                <td>${dup.devedor.cidade.toUpperCase()} ${dup.devedor.estado.toUpperCase()}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>CNPJ/CPF</strong><br>${formatarCPF(dup.devedor.cpf)}</td>
                <td colspan="3"><strong>Inscrição Estadual</strong><br>Isento</td>
            </tr>
        </table>
        
        <div class="reconhecimento">
            Reconhecemos a exatidão desta DUPLICATA DE VENDA MERCANTIL/PRESTAÇÃO DE SERVIÇOS na importância acima que pagaremos à ${configCredor.nome.toUpperCase()} ou à sua ordem na praça e vencimentos acima indicados.
        </div>
        
        <div class="aceite">
            <div>Em ______ / ______ / ______</div>
            <div class="linha-assinatura"></div>
            <div class="data-aceite">Data do Aceite &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Assinatura do Sacado</div>
        </div>
        
        <div class="no-print">
            <button onclick="window.print()">🖨️ IMPRIMIR</button>
            <button onclick="window.close()">❌ FECHAR</button>
        </div>
    </div>
</body>
</html>`);
    janela.document.close();
}

// ===== FUNÇÃO IMPRIMIR CONTRATO TOTAL =====
function imprimirContratoTotal(cpf) {
    const parcelas = duplicatas.filter(d => d.devedor.cpf === cpf);
    if (parcelas.length === 0) return;
    const dup = parcelas[0];
    const valorTotal = dup.valorTotal;
    const totalParcelas = dup.totalParcelas;
    const valorParcela = dup.valor;
    const numNF = dup.numNF || '______';
    const numDuplicata = dup.numDuplicata || `${dup.parcela}/${dup.totalParcelas}`;
    
    const dataAtual = new Date();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const dataExtenso = `${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}`;
    
    const janela = window.open('', '_blank');
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Contrato de Prestação de Serviços - Frank Motos</title>
    <style>
        @page { size: A4; margin: 2.5cm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; background: #fff; }
        .container { max-width: 100%; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ffc107; padding-bottom: 15px; }
        .titulo-principal { font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .subtitulo { font-size: 12pt; color: #555; margin-top: 5px; }
        .numero-contrato { text-align: right; font-size: 10pt; margin-bottom: 20px; color: #666; }
        .partes { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid #ffc107; padding: 15px; margin-bottom: 25px; border-radius: 8px; }
        .partes h3 { font-size: 13pt; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .partes p { margin-bottom: 8px; }
        .clausula { margin-bottom: 18px; text-align: justify; }
        .clausula-titulo { font-weight: bold; text-transform: uppercase; font-size: 11pt; margin-bottom: 8px; background: #fff8e1; padding: 5px 8px; border-left: 4px solid #ffc107; }
        .valor-destaque { background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%); padding: 15px; text-align: center; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .valor-destaque .label { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .valor-destaque .valor { font-size: 24pt; font-weight: bold; margin: 5px 0; }
        .valor-destaque .parcelas { font-size: 14pt; font-weight: bold; }
        .valor-destaque .extenso { font-size: 10pt; font-style: italic; margin-top: 8px; opacity: 0.9; }
        .multa-destaque { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 12px; text-align: center; margin: 20px 0; font-weight: bold; color: #856404; }
        .info-adicional { background: #f0f7ff; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 8px; font-size: 10pt; }
        .assinaturas { display: flex; justify-content: space-between; margin-top: 50px; gap: 50px; }
        .assinatura { flex: 1; text-align: center; }
        .linha-assinatura { border-bottom: 1px solid #000; margin: 10px 0; height: 40px; }
        .data-local { text-align: right; margin: 25px 0; font-style: italic; color: #555; }
        .rodape { margin-top: 35px; text-align: center; font-size: 9pt; border-top: 1px solid #ddd; padding-top: 12px; color: #888; }
        .no-print { text-align: center; margin-top: 25px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
        .no-print button { padding: 10px 25px; margin: 0 8px; cursor: pointer; background: #ffc107; border: none; border-radius: 25px; font-weight: bold; transition: all 0.3s; }
        .no-print button:hover { background: #e0a800; transform: scale(1.02); }
        @media print { .no-print { display: none; } .multa-destaque, .valor-destaque, .partes { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="titulo-principal">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
            <div class="subtitulo">FRANK MOTOS - OFICINA ESPECIALIZADA EM MOTOCICLETAS</div>
        </div>
        <div class="numero-contrato">Contrato nº: ${numNF || numDuplicata}/2026</div>
        
        <div class="partes">
            <h3>📋 PARTES CONTRATANTES</h3>
            <p><strong>CONTRATANTE (DEVEDOR):</strong><br>
            ${dup.devedor.nome.toUpperCase()}<br>
            CPF/CNPJ: ${formatarCPF(dup.devedor.cpf)}<br>
            Endereço: ${dup.devedor.rua.toUpperCase()}, nº ${dup.devedor.numero} - ${dup.devedor.bairro.toUpperCase()}<br>
            Cidade: ${dup.devedor.cidade.toUpperCase()} - ${dup.devedor.estado.toUpperCase()}<br>
            CEP: ${dup.devedor.cep || '______'}</p>
            
            <p><strong>CONTRATADA (CREDOR - FRANK MOTOS):</strong><br>
            ${configCredor.nome.toUpperCase()}<br>
            CNPJ: ${configCredor.cnpj}<br>
            Endereço: ${configCredor.endereco} - ${configCredor.bairro}<br>
            ${configCredor.cidade} - ${configCredor.uf} | CEP: ${configCredor.cep}<br>
            Contato: ${configCredor.contato}</p>
        </div>
        
        <div class="valor-destaque">
            <div class="label">💰 VALOR DO CONTRATO</div>
            <div class="valor">R$ ${parseFloat(valorTotal).toFixed(2)}</div>
            <div class="parcelas">${totalParcelas}x de R$ ${parseFloat(valorParcela).toFixed(2)}</div>
            <div class="extenso">${numeroPorExtenso(valorTotal).toUpperCase()}</div>
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA PRIMEIRA - DO OBJETO</div>
            <p>O presente contrato tem como objeto a prestação de serviços de oficina mecânica especializada em motocicletas, incluindo reparos, manutenção preventiva e corretiva, substituição de peças, e demais serviços correlatos, conforme Nota Fiscal nº ${numNF}, emitida em ${formatarDataBR(dup.dataEmissao)}.</p>
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA SEGUNDA - DO PAGAMENTO</div>
            <p>O valor total de R$ ${parseFloat(valorTotal).toFixed(2)} será pago em ${totalParcelas}x de R$ ${parseFloat(valorParcela).toFixed(2)}, com vencimento da primeira parcela em ${formatarDataBR(dup.vencimento)} e as demais nos meses subsequentes. Os pagamentos deverão ser efetuados preferencialmente via PIX, transferência bancária ou em dinheiro.</p>
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA TERCEIRA - DA MORA E PENALIDADES</div>
            <p>Em caso de atraso no pagamento de qualquer parcela, o CONTRATANTE ficará sujeito a:<br>
            a) <strong>MULTA DE 2%</strong> sobre o valor da parcela vencida;<br>
            b) <strong>JUROS DE MORA DE 1% AO MÊS</strong>, calculados proporcionalmente;<br>
            c) <strong>MORA DIÁRIA DE R$ 2,14</strong> por dia de atraso.</p>
        </div>
        
        <div class="multa-destaque">
            ⚠️ APÓS O VENCIMENTO: MULTA DE 2% + JUROS DE 1% AO MÊS + MORA DIÁRIA DE R$ 2,14 ⚠️
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA QUARTA - DA GARANTIA</div>
            <p>A CONTRATADA oferece garantia de 90 (noventa) dias sobre os serviços executados e peças substituídas, contados a partir da data da Nota Fiscal, exceto em casos de mau uso, acidentes ou desgaste natural do veículo.</p>
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA QUINTA - DAS OBRIGAÇÕES</div>
            <p><strong>DO CONTRATANTE:</strong> Efetuar os pagamentos nas datas estipuladas, retirar o veículo no prazo de 5 dias úteis após conclusão dos serviços, apresentar documento e comprovante de pagamento para retirada.<br>
            <strong>DA CONTRATADA:</strong> Executar os serviços com qualidade, utilizar peças de procedência garantida, manter o veículo em local seguro durante o período em sua guarda.</p>
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA SEXTA - DO PROTESTO E INADIMPLÊNCIA</div>
            <p>O não pagamento de qualquer parcela no vencimento implicará no vencimento antecipado de todas as parcelas restantes, podendo a CONTRATADA protestar o título ou inscrever o nome do CONTRATANTE nos órgãos de proteção ao crédito (SPC/SERASA).</p>
        </div>
        
        <div class="clausula">
            <div class="clausula-titulo">CLÁUSULA SÉTIMA - DO FORO</div>
            <p>Fica eleito o foro da comarca de ${configCredor.cidade} - ${configCredor.uf} para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia expressa a qualquer outro.</p>
        </div>
        
        <div class="info-adicional">
            <strong>📌 INFORMAÇÕES IMPORTANTES:</strong><br>
            • As peças substituídas ficarão disponíveis para retirada por até 30 dias.<br>
            • O veículo será entregue mediante comprovante de pagamento e documento com foto.<br>
            • Em caso de dúvidas, entre em contato pelo telefone: ${configCredor.contato}<br>
            • Este contrato tem validade legal como título executivo extrajudicial.
        </div>
        
        <div class="data-local">
            <p>${configCredor.cidade} - ${configCredor.uf}, ${dataExtenso}.</p>
        </div>
        
        <div class="assinaturas">
            <div class="assinatura">
                <div class="linha-assinatura"></div>
                <p><strong>${dup.devedor.nome.toUpperCase()}</strong><br>CONTRATANTE</p>
            </div>
            <div class="assinatura">
                <div class="linha-assinatura"></div>
                <p><strong>FRANK MOTOS</strong><br>${configCredor.nome.toUpperCase()}<br>CONTRATADA</p>
            </div>
        </div>
        
        <div class="rodape">
            <p>Documento emitido eletronicamente - Frank Motos © ${dataAtual.getFullYear()} | Este contrato é regido pelas leis brasileiras</p>
        </div>
        
        <div class="no-print">
            <button onclick="window.print()">🖨️ IMPRIMIR CONTRATO</button>
            <button onclick="window.close()">❌ FECHAR</button>
        </div>
    </div>
</body>
</html>`);
    janela.document.close();
}

function imprimirDuplicata(id) {
    const dup = duplicatas.find(d => d.id === id);
    if (!dup) return;
    
    const janela = window.open('', '_blank');
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Duplicata - Frank Motos</title>
    <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: 'Courier New', Courier, monospace; font-size: 11pt; }
        .duplicata { max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 15px; }
        .header { text-align: center; margin-bottom: 15px; }
        .titulo-duplicata { text-align: center; font-weight: bold; font-size: 14pt; margin: 10px 0; }
        .tabela { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .tabela th, .tabela td { border: 1px solid #000; padding: 5px; text-align: center; }
        .sacado { margin: 15px 0; }
        .reconhecimento { margin: 20px 0; text-align: justify; }
        .assinatura { text-align: center; margin-top: 30px; }
        .linha { border-bottom: 1px solid #000; width: 60%; margin: 10px auto; height: 30px; }
        .no-print { text-align: center; margin-top: 20px; }
        .no-print button { padding: 8px 20px; margin: 0 5px; background: #ffc107; border: none; border-radius: 5px; cursor: pointer; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="duplicata">
        <div class="header">
            <div><strong>${configCredor.nome} - ${configCredor.fantasia}</strong></div>
            <div>${configCredor.endereco} - ${configCredor.bairro}</div>
            <div>${configCredor.cidade} - ${configCredor.uf} | CEP: ${configCredor.cep}</div>
        </div>
        <div class="titulo-duplicata">DUPLICATA</div>
        <div>CNPJ: ${configCredor.cnpj}</div>
        
        <table class="tabela">
            <tr>
                <th>Nota Fiscal</th><th>Data Emissão</th><th>Duplicata</th><th>Valor R$</th><th>Vencimento</th>
            </tr>
            <tr>
                <td>${dup.numNF || '________'}</td>
                <td>${formatarDataBR(dup.dataEmissao)}</td>
                <td>${dup.numDuplicata || `${dup.parcela}/${dup.totalParcelas}`}</td>
                <td>${parseFloat(dup.valor).toFixed(2)}</td>
                <td>${formatarDataBR(dup.vencimento)}</td>
            </tr>
        </table>
        
        <div class="sacado">
            <div><strong>Nome do Sacado:</strong> ${dup.devedor.nome.toUpperCase()}</div>
            <div><strong>Endereço:</strong> ${dup.devedor.rua}, ${dup.devedor.numero} - ${dup.devedor.bairro}</div>
            <div><strong>CPF/CNPJ:</strong> ${formatarCPF(dup.devedor.cpf)}</div>
        </div>
        
        <div class="reconhecimento">
            Reconhecemos a exatidão desta DUPLICATA DE VENDA MERCANTIL/PRESTAÇÃO DE SERVIÇOS na importância acima que pagaremos à ${configCredor.nome} ou à sua ordem na praça e vencimentos acima indicados.
        </div>
        
        <div class="assinatura">
            <div>Em ______ / ______ / ______</div>
            <div class="linha"></div>
            <div>Data do Aceite &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Assinatura do Sacado</div>
        </div>
        
        <div class="no-print">
            <button onclick="window.print()">🖨️ IMPRIMIR</button>
            <button onclick="window.close()">❌ FECHAR</button>
        </div>
    </div>
</body>
</html>`);
    janela.document.close();
}

function carregarChecklistClientes() {
    const tbody = document.getElementById('tabelaChecklist');
    if (!tbody) return;
    tbody.innerHTML = '';
    const clientesMap = new Map();
    duplicatas.forEach(dup => { 
        const cpf = dup.devedor.cpf; 
        if (!clientesMap.has(cpf)) clientesMap.set(cpf, { devedor: dup.devedor, duplicatas: [], dataCadastro: dup.dataEmissao, valorTotal: 0 }); 
        const c = clientesMap.get(cpf); 
        c.duplicatas.push(dup); 
        c.valorTotal += parseFloat(dup.valor); 
    });
    let idx = 1;
    for (const [cpf, cliente] of clientesMap) {
        const pontos = pontuacoes[cpf] ? pontuacoes[cpf].pontos : 0;
        const nivel = getNivelScore(pontos);
        const totalServicos = cliente.duplicatas.length;
        const statusGeral = cliente.duplicatas.every(d => d.status === 'pago') ? '✅ Regular' : '⚠️ Pendente';
        const row = tbody.insertRow();
        row.innerHTML = `<td class="text-center">${idx}</td>
                         <td><strong>${cliente.devedor.nome}</strong></td>
                         <td>${formatarCPF(cpf)}</td>
                         <td class="text-center">${pontos}</td>
                         <td class="text-center"><span class="badge ${nivel.cor.replace('nivel-', 'bg-')}">${nivel.nome}</span></td>
                         <td class="text-center">${formatarDataBR(cliente.dataCadastro)}</td>
                         <td class="text-center">${totalServicos}</td>
                         <td class="text-center">R$ ${cliente.valorTotal.toFixed(2)}</td>
                         <td class="${cliente.duplicatas.every(d => d.status === 'pago') ? 'text-success' : 'text-danger'}">${statusGeral}</td>`;
        idx++;
    }
}

// ===== FUNÇÕES DE BACKUP =====
function escapeXML(t) { 
    if (!t) return ''; 
    return t.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;'); 
}

function getXMLValue(p, t) { 
    const e = p.getElementsByTagName(t)[0]; 
    return e ? e.textContent : ''; 
}

function exportarXML() {
    try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<frank_motos_backup>\n  <data_backup>' + new Date().toLocaleString('pt-BR') + '</data_backup>\n  <versao>3.0</versao>\n  <credor>\n';
        for (let k of ['nome','fantasia','cnpj','ie','ccm','contato','endereco','bairro','cidade','uf','cep']) 
            xml += `    <${k}>${escapeXML(configCredor[k])}</${k}>\n`;
        xml += '  </credor>\n  <duplicatas>\n';
        duplicatas.forEach((d,i) => { 
            xml += `    <duplicata id="${d.id}">\n      <indice>${i+1}</indice>\n      <id_original>${d.idOriginal||d.id}</id_original>\n      <parcela>${d.parcela||1}</parcela>\n      <total_parcelas>${d.totalParcelas||1}</total_parcelas>\n      <data_emissao>${d.dataEmissao}</data_emissao>\n      <num_nf>${escapeXML(d.numNF||'')}</num_nf>\n      <valor>${d.valor}</valor>\n      <valor_total>${d.valorTotal||d.valor}</valor_total>\n      <num_duplicata>${escapeXML(d.numDuplicata||'')}</num_duplicata>\n      <vencimento>${d.vencimento}</vencimento>\n      <status>${d.status}</status>\n      <valor_extenso>${escapeXML(d.valorExtenso||'')}</valor_extenso>\n      <data_pagamento>${d.dataPagamento||''}</data_pagamento>\n      <repm>${d.repm||'30'}</repm>\n      <devedor>\n`;
            for (let k of ['nome','cpf','estado','rua','numero','bairro','cidade','cep','municipio']) 
                xml += `        <${k}>${escapeXML(d.devedor[k]||'')}</${k}>\n`;
            xml += '      </devedor>\n    </duplicata>\n'; 
        });
        xml += '  </duplicatas>\n  <pontuacoes>\n';
        for (let [cpf, data] of Object.entries(pontuacoes)) { 
            xml += `    <cliente cpf="${cpf}"><pontos>${data.pontos}</pontos><historico>\n`; 
            if(data.historico) data.historico.forEach(h=>{ 
                xml += `      <item><data>${h.data}</data><pontos>${h.pontos}</pontos><motivo>${escapeXML(h.motivo)}</motivo></item>\n`; 
            }); 
            xml += `    </historico></cliente>\n`; 
        }
        xml += '  </pontuacoes>\n  <solicitacoes>\n';
        solicitacoesPagamento.forEach(s=>{ 
            xml += `    <solicitacao id="${s.id}"><parcela_id>${s.parcelaId}</parcela_id><cpf>${s.cpf}</cpf><status>${s.status}</status><data>${s.dataSolicitacao}</data></solicitacao>\n`; 
        });
        xml += '  </solicitacoes>\n</frank_motos_backup>';
        const blob = new Blob([xml], {type:'application/xml'}), url=URL.createObjectURL(blob), a=document.createElement('a');
        a.href=url; a.download=`frank_motos_backup_${new Date().toISOString().slice(0,10)}.xml`; a.click(); 
        alert('Backup exportado!');
    } catch(e) { 
        alert('Erro: '+e.message); 
    }
}

function importarXML() {
    const input=document.createElement('input'); 
    input.type='file'; 
    input.accept='.xml';
    input.onchange=e=>{
        const file=e.target.files[0], reader=new FileReader();
        reader.onload=ev=>{
            try{
                const xml=new DOMParser().parseFromString(ev.target.result,'text/xml'), root=xml.documentElement;
                if(root.nodeName!=='frank_motos_backup') throw new Error('Arquivo inválido');
                const credorNode=xml.getElementsByTagName('credor')[0];
                if(credorNode) for(let k of ['nome','fantasia','cnpj','ie','ccm','contato','endereco','bairro','cidade','uf','cep']) 
                    configCredor[k]=getXMLValue(credorNode,k)||configCredor[k];
                const novas=[], nodes=xml.getElementsByTagName('duplicata');
                for(let i=0;i<nodes.length;i++){ 
                    const dup=nodes[i], dev=dup.getElementsByTagName('devedor')[0];
                    if(dev){ 
                        const d={
                            id:parseInt(dup.getAttribute('id'))||Date.now()+i, 
                            idOriginal:parseInt(getXMLValue(dup,'id_original'))||Date.now(), 
                            parcela:parseInt(getXMLValue(dup,'parcela'))||1, 
                            totalParcelas:parseInt(getXMLValue(dup,'total_parcelas'))||1, 
                            dataEmissao:getXMLValue(dup,'data_emissao')||'', 
                            numNF:getXMLValue(dup,'num_nf')||'', 
                            valor:parseFloat(getXMLValue(dup,'valor'))||0, 
                            valorTotal:parseFloat(getXMLValue(dup,'valor_total'))||0, 
                            numDuplicata:getXMLValue(dup,'num_duplicata')||'', 
                            vencimento:getXMLValue(dup,'vencimento')||'', 
                            status:getXMLValue(dup,'status')||'pendente', 
                            valorExtenso:getXMLValue(dup,'valor_extenso')||'', 
                            dataPagamento:getXMLValue(dup,'data_pagamento')||null, 
                            repm:getXMLValue(dup,'repm')||'30', 
                            devedor:{}
                        };
                        for(let k of ['nome','cpf','estado','rua','numero','bairro','cidade','cep','municipio']) 
                            d.devedor[k]=getXMLValue(dev,k)||'';
                        d.devedor.endereco=`${d.devedor.rua}, Nº ${d.devedor.numero} - ${d.devedor.bairro}`;
                        if(!d.valorExtenso&&d.valor) 
                            d.valorExtenso=numeroPorExtenso(d.valor).charAt(0).toUpperCase()+numeroPorExtenso(d.valor).slice(1);
                        if(d.dataEmissao) d.dataExtenso=formatarDataExtenso(d.dataEmissao);
                        d.credor=configCredor; 
                        novas.push(d);
                    }
                }
                if(novas.length){ 
                    duplicatas=novas; 
                    localStorage.setItem('duplicatas',JSON.stringify(duplicatas)); 
                }
                const pontosNodes=xml.getElementsByTagName('cliente');
                const novasPontuacoes = {};
                for(let i=0;i<pontosNodes.length;i++){ 
                    const c=pontosNodes[i]; 
                    const cpf=c.getAttribute('cpf'); 
                    if(cpf){ 
                        const pontos=parseInt(getXMLValue(c,'pontos'))||0; 
                        const historico=[]; 
                        const itens=c.getElementsByTagName('item'); 
                        for(let j=0;j<itens.length;j++){ 
                            historico.push({
                                data:getXMLValue(itens[j],'data'),
                                pontos:parseInt(getXMLValue(itens[j],'pontos')),
                                motivo:getXMLValue(itens[j],'motivo'),
                                totalAtual:0
                            }); 
                        } 
                        novasPontuacoes[cpf]={pontos:pontos,historico:historico}; 
                    } 
                }
                pontuacoes = novasPontuacoes;
                const solicitacoesNodes=xml.getElementsByTagName('solicitacao');
                const novasSolicitacoes = [];
                for(let i=0;i<solicitacoesNodes.length;i++){ 
                    const s=solicitacoesNodes[i]; 
                    novasSolicitacoes.push({
                        id:parseInt(getXMLValue(s,'id')),
                        parcelaId:parseInt(getXMLValue(s,'parcela_id')),
                        cpf:getXMLValue(s,'cpf'),
                        status:getXMLValue(s,'status'),
                        dataSolicitacao:getXMLValue(s,'data')
                    }); 
                }
                solicitacoesPagamento = novasSolicitacoes;
                localStorage.setItem('duplicatas',JSON.stringify(duplicatas));
                localStorage.setItem('configCredor',JSON.stringify(configCredor));
                localStorage.setItem('pontuacoes',JSON.stringify(pontuacoes));
                localStorage.setItem('solicitacoesPagamento',JSON.stringify(solicitacoesPagamento));
                carregarTabelaClientes(); 
                atualizarEstatisticas(); 
                carregarConfigAdmin(); 
                carregarSelectClientes(); 
                carregarSolicitacoesAdmin();
                alert(`Importado! ${novas.length} parcelas.`);
            }catch(e){ 
                alert('Erro: '+e.message); 
            }
        }; 
        reader.readAsText(file);
    }; 
    input.click();
}

function exportarDados(){ 
    exportarXML(); 
}

function importarDados(){ 
    importarXML(); 
}

function atualizarEstatisticas(){
    const t=document.getElementById('totalDuplicatas'), 
          p=document.getElementById('totalPagas'), 
          pe=document.getElementById('totalPendentes'), 
          a=document.getElementById('totalAguardando'), 
          v=document.getElementById('valorTotal');
    if(t){ 
        t.textContent=duplicatas.length; 
        p.textContent=duplicatas.filter(d=>d.status==='pago').length; 
        pe.textContent=duplicatas.filter(d=>d.status==='pendente').length; 
        if(a) a.textContent=duplicatas.filter(d=>d.status==='aguardando_confirmacao').length;
        v.textContent=`R$ ${duplicatas.reduce((a,d)=>a+parseFloat(d.valor),0).toFixed(2)}`; 
    }
}

function limparTodosDados(){
    if(confirm('ATENÇÃO! Apagar TODOS os dados?')){ 
        localStorage.clear(); 
        duplicatas=[]; 
        pontuacoes={}; 
        solicitacoesPagamento=[]; 
        notificacoes=[]; 
        configCredor={
            nome:"FRANKELLEY STEFANO ALVES AZEVEDO",
            fantasia:"FRANK MOTOS",
            cnpj:"33.917.740/0001-46",
            ie:"0000001109367",
            ccm:"11.222-3",
            contato:"(69) 98494-0207",
            endereco:"Av Dr Miguel Vieira Ferreira, 5454",
            bairro:"Cidade Alta",
            cidade:"ROLIM DE MOURA",
            uf:"RO",
            cep:"76940-000"
        }; 
        carregarTabelaClientes(); 
        atualizarEstatisticas(); 
        carregarConfigAdmin(); 
        alert('Dados removidos!'); 
    }
}

function carregarConfigAdmin(){
    const n=document.getElementById('configNomeCredor'); 
    if(n){
        document.getElementById('configNomeCredor').value=configCredor.nome; 
        document.getElementById('configFantasia').value=configCredor.fantasia||'';
        document.getElementById('configCnpj').value=configCredor.cnpj; 
        document.getElementById('configIE').value=configCredor.ie;
        document.getElementById('configCCM').value=configCredor.ccm||'11.222-3'; 
        document.getElementById('configContato').value=configCredor.contato;
        document.getElementById('configEndereco').value=configCredor.endereco; 
        document.getElementById('configBairro').value=configCredor.bairro;
        document.getElementById('configCidade').value=configCredor.cidade; 
        document.getElementById('configUF').value=configCredor.uf;
        document.getElementById('configCep').value=configCredor.cep;
    }
}

document.getElementById('formConfigCredor')?.addEventListener('submit',function(e){ 
    e.preventDefault();
    configCredor={
        nome:document.getElementById('configNomeCredor').value, 
        fantasia:document.getElementById('configFantasia').value, 
        cnpj:document.getElementById('configCnpj').value, 
        ie:document.getElementById('configIE').value, 
        ccm:document.getElementById('configCCM').value, 
        contato:document.getElementById('configContato').value, 
        endereco:document.getElementById('configEndereco').value, 
        bairro:document.getElementById('configBairro').value, 
        cidade:document.getElementById('configCidade').value, 
        uf:document.getElementById('configUF').value, 
        cep:document.getElementById('configCep').value
    };
    localStorage.setItem('configCredor',JSON.stringify(configCredor)); 
    alert('Configurações salvas!');
});

function adicionarCreditosDesenvolvedor(){
    let f=document.querySelector('footer'); 
    if(!f){ 
        f=document.createElement('footer'); 
        f.className='footer mt-5'; 
        document.body.appendChild(f); 
    }
    f.innerHTML='<div class="container text-center"><hr><p class="text-muted"><i class="bi bi-code-slash"></i> Este site foi desenvolvido por <strong>SIPRIANO WEB</strong> em parceria com <strong>FRANK MOTOS</strong></p></div>';
}

function topFunction(){ 
    document.body.scrollTop=0; 
    document.documentElement.scrollTop=0; 
}

document.addEventListener('DOMContentLoaded',function(){
    carregarTabelaClientes(); 
    atualizarEstatisticas(); 
    carregarConfigAdmin(); 
    carregarSelectClientes(); 
    carregarSolicitacoesAdmin();
    if(window.location.pathname.includes('clientes_checklist.html')) 
        carregarChecklistClientes();
    if(window.location.pathname.includes('frankscore.html')){ 
        const nav=document.querySelector('nav'); 
        if(nav) nav.style.display='none'; 
    }
    const data=document.getElementById('dataEmissao'); 
    if(data){ 
        const hoje=new Date().toISOString().slice(0,10); 
        data.value=hoje; 
        data.addEventListener('change',atualizarDataFormatada); 
        atualizarDataFormatada(); 
    }
    const sel=document.getElementById('quantidadeParcelas'); 
    if(sel){ 
        sel.addEventListener('change',toggleParcelas); 
        toggleParcelas(); 
    }
    const val=document.getElementById('valor'); 
    if(val){ 
        val.addEventListener('input',function(){ 
            converterValorPorExtenso(); 
            if(sel&&sel.value!=='1') gerarCamposParcelas(); 
        }); 
    }
    const btn=document.getElementById('btnTopo'); 
    if(btn){ 
        window.onscroll=function(){ 
            btn.style.display=document.body.scrollTop>20||document.documentElement.scrollTop>20?'block':'none'; 
        }; 
    }
    adicionarCreditosDesenvolvedor();
});
