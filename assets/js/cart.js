async function loadCartDetails(){
  const prods = await (await fetch('./assets/data/products.json')).json();
  const cart = store.cart();
  return cart.map(item=>{
    const p = prods.find(x=>x.id===item.id);
    return {...p, qty:item.qty, total: p.price*item.qty};
  });
}
async function renderCart(){
  const wrap = document.getElementById('cartTableWrap'); if(!wrap) return;
  const items = await loadCartDetails();
  if(!items.length){ wrap.innerHTML = '<div class="alert alert-info">Your cart is empty.</div>'; return; }
  const rows = items.map(i=>`<tr>
    <td><img src="${i.image}" width="50" class="me-2"> ${i.name}</td>
    <td>${i.category}</td>
    <td>৳ ${i.price}</td>
    <td><input type="number" min="1" value="${i.qty}" style="width:80px" onchange="updateQty(${i.id}, this.value)"></td>
    <td>৳ ${i.total}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem(${i.id})">Remove</button></td>
  </tr>`).join('');
  const grand = items.reduce((a,i)=>a+i.total,0);
  wrap.innerHTML = `<div class="table-responsive"><table class="table align-middle">
    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <div class="text-end h5">Grand Total: ৳ ${grand}</div>`;
}
function updateQty(id, q){
  const cart = store.cart(); const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1){ cart[idx].qty = Number(q)||1; store.saveCart(cart); renderCart(); updateCounts(); }
}
function removeItem(id){
  const cart = store.cart().filter(i=>i.id!==id); store.saveCart(cart); renderCart(); updateCounts();
}
async function mountCheckout(){
  const sum = document.getElementById('orderSummary'); if(!sum) return;
  const items = await loadCartDetails();
  const sub = items.reduce((a,i)=>a+i.total,0);
  const ship = sub ? 60 : 0;
  const grand = sub + ship;
  sum.innerHTML = `<ul class="list-group mb-3">
    ${items.map(i=>`<li class="list-group-item d-flex justify-content-between align-items-center">
      <span>${i.name} × ${i.qty}</span><span>৳ ${i.total}</span></li>`).join('')||'<li class="list-group-item">No items.</li>'}
    <li class="list-group-item d-flex justify-content-between"><strong>Subtotal</strong><strong>৳ ${sub}</strong></li>
    <li class="list-group-item d-flex justify-content-between"><span>Shipping</span><span>৳ ${ship}</span></li>
    <li class="list-group-item d-flex justify-content-between"><strong>Total</strong><strong>৳ ${grand}</strong></li>
  </ul>`;
  const form = document.getElementById('checkoutForm');
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    store.saveCart([]); updateCounts();
    location.href = 'order-success.html';
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ renderCart(); mountCheckout(); });
