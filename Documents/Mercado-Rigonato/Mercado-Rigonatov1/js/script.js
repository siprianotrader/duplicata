// Sistema SEM E-COMMERCE - Focado em navegação e informações

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarousels();
    inicializarCategorias();
    inicializarSmoothScroll();
    inicializarHeaderScroll();
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

// Função para WhatsApp (SEM carrinho)
function enviarMensagemWhatsApp() {
    const telefone = "5511999999999"; // Substituir pelo telefone real
    const mensagem = "Olá! Gostaria de mais informações sobre os produtos do Supermercado Rigonato.";
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// Função para ligação
function fazerLigacao() {
    window.location.href = 'tel:+551112345678';
}

// Função para email
function enviarEmail() {
    window.location.href = 'mailto:contato@rigonato.com.br';
}