const products = [
  {
    id: 1,
    name: 'Nova Lamp',
    category: 'home',
    rating: 4.8,
    price: 79,
    offerPrice: 59,
    emoji: '💡',
    description: 'Bright light with sculptural form.'
  },
  {
    id: 2,
    name: 'Pulse Headset',
    category: 'tech',
    rating: 4.7,
    price: 129,
    offerPrice: 99,
    emoji: '🎧',
    description: 'Studio sound in a compact shell.'
  },
  {
    id: 3,
    name: 'Storm Jacket',
    category: 'fashion',
    rating: 4.9,
    price: 110,
    offerPrice: 84,
    emoji: '🧥',
    description: 'Bold layers with weather-ready comfort.'
  },
  {
    id: 4,
    name: 'Calm Roller',
    category: 'wellness',
    rating: 4.6,
    price: 32,
    offerPrice: 24,
    emoji: '🧘',
    description: 'A daily wellness essential.'
  },
  {
    id: 5,
    name: 'Orbit Bottle',
    category: 'tech',
    rating: 4.5,
    price: 44,
    offerPrice: 31,
    emoji: '🧴',
    description: 'Neat hydration for work and travel.'
  },
  {
    id: 6,
    name: 'Brick Tote',
    category: 'fashion',
    rating: 4.8,
    price: 68,
    offerPrice: 49,
    emoji: '👜',
    description: 'Sharp storage with everyday attitude.'
  }
];

let activeCategory = 'all';
let searchTerm = '';
let cart = JSON.parse(localStorage.getItem('novaCart') || '[]');

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const drawerOverlay = document.getElementById('drawerOverlay');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const categoryButtons = document.querySelectorAll('.category-pill');

function renderProducts() {
  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = [product.name, product.description, product.category]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    productGrid.innerHTML = '<div class="product-card"><p>No products fit that search yet.</p></div>';
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-visual">${product.emoji}</div>
          <div class="rating-row">
            <span>${product.rating.toFixed(1)} rating</span>
            <span class="stars">★★★★★</span>
          </div>
          <h4>${product.name}</h4>
          <p>${product.description}</p>
          <div class="price-row">
            <span class="offer-price">$${product.offerPrice}</span>
            <span class="price">$${product.price}</span>
          </div>
          <button class="add-btn" data-id="${product.id}">Add to cart</button>
        </article>
      `
    )
    .join('');
}

function updateCartUI() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
  cartTotal.textContent = `Total: $${total}`;

  if (!cart.length) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <p>Qty ${item.quantity}</p>
          </div>
          <span>$${item.offerPrice * item.quantity}</span>
        </div>
      `
    )
    .join('');
}

function addToCart(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('novaCart', JSON.stringify(cart));
  updateCartUI();
}

function toggleCart() {
  cartDrawer.classList.toggle('open');
  drawerOverlay.classList.toggle('show');
}

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    categoryButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeCategory = button.dataset.category;
    renderProducts();
  });
});

productGrid.addEventListener('click', (event) => {
  const target = event.target.closest('.add-btn');
  if (!target) return;
  addToCart(target.dataset.id);
});

cartToggle.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
drawerOverlay.addEventListener('click', toggleCart);

renderProducts();
updateCartUI();
