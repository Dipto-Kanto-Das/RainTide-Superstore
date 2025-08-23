function getJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } }
function setJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
const store = {
  cart: () => getJSON('rt_cart', []),
  saveCart: v => setJSON('rt_cart', v),
  wishlist: () => getJSON('rt_wishlist', []),
  saveWishlist: v => setJSON('rt_wishlist', v),
  compare: () => getJSON('rt_compare', []),
  saveCompare: v => setJSON('rt_compare', v),
  user: () => getJSON('rt_user', null),
  saveUser: v => setJSON('rt_user', v),
};
