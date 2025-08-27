// =======================
// PRODUCTS & CART LOGIC
// =======================
let products = [];

async function loadProducts() {
  if (products.length) return products;
  const res = await fetch('./assets/data/products.json');
  products = await res.json();
  return products;
}

function formatPrice(p) {
  return Number(p).toLocaleString('en-BD') + '৳ ';
}

function productCard(p) {
  return `<div class="col-6 col-md-4 col-lg-3">
    <div class="card h-100 card-product">
      <img src="${p.image}" class="card-img-top" alt="${p.name}">
      <div class="card-body d-flex flex-column">
        <h6 class="card-title flex-grow-1">
          <a class="text-decoration-none" href="product.html?id=${p.id}">${p.name}</a>
        </h6>
        <div class="d-flex justify-content-between align-items-center">
          <div class="price">${formatPrice(p.price)}</div>
          <div>
            <button class="btn btn-sm btn-outline-primary" onclick="addToCart(${p.id})">Add</button>
            <button class="btn btn-sm btn-outline-secondary" title="Wishlist" onclick="toggleWishlist(${p.id})">♥</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function addToCart(id, qty = 1) {
  const cart = store.cart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({ id, qty });
  }
  store.saveCart(cart);
  updateCounts();
}

function toggleWishlist(id) {
  const list = store.wishlist();
  const i = list.indexOf(id);
  if (i > -1) list.splice(i, 1);
  else list.push(id);
  store.saveWishlist(list);
  updateCounts();
}

function toggleCompare(id) {
  const list = store.compare();
  const i = list.indexOf(id);
  if (i > -1) list.splice(i, 1);
  else list.push(id);
  store.saveCompare(list);
}

// =======================
// MOUNT FUNCTIONS
// =======================
async function mountHome() {
  const data = await loadProducts();

  // Top categories
  const cats = [...new Set(data.map(p => p.category))].slice(0, 6);
  const catWrap = document.getElementById('topCategories');
  if (catWrap) {
    catWrap.innerHTML = cats.map(c => {
      const product = data.find(p => p.category === c);
      return `
      <div class="col-6 col-md-4 col-lg-2">
        <a href="products.html?category=${encodeURIComponent(c)}" class="text-decoration-none">
          <div class="p-3 border rounded text-center h-100">
            <img src="${product?.categoryIcons || './assets/icons/default.png'}" 
                 alt="${c}" width="40" height="40" class="mb-2">
            <div><span class="badge badge-cat">${c}</span></div>
          </div>
        </a>
      </div>`;
    }).join('');
  }

  // Featured products
  const featured = data.filter(p => p.featured).slice(0, 8);
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid) featuredGrid.innerHTML = featured.map(productCard).join('');
}

async function mountProducts() {
  const data = await loadProducts();
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').toLowerCase();
  const category = params.get('category') || '';

  const sel = document.getElementById('filterCategory');
  const allCats = [...new Set(data.map(p => p.category))];
  if (sel) sel.innerHTML = '<option value="">All</option>' + allCats.map(c => `<option ${c === category ? 'selected' : ''}>${c}</option>`).join('');

  let list = data.filter(p => (!category || p.category === category) && (!q || p.name.toLowerCase().includes(q)));

  const min = Number(document.getElementById('minPrice')?.value || 0);
  const max = Number(document.getElementById('maxPrice')?.value || 0);
  if (min) list = list.filter(p => p.price >= min);
  if (max) list = list.filter(p => p.price <= max);

  const sortBy = document.getElementById('sortBy')?.value || 'pop';
  if (sortBy === 'priceAsc') list.sort((a, b) => a.price - b.price);
  if (sortBy === 'priceDesc') list.sort((a, b) => b.price - a.price);
  if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = list.length;

  const gridEl = document.getElementById('productGrid');
  if (gridEl) gridEl.innerHTML = list.map(productCard).join('');
}

function applyFilters() { mountProducts(); }

async function mountProductDetail() {
  const wrap = document.getElementById('productDetail');
  if (!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id'));
  const data = await loadProducts();
  const p = data.find(x => x.id === id) || data[0];
  wrap.innerHTML = `<div class="row g-4">
    <div class="col-md-5"><img src="${p.image}" class="img-fluid rounded" alt="${p.name}"></div>
    <div class="col-md-7">
      <h3>${p.name}</h3>
      <div class="mb-2"><span class="badge badge-cat">${p.category}</span></div>
      <div class="h4">${formatPrice(p.price)}</div>
      <p class="text-muted">${p.description || ''}</p>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="btn btn-outline-secondary" onclick="toggleWishlist(${p.id})">Wishlist</button>
        <button class="btn btn-outline-dark" onclick="toggleCompare(${p.id})">Compare</button>
      </div>
    </div>
  </div>`;
}

async function mountWishlist() {
  const grid = document.getElementById('wishlistGrid');
  if (!grid) return;
  const data = await loadProducts();
  const ids = store.wishlist();
  const list = data.filter(p => ids.includes(p.id));
  grid.innerHTML = list.map(productCard).join('') || '<div class="text-muted">No items in wishlist.</div>';
}

async function mountCompare() {
  const wrap = document.getElementById('compareWrap');
  if (!wrap) return;
  const data = await loadProducts();
  const ids = store.compare();
  const list = data.filter(p => ids.includes(p.id));
  if (!list.length) {
    wrap.innerHTML = '<div class="text-muted">No items to compare.</div>';
    return;
  }
  const headers = ['Name', 'Category', 'Price'];
  const rows = list.map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${formatPrice(p.price)}</td></tr>`).join('');
  wrap.innerHTML = `<table class="table table-bordered"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
}

// =======================
// SEARCH & COUNTS
// =======================
function handleSearch(e) {
  e.preventDefault();
  const q = document.getElementById('q').value.trim();
  const url = new URL('products.html', location.href);
  if (q) url.searchParams.set('q', q);
  location.href = url.toString();
  return false;
}

function updateCounts() {
  const cartCount = store.cart().reduce((a, i) => a + i.qty, 0);
  const wishCount = store.wishlist().length;
  document.getElementById('cartCount')?.replaceChildren(document.createTextNode(cartCount));
  document.getElementById('wishlistCount')?.replaceChildren(document.createTextNode(wishCount));
}

// =======================
// AUTH DEMO
// =======================
function registerUser(e) {
  e.preventDefault();
  const user = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    pass: document.getElementById('pass').value,
  };
  store.saveUser(user);
  alert('Registered (demo). You can now login.');
  location.href = 'login.html';
  return false;
}

function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const user = store.user();
  if (user && user.email === email && user.pass === pass) {
    alert('Login success (demo)');
    location.href = 'account.html';
  } else {
    alert('Invalid credentials (demo)');
  }
  return false;
}

function logoutUser() {
  store.saveUser(null);
  alert('Logged out (demo)');
  location.href = 'index.html';
}

// =======================
// ELECTRONICS SECTION
// =======================
async function displayElectronics() {
  await loadProducts();
  const grid = document.getElementById("electronicsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const electronics = products.filter(p => p.category === "Electronics");
  grid.innerHTML = electronics.map(productCard).join('');
}

// =======================
// CLOTHES SECTION
// =======================
async function displayClothes() {
  await loadProducts();
  const grid = document.getElementById("clothesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const clothes = products.filter(p => p.category === "Clothes");
  grid.innerHTML = clothes.map(productCard).join('');
}

// =======================
// DOMContentLoaded (ONE TIME ONLY)
// =======================
document.addEventListener('DOMContentLoaded', async () => {
  await mountHome(); 
  await mountProducts(); 
  await mountProductDetail(); 
  await mountWishlist(); 
  await mountCompare();

  // নতুন সেকশন লোড
  await displayElectronics();
  await displayClothes();

  updateCounts();

  // Account Info
  const info = document.getElementById('accountInfo');
  if (info) {
    const u = store.user();
    if (!u) {
      info.innerHTML = '<div class="text-muted">You are not logged in.</div>';
      return;
    }
    info.innerHTML = `<div class="row g-3">
      <div class="col-md-6"><strong>Name:</strong> ${u.name}</div>
      <div class="col-md-6"><strong>Email:</strong> ${u.email}</div>
      <div class="col-md-6"><strong>Phone:</strong> ${u.phone}</div>
    </div>`;
  }
});
// 
async function displayBeauty(){
  const res = await fetch('./assets/data/products.json');
  const products = await res.json();
  const beauty = products.filter(p => p.category === "Beauty & Personal Care");

  if(beauty.length){
    const section = document.getElementById('beautySection');
    const row = section.querySelector('.row');
    if(row){
      row.innerHTML = beauty.map(p => productCard(p)).join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  mountHome(); 
  mountProducts(); 
  mountProductDetail(); 
  mountWishlist(); 
  mountCompare();

  displayElectronics();
  displayClothes();
  displayBeauty();  // 🔥 নতুন Beauty section load হবে
});
