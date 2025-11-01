// js/database.js - Atualizar os caminhos das imagens

// Initialize data if not exists
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        const defaultProducts = [
            { 
                id: 1, 
                name: "Picanha", 
                category: "acougue", 
                price: 79.90, 
                image: "img/produtos/acougue/picanha.jpg", 
                weightOptions: ["500g-1kg", "1kg-2kg", "2kg-4kg"] 
            },
            { 
                id: 2, 
                name: "Alcatra", 
                category: "acougue", 
                price: 49.90, 
                image: "img/produtos/acougue/alcatra.jpg", 
                weightOptions: ["500g-1kg", "1kg-2kg", "2kg-4kg"] 
            },
            { 
                id: 3, 
                name: "Pão Francês", 
                category: "padaria", 
                price: 0.80, 
                image: "img/produtos/padaria/pao-frances.jpg" 
            },
            { 
                id: 4, 
                name: "Tomate", 
                category: "hortifruti", 
                price: 6.90, 
                image: "img/produtos/hortifruti/tomate.jpg", 
                weightOptions: ["100g", "200g", "500g", "1kg"] 
            },
            { 
                id: 5, 
                name: "Arroz 5kg", 
                category: "mercado", 
                price: 24.90, 
                image: "img/produtos/mercado/arroz.jpg" 
            },
            { 
                id: 6, 
                name: "Café 500g", 
                category: "promocao", 
                price: 12.90, 
                originalPrice: 16.90, 
                image: "img/produtos/promocao/cafe.jpg" 
            }
        ];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    }

    if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
        const defaultBanners = [
            { 
                id: 1, 
                image: "img/banner/1.jpg", 
                title: "Ofertas da Semana", 
                link: "#promotions" 
            },
            { 
                id: 2, 
                image: "img/banner/2.jpg", 
                title: "Carnes Frescas", 
                link: "#categories" 
            },
            { 
                id: 3, 
                image: "img/banner/3.jpg", 
                title: "Hortifruti", 
                link: "#categories" 
            },
            { 
                id: 4, 
                image: "img/banner/4.jpg", 
                title: "Mercado Rigonato", 
                link: "#home" 
            }
        ];
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(defaultBanners));
    }

    // ... resto do código permanece igual
}