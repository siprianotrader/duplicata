// Sistema de Gerenciamento de Produtos
const produtos = [
    // Padaria
    { id: 1, nome: "Pão Francês", preco: 0.50, categoria: "padaria", descricao: "Fresquinho todos os dias", imagem: "🥖", promocao: true, precoOriginal: 0.60 },
    { id: 2, nome: "Pão de Forma", preco: 8.90, categoria: "padaria", descricao: "Integral e tradicional", imagem: "🍞" },
    { id: 3, nome: "Croissant", preco: 4.50, categoria: "padaria", descricao: "Recheado com chocolate", imagem: "🥐" },
    { id: 4, nome: "Bolo Caseiro", preco: 12.90, categoria: "padaria", descricao: "Vários sabores", imagem: "🎂" },
    
    // Açougue
    { id: 5, nome: "Picanha", preco: 79.90, categoria: "acougue", descricao: "Corte especial", imagem: "🥩" },
    { id: 6, nome: "Frango", preco: 15.90, categoria: "acougue", descricao: "Cortes selecionados", imagem: "🍗" },
    { id: 7, nome: "Bacon", preco: 22.90, categoria: "acougue", descricao: "Em fatias", imagem: "🥓" },
    { id: 8, nome: "Linguiça", preco: 18.90, categoria: "acougue", descricao: "Caseira especial", imagem: "🌭" },
    
    // Hortifruti
    { id: 9, nome: "Maçã", preco: 5.90, categoria: "hortifruti", descricao: "Maçã gala fresca", imagem: "🍎", promocao: true, precoOriginal: 6.50 },
    { id: 10, nome: "Banana", preco: 3.90, categoria: "hortifruti", descricao: "Banana nanica", imagem: "🍌" },
    { id: 11, nome: "Cenoura", preco: 3.50, categoria: "hortifruti", descricao: "Fresca e crocante", imagem: "🥕" },
    { id: 12, nome: "Alface", preco: 2.90, categoria: "hortifruti", descricao: "Alface crespa", imagem: "🥬" },
    
    // Mercado
    { id: 13, nome: "Arroz", preco: 22.90, categoria: "mercado", descricao: "Tipo 1 5kg", imagem: "🍚" },
    { id: 14, nome: "Feijão", preco: 8.90, categoria: "mercado", descricao: "Carioca 1kg", imagem: "🥫" },
    { id: 15, nome: "Óleo", preco: 7.90, categoria: "mercado", descricao: "Soja 900ml", imagem: "🫒" },
    { id: 16, nome: "Açúcar", preco: 4.50, categoria: "mercado", descricao: "Cristal 1kg", imagem: "🍚" },
    
    // Bebidas
    { id: 17, nome: "Coca-Cola", preco: 8.90, categoria: "bebidas", descricao: "2L", imagem: "🥤" },
    { id: 18, nome: "Suco", preco: 6.90, categoria: "bebidas", descricao: "Laranja 1L", imagem: "🧃" },
    { id: 19, nome: "Cerveja", preco: 3.90, categoria: "bebidas", descricao: "Lata 350ml", imagem: "🍺" },
    { id: 20, nome: "Água", preco: 2.50, categoria: "bebidas", descricao: "Sem gás 500ml", imagem: "💧" },
    
    // Rações
    { id: 21, nome: "Ração Cães", preco: 89.90, categoria: "racoes", descricao: "Adulto 15kg", imagem: "🐕" },
    { id: 22, nome: "Ração Gatos", preco: 65.90, categoria: "racoes", descricao: "Adulto 10kg", imagem: "🐈" },
    { id: 23, nome: "Petisco", preco: 12.90, categoria: "racoes", descricao: "Osso para cães", imagem: "🦴" },
    { id: 24, nome: "Areia", preco: 25.90, categoria: "racoes", descricao: "Higiênica 4kg", imagem: "🐾" },
    
    // Novidades
    { id: 25, nome: "Açaí", preco: 15.90, categoria: "novidades", descricao: "Polpa 500g", imagem: "🟣" },
    { id: 26, nome: "Quinoa", preco: 12.90, categoria: "novidades", descricao: "Grão 500g", imagem: "🌾" },
    { id: 27, nome: "Chia", preco: 8.90, categoria: "novidades", descricao: "Semente 200g", imagem: "💚" },
    { id: 28, nome: "Pasta Amendoim", preco: 18.90, categoria: "novidades", descricao: "Natural 300g", imagem: "🥜" }
];

// Sistema de Usuários
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    {
        id: 1,
        nome: "Cliente Demo",
        email: "demo@rigonato.com",
        senha: "123456",
        telefone: "(11) 99999-9999",
        enderecos: [],
        dataCadastro: new Date().toISOString()
    }
];

// Sistema de Carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
let cupomAtivo = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarousels();
    inicializarCategorias();
    inicializarSmoothScroll();
    inicializarCarrinho();
    inicializarHeaderScroll();
    inicializarBusca();
    atualizarContadorCarrinho();
    verificarUsuarioLogado();
});

// Sistema de Busca
function inicializarBusca() {
    const barraBusca = document.getElementById('barra-busca');
    if (barraBusca) {
        barraBusca.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                realizarBusca();
            }
        });
        
        barraBusca.addEventListener('input', function() {
            if (this.value.length >= 2) {
                buscarProdutosEmTempoReal(this.value);
            }
        });
    }
}

function realizarBusca() {
    const termo = document.getElementById('barra-busca').value.trim();
    if (termo) {
        localStorage.setItem('termoBusca', termo);
        window.location.href = 'paginas/busca.html';
    }
}

function buscarProdutosEmTempoReal(termo) {
    const resultados = produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(termo.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(termo.toLowerCase())
    );
    
    mostrarSugestoesBusca(resultados);
}

function mostrarSugestoesBusca(resultados) {
    let container = document.getElementById('sugestoes-busca');
    if (!container) {
        container = document.createElement('div');
        container.id = 'sugestoes-busca';
        container.className = 'position-absolute w-100 bg-white border mt-1 rounded shadow-lg';
        container.style.zIndex = '1000';
        document.querySelector('.input-group').appendChild(container);
    }
    
    if (resultados.length === 0) {
        container.innerHTML = '<div class="p-3 text-muted">Nenhum produto encontrado</div>';
        return;
    }
    
    container.innerHTML = resultados.slice(0, 5).map(produto => `
        <div class="p-3 border-bottom hover-bg" 
             onclick="selecionarSugestao('${produto.nome}')"
             style="cursor: pointer;">
            <div class="d-flex align-items-center">
                <span class="me-3 fs-5">${produto.imagem}</span>
                <div>
                    <strong>${produto.nome}</strong>
                    <div class="text-muted small">${produto.descricao}</div>
                    <div class="text-success">R$ ${produto.preco.toFixed(2)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function selecionarSugestao(nomeProduto) {
    document.getElementById('barra-busca').value = nomeProduto;
    const sugestoes = document.getElementById('sugestoes-busca');
    if (sugestoes) sugestoes.remove();
    realizarBusca();
}

// Sistema de Carrinho - CORRIGIDO
function adicionarAoCarrinho(idProduto) {
    const produto = produtos.find(p => p.id === idProduto);
    if (!produto) {
        console.error('Produto não encontrado:', idProduto);
        return;
    }
    
    const produtoExistente = carrinho.find(item => item.id === produto.id);
    
    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    
    // Feedback visual
    const botao = event.target;
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = '✓ Adicionado';
    botao.classList.remove('btn-primary');
    botao.classList.add('btn-success');
    
    setTimeout(() => {
        botao.innerHTML = textoOriginal;
        botao.classList.remove('btn-success');
        botao.classList.add('btn-primary');
    }, 2000);
    
    // Mostrar notificação
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
}

function removerDoCarrinho(idProduto) {
    carrinho = carrinho.filter(item => item.id !== idProduto);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    if (window.location.pathname.includes('carrinho.html')) {
        carregarCarrinho();
    }
}

function alterarQuantidade(idProduto, mudanca) {
    const item = carrinho.find(item => item.id === idProduto);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) {
            removerDoCarrinho(idProduto);
        } else {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarContadorCarrinho();
            if (window.location.pathname.includes('carrinho.html')) {
                carregarCarrinho();
            }
        }
    }
}

function atualizarContadorCarrinho() {
    const contadores = document.querySelectorAll('#carrinho-contador');
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    contadores.forEach(contador => {
        contador.textContent = totalItens;
        contador.style.display = totalItens > 0 ? 'block' : 'none';
    });
}

function calcularTotalCarrinho() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function mostrarNotificacao(mensagem) {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'position-fixed top-0 end-0 m-3 p-3 bg-success text-white rounded shadow-lg';
    notificacao.style.zIndex = '1060';
    notificacao.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="me-2">✅</span>
            <span>${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}

// Sistema de Cupons
const cupons = {
    'RIGONATO10': 10,
    'PRIMEIRACOMPRA': 15,
    'SUPER20': 20
};

function aplicarCupom() {
    const codigoInput = document.getElementById('codigo-cupom') || document.getElementById('codigo-cupom-checkout');
    if (!codigoInput) return;
    
    const codigo = codigoInput.value.toUpperCase();
    if (cupons[codigo]) {
        cupomAtivo = { codigo, desconto: cupons[codigo] };
        mostrarNotificacao(`Cupom aplicado! ${cupons[codigo]}% de desconto`);
        if (window.location.pathname.includes('carrinho.html')) {
            carregarCarrinho();
        }
        if (window.location.pathname.includes('checkout.html')) {
            carregarResumoCheckout();
        }
    } else {
        mostrarNotificacao('Cupom inválido');
    }
}

function calcularDesconto(total) {
    if (cupomAtivo) {
        const desconto = (total * cupomAtivo.desconto) / 100;
        return { desconto, totalComDesconto: total - desconto };
    }
    return { desconto: 0, totalComDesconto: total };
}

// Sistema de Usuários - MELHORADO
function verificarUsuarioLogado() {
    if (usuarioLogado) {
        const linksConta = document.querySelectorAll('a[href="paginas/minhaconta.html"]');
        linksConta.forEach(link => {
            link.innerHTML = `👤 ${usuarioLogado.nome.split(' ')[0]}`;
        });
    }
}

function fazerLogin(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        usuarioLogado = usuario;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        mostrarNotificacao('Login realizado com sucesso!');
        
        // Fechar modal se existir
        const modalLogin = document.getElementById('modalLogin');
        if (modalLogin) {
            const modal = bootstrap.Modal.getInstance(modalLogin);
            if (modal) modal.hide();
        }
        
        setTimeout(() => {
            window.location.href = 'paginas/minhaconta.html';
        }, 1000);
    } else {
        mostrarNotificacao('Email ou senha incorretos!');
    }
}

function fazerCadastro(event) {
    if (event) event.preventDefault();
    
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
    const telefone = document.getElementById('cadastro-telefone').value;
    
    // Verificar se usuário já existe
    const usuarioExistente = usuarios.find(u => u.email === email);
    if (usuarioExistente) {
        mostrarNotificacao('Este email já está cadastrado!');
        return;
    }
    
    // Criar novo usuário
    const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha,
        telefone,
        enderecos: [],
        dataCadastro: new Date().toISOString()
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Logar automaticamente
    usuarioLogado = novoUsuario;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    
    mostrarNotificacao('Cadastro realizado com sucesso!');
    
    // Fechar modal se existir
    const modalCadastro = document.getElementById('modalCadastro');
    if (modalCadastro) {
        const modal = bootstrap.Modal.getInstance(modalCadastro);
        if (modal) modal.hide();
    }
    
    setTimeout(() => {
        window.location.href = 'paginas/minhaconta.html';
    }, 1000);
}

function fazerLogout() {
    usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
    mostrarNotificacao('Logout realizado com sucesso!');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
}

// Sistema de Pedidos - MELHORADO
function finalizarPedido() {
    if (carrinho.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!');
        return;
    }
    
    if (!usuarioLogado) {
        mostrarNotificacao('Faça login para finalizar o pedido');
        return;
    }
    
    const formaPagamento = document.querySelector('input[name="forma-pagamento"]:checked');
    if (!formaPagamento) {
        mostrarNotificacao('Selecione uma forma de pagamento!');
        return;
    }
    
    const total = calcularTotalCarrinho();
    const { desconto, totalComDesconto } = calcularDesconto(total);
    const taxaEntrega = document.getElementById('retirada-loja')?.checked ? 0 : 5.00;
    
    const pedido = {
        id: 'P' + Date.now(),
        data: new Date().toISOString(),
        itens: [...carrinho],
        total: totalComDesconto + taxaEntrega,
        desconto: desconto,
        taxaEntrega: taxaEntrega,
        formaPagamento: formaPagamento.value,
        status: 'confirmado',
        usuario: usuarioLogado,
        enderecoEntrega: obterEnderecoEntrega()
    };
    
    // Salvar pedido
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Limpar carrinho
    carrinho = [];
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    cupomAtivo = null;
    
    mostrarNotificacao('Pedido realizado com sucesso!');
    setTimeout(() => {
        window.location.href = 'paginas/pedidos.html';
    }, 2000);
}

function obterEnderecoEntrega() {
    // Simulação - em um sistema real, isso viria do formulário
    return {
        rua: "Rua Exemplo",
        numero: "123",
        complemento: "Apto 45",
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01234-567"
    };
}

// Funções de utilidade
function inicializarCarousels() {
    var carousels = document.querySelectorAll('.carousel');
    carousels.forEach(function(carousel) {
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true,
            pause: 'hover'
        });
    });
}

function inicializarCategorias() {
    var categoriaItems = document.querySelectorAll('.categoria-item');
    categoriaItems.forEach(function(item) {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function inicializarSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function inicializarHeaderScroll() {
    window.addEventListener('scroll', function() {
        var header = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '';
            header.style.backdropFilter = '';
        }
    });
}

// WhatsApp
function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!');
        return;
    }
    
    let mensagem = "🛒 *PEDIDO - SUPERMERCADO RIGONATO* 🛒\n\n";
    let total = 0;
    
    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}\n`;
    });
    
    const { desconto, totalComDesconto } = calcularDesconto(total);
    const taxaEntrega = 5.00;
    const totalFinal = totalComDesconto + taxaEntrega;
    
    mensagem += `\n*Subtotal:* R$ ${total.toFixed(2)}`;
    if (desconto > 0) {
        mensagem += `\n*Desconto (${cupomAtivo.desconto}%):* -R$ ${desconto.toFixed(2)}`;
    }
    mensagem += `\n*Taxa de Entrega:* R$ ${taxaEntrega.toFixed(2)}`;
    mensagem += `\n*Total:* R$ ${totalFinal.toFixed(2)}`;
    mensagem += `\n\n💳 *Forma de Pagamento:* A combinar`;
    mensagem += `\n🛵 *Entrega em Domicílio*`;
    mensagem += `\n\n*Dados do Cliente:*`;
    if (usuarioLogado) {
        mensagem += `\nNome: ${usuarioLogado.nome}`;
        mensagem += `\nTelefone: ${usuarioLogado.telefone}`;
    }
    
    const telefone = "5569993959196";
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}