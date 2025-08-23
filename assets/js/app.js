function handleSearch(e){
  e.preventDefault();
  const q = document.getElementById('q').value.trim();
  const url = new URL('products.html', location.href);
  if(q) url.searchParams.set('q', q);
  location.href = url.toString();
  return false;
}

function updateCounts(){
  const cartCount = store.cart().reduce((a,i)=>a+i.qty,0);
  const wishCount = store.wishlist().length;
  document.getElementById('cartCount')?.replaceChildren(document.createTextNode(cartCount));
  document.getElementById('wishlistCount')?.replaceChildren(document.createTextNode(wishCount));
}
document.addEventListener('DOMContentLoaded', updateCounts);

// Auth (demo)
function registerUser(e){
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
function login(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const user = store.user();
  if(user && user.email===email && user.pass===pass){
    alert('Login success (demo)');
    location.href = 'account.html';
  }else{
    alert('Invalid credentials (demo)');
  }
  return false;
}
function logoutUser(){
  store.saveUser(null);
  alert('Logged out (demo)');
  location.href = 'index.html';
}
document.addEventListener('DOMContentLoaded', ()=>{
  const info = document.getElementById('accountInfo');
  if(info){
    const u = store.user();
    if(!u){ info.innerHTML = '<div class="text-muted">You are not logged in.</div>'; return; }
    info.innerHTML = `<div class="row g-3">
      <div class="col-md-6"><strong>Name:</strong> ${u.name}</div>
      <div class="col-md-6"><strong>Email:</strong> ${u.email}</div>
      <div class="col-md-6"><strong>Phone:</strong> ${u.phone}</div>
    </div>`;
  }
});
