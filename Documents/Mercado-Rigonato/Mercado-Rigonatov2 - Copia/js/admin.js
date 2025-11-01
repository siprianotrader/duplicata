// js/admin.js - Atualizar caminhos no admin

function loadAdminProducts() {
    const products = getProducts();
    const table = document.getElementById('adminProductsTable');
    table.innerHTML = '';
    
    if (products.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" class="product-image" alt="${product.name}" onerror="this.src='img/produtos/sem-imagem.jpg'"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td><span class="badge bg-success">Ativo</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
    
    // ... resto do código ...
}

function loadAdminBanners() {
    const banners = getBanners();
    const container = document.getElementById('adminBannersContainer');
    container.innerHTML = '';
    
    if (banners.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>Nenhum banner cadastrado</p></div>';
        return;
    }
    
    banners.forEach(banner => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-3';
        col.innerHTML = `
            <div class="card">
                <img src="${banner.image}" class="card-img-top" alt="${banner.title || 'Banner'}" style="height: 150px; object-fit: cover;" onerror="this.src='img/banner/1.jpg'">
                <div class="card-body">
                    <h6 class="card-title">${banner.title || 'Sem título'}</h6>
                    <button class="btn btn-sm btn-outline-danger delete-banner" data-id="${banner.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
    
    // ... resto do código ...
}

function saveProductHandler() {
    // ... código anterior ...
    
    // Handle image upload or URL
    let imagePath = imageUrl;
    const imageFile = document.getElementById('productImage').files[0];
    
    if (imageFile) {
        // Para arquivos locais, use a estrutura definida
        imagePath = `img/produtos/${category}/${Date.now()}_${imageFile.name}`;
        alert('Imagem será salva em: ' + imagePath);
    }
    
    if (!imagePath) {
        imagePath = 'img/produtos/sem-imagem.jpg';
    }
    
    // ... resto do código ...
}

function saveBannerHandler() {
    // ... código anterior ...
    
    // Handle image upload or URL
    let imagePath = imageUrl;
    const imageFile = document.getElementById('bannerImage').files[0];
    
    if (imageFile) {
        // Para banners, use a estrutura definida
        const bannerNumber = getBanners().length + 1;
        imagePath = `img/banner/${bannerNumber}.jpg`;
        alert('Banner será salvo em: ' + imagePath);
    }
    
    if (!imagePath) {
        alert('Por favor, forneça uma imagem para o banner.');
        return;
    }
    
    // ... resto do código ...
}