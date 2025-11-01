// js/main.js - Atualizar fallback de imagens

function loadBanners() {
    const banners = getBanners();
    const bannerContainer = document.getElementById('bannerContainer');
    bannerContainer.innerHTML = '';

    if (banners.length === 0) {
        bannerContainer.innerHTML = '<div class="carousel-item active"><img src="img/banner/1.jpg" class="d-block w-100" alt="Banner padrão"></div>';
        return;
    }

    banners.forEach((banner, index) => {
        const bannerItem = document.createElement('div');
        bannerItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        
        if (banner.link) {
            bannerItem.innerHTML = `<a href="${banner.link}"><img src="${banner.image}" class="d-block w-100" alt="${banner.title || 'Banner'}" onerror="this.src='img/banner/1.jpg'"></a>`;
        } else {
            bannerItem.innerHTML = `<img src="${banner.image}" class="d-block w-100" alt="${banner.title || 'Banner'}" onerror="this.src='img/banner/1.jpg'">`;
        }
        
        bannerContainer.appendChild(bannerItem);
    });
}

function loadProducts(category) {
    // ... código anterior ...
    
    productCard.innerHTML = `
        <div class="product-card card h-100 position-relative">
            ${discountBadge}
            <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;" onerror="this.src='img/produtos/sem-imagem.jpg'">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <div class="mt-auto">
                    ${product.originalPrice ? 
                        `<p class="card-text">
                            <span class="text-muted text-decoration-line-through me-2">R$ ${product.originalPrice.toFixed(2)}</span>
                            <span class="fw-bold text-primary">R$ ${product.price.toFixed(2)}</span>
                        </p>` : 
                        `<p class="card-text fw-bold text-primary">R$ ${product.price.toFixed(2)}</p>`
                    }
                    ${weightOptions}
                    <button class="btn btn-primary w-100 mt-2 add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus me-1"></i> Adicionar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // ... resto do código ...
}

// No carrinho, atualizar também:
function updateCartUI() {
    // ... código anterior ...
    
    cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded me-3" onerror="this.src='img/produtos/sem-imagem.jpg'">
        <div class="flex-grow-1">
            <h6 class="mb-0">${item.name}</h6>
            <p class="mb-0 text-muted">R$ ${item.price.toFixed(2)}</p>
        </div>
        <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
            <span class="mx-2">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
            <button class="btn btn-sm btn-outline-danger ms-2 remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // ... resto do código ...
}