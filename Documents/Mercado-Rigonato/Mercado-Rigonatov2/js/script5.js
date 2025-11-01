// Inicialização de componentes Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carousels
    var carousels = document.querySelectorAll('.carousel');
    carousels.forEach(function(carousel) {
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true
        });
    });
    
    // Efeito de hover nas categorias
    var categoriaImgs = document.querySelectorAll('.categoria-img');
    categoriaImgs.forEach(function(img) {
        img.addEventListener('mouseenter', function() {
            this.style.borderColor = '#007bff';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.borderColor = '#f8f9fa';
        });
    });
});