// Sistema de Carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Inicialização de componentes Bootstrap e funcionalidades customizadas
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarousels();
    inicializarCategorias();
    inicializarSmoothScroll();
    inicializarCarrinho();
    inicializarHeaderScroll();
    atualizarContadorCarrinho();
});

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

function inicializarCarrinho() {
    var botoesAdicionar = document.querySelectorAll('.btn-primary');
    botoesAdicionar.forEach(function(botao) {
        if (botao.textContent.includes('Adicionar')) {
            botao.addEventListener('click', function() {
                var card = this.closest('.produto-card');
                var produto = {
                    id: Date.now(),
                    nome: card.querySelector('.card-title').textContent,
                    preco: card.querySelector('.preco').textContent,
                    descricao: card.querySelector('.card-text')?.textContent || '',
                    quantidade: 1
                };
                
                adicionarAoCarrinho(produto, this);
            });
        }
    });
}

function adicionarAoCarrinho(produto, botao) {
    // Verificar se o produto já está no carrinho
    const produtoExistente = carrinho.find(item => item.nome === produto.nome);
    
    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push(produto);
    }
    
    // Salvar no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Animação de confirmação
    botao.textContent = 'Adicionado!';
    botao.classList.remove('btn-primary');
    botao.classList.add('btn-success');
    
    setTimeout(() => {
        botao.textContent = 'Adicionar';
        botao.classList.remove('btn-success');
        botao.classList.add('btn-primary');
    }, 2000);
    
    // Atualizar contador
    atualizarContadorCarrinho();
    
    console.log('Carrinho atual:', carrinho);
}

function atualizarContadorCarrinho() {
    let contador = document.getElementById('carrinho-contador');
    if (!contador) {
        // Criar contador se não existir
        const navbar = document.querySelector('.navbar-nav');
        const carrinhoItem = document.createElement('li');
        carrinhoItem.className = 'nav-item';
        carrinhoItem.innerHTML = `
            <a class="nav-link position-relative" href="#" id="carrinho-link">
                🛒 Carrinho
                <span id="carrinho-contador" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    ${carrinho.reduce((total, item) => total + item.quantidade, 0)}
                </span>
            </a>
        `;
        navbar.appendChild(carrinhoItem);
        
        // Adicionar evento para mostrar carrinho
        document.getElementById('carrinho-link').addEventListener('click', function(e) {
            e.preventDefault();
            mostrarCarrinho();
        });
    } else {
        contador.textContent = carrinho.reduce((total, item) => total + item.quantidade, 0);
    }
}

function mostrarCarrinho() {
    // Criar modal do carrinho
    const modalHTML = `
        <div class="modal fade" id="carrinhoModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🛒 Meu Carrinho</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${carrinho.length === 0 ? 
                            '<p class="text-center">Seu carrinho está vazio</p>' : 
                            gerarListaCarrinho()
                        }
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continuar Comprando</button>
                        ${carrinho.length > 0 ? 
                            '<button type="button" class="btn btn-primary" onclick="finalizarCompra()">Finalizar Compra</button>' : 
                            ''
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('carrinhoModal'));
    modal.show();
    
    // Remover modal do DOM quando fechar
    document.getElementById('carrinhoModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function gerarListaCarrinho() {
    let total = 0;
    const itensHTML = carrinho.map(item => {
        const precoNumerico = parseFloat(item.preco.replace('R$ ', '').replace(',', '.'));
        total += precoNumerico * item.quantidade;
        
        return `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                    <h6>${item.nome}</h6>
                    <small class="text-muted">${item.descricao}</small>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span class="mx-3">${item.quantidade}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    <span class="ms-3 fw-bold">R$ ${(precoNumerico * item.quantidade).toFixed(2)}</span>
                    <button class="btn btn-sm btn-danger ms-2" onclick="removerDoCarrinho(${item.id})">×</button>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        ${itensHTML}
        <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <h5>Total</h5>
            <h5 class="text-success">R$ ${total.toFixed(2)}</h5>
        </div>
    `;
}

function alterarQuantidade(id, mudanca) {
    const item = carrinho.find(prod => prod.id === id);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) {
            removerDoCarrinho(id);
        } else {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarContadorCarrinho();
            // Recarregar modal se estiver aberto
            if (document.getElementById('carrinhoModal')) {
                mostrarCarrinho();
            }
        }
    }
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(prod => prod.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    // Recarregar modal se estiver aberto
    if (document.getElementById('carrinhoModal')) {
        mostrarCarrinho();
    }
}

function finalizarCompra() {
    alert('Compra finalizada com sucesso! Total: R$ ' + 
          carrinho.reduce((total, item) => {
              const preco = parseFloat(item.preco.replace('R$ ', '').replace(',', '.'));
              return total + (preco * item.quantidade);
          }, 0).toFixed(2));
    
    // Limpar carrinho
    carrinho = [];
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    
    // Fechar modal
    bootstrap.Modal.getInstance(document.getElementById('carrinhoModal')).hide();
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