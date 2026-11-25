const vendors = [
  { id: 23, name: 'PUP Trinas',   desc: 'Rice meals and Filipino comfort food.', hours: '7:00 AM – 5:00 PM', isOpen: true,  gcash: '09458331511', mapX: 35.5, mapY: 63.3 },
  { id: 27, name: 'Tara at Kain', desc: 'Savory silog and sisig meals.',          hours: '7:00 AM – 6:00 PM', isOpen: true,  gcash: '09458330000', mapX: 35.3, mapY: 67.6 },
  { id: 13, name: 'Burger Queen', desc: 'Burgers and fries.',                     hours: '7:00 AM – 7:00 PM', isOpen: false, gcash: '09458334132', mapX: 41.6, mapY: 67.6 }
];
const foods = [
  { id: 1, name: 'Liempo Sisig',   desc: 'Crispy, savory, tangy, sizzling pork belly.', price: 75,  rating: 4.8, stall: 23, stock: 40, image: 'assets/liempo_sisig.jpg',       allergens: [] },
  { id: 2, name: 'Tofu Sisig',     desc: 'Savory, tangy, creamy sizzling tofu.',        price: 75,  rating: 4.2, stall: 27, stock: 0,  image: 'assets/img_tofu_sisig.jpg',     allergens: ['Soy'] },
  { id: 3, name: 'Supreme Burger', desc: 'Thick, flame-grilled beef stacked high.',     price: 150, rating: 4.2, stall: 13, stock: 0,  image: 'assets/img_supreme_burger.jpg', allergens: ['Wheat', 'Egg', 'Milk'] }
];

function addVendor(v) { vendors.push(v); renderAll(); }
function addFood(f)   { foods.push(f);   renderAll(); }
function setData(d) {
  if (d.vendors) { vendors.length = 0; vendors.push(...d.vendors); }
  if (d.foods)   { foods.length = 0;   foods.push(...d.foods); }
  renderAll();
syncFromVendor();
}
function setOrderStatus(no, status) {
  const o = orders.find(x => x.no === no); if (!o) return;
  o.status = status; saveState(); renderOrders();
  if (status === 2) toast('Order ' + no + ' is ready for pickup!');
}
window.IskoEats = { addVendor, addFood, setData, setOrderStatus, vendors, foods };

const VENDOR_API = '';
function syncFromVendor() {
  if (!VENDOR_API) return;
  fetch(VENDOR_API).then(r => r.json()).then(d => { setData(d); validateCart(); }).catch(() => {});
}
setInterval(syncFromVendor, 20000);

const customerName = 'John Doe Silvas';
const customerFirst = customerName.trim().split(/\s+/)[0];
const customerLast  = customerName.trim().split(/\s+/).pop();
let cart = {};
let sortMode = 'asc';
let stallFilter = null;
let paymentStep = false;
let orderFilter = 'all';
let proofs = {};
let currentPage = 'map';
let myAllergens = [];
try { myAllergens = JSON.parse(localStorage.getItem('allergens') || '[]'); } catch (e) {}

let toastTimer;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function saveState() { try { localStorage.setItem('iskoCart', JSON.stringify(cart)); localStorage.setItem('iskoOrders2', JSON.stringify(orders)); } catch (e) {} }
function setBg() {
  const blurred = currentPage === 'cart' || (currentPage === 'menu' && stallFilter);
  document.body.className = blurred ? 'bg-normal' : currentPage === 'orders' ? 'bg-red' : '';
}

const orders = [];

try {
  const sc = JSON.parse(localStorage.getItem('iskoCart') || '{}'); if (sc && typeof sc === 'object') cart = sc;
  const so = JSON.parse(localStorage.getItem('iskoOrders2') || 'null'); if (Array.isArray(so)) { orders.length = 0; orders.push(...so); }
} catch (e) {}

const $ = id => document.getElementById(id);
const food = id => foods.find(f => f.id === id);
const vendor = id => vendors.find(v => v.id === id);
const peso = n => '₱' + n;
const canOrder = f => f.stock > 0 && vendor(f.stall) && vendor(f.stall).isOpen;
const cartTotal = () => Object.keys(cart).reduce((s, id) => s + food(+id).price * cart[id], 0);
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);

function showPage(name) {
  currentPage = name;
  setBg();
  window.scrollTo(0, 0);
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  $('page-' + name).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.page === name));
  if (name === 'menu' && !stallFilter) renderMenu();
  if (name === 'cart') { paymentStep = false; renderCart(); }
  if (name === 'orders') renderOrders();
  closePopups();
  updateBar();
}
document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  if (t.dataset.page === 'menu') stallFilter = null;
  showPage(t.dataset.page);
});

function closePopups() {
  $('burgerMenu').classList.add('hidden');
  $('burgerIcon').classList.remove('hidden');
  $('burgerX').classList.add('hidden');
  $('orderFilterMenu').classList.add('hidden');
}
$('burgerBtn').onclick = e => {
  e.stopPropagation();
  const open = $('burgerMenu').classList.contains('hidden');
  closePopups();
  if (open) {
    $('burgerMenu').classList.remove('hidden');
    $('burgerIcon').classList.add('hidden');
    $('burgerX').classList.remove('hidden');
  }
};
$('menuHelp').onclick = () => {
  window.open('https://mail.google.com/mail/u/0/?fs=1&to=IskoEatsPH@gmail.com&tf=cm', '_blank');
  closePopups();
};
$('menuLogout').onclick = () => { cart = {}; location.reload(); };
document.addEventListener('click', e => {
  if (!e.target.closest('.burger-menu,.select-menu')) closePopups();
});
document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePopups(); $('allergenModal').classList.add('hidden'); } });
$('allergenModal').addEventListener('click', e => { if (e.target === $('allergenModal')) $('allergenModal').classList.add('hidden'); });

const allergenNames = ['Peanuts', 'Tree nuts', 'Milk', 'Egg', 'Wheat', 'Soy', 'Fish', 'Shellfish'];
$('menuAllergens').onclick = () => {
  $('allergenList').innerHTML = allergenNames.map(a =>
    `<label><input type="checkbox" value="${a}" ${myAllergens.includes(a) ? 'checked' : ''}> ${a}</label>`).join('');
  $('allergenModal').classList.remove('hidden');
  closePopups();
};
$('allergenSave').onclick = () => {
  myAllergens = [...document.querySelectorAll('#allergenList input:checked')].map(i => i.value);
  try { localStorage.setItem('allergens', JSON.stringify(myAllergens)); } catch (e) {}
  $('allergenModal').classList.add('hidden');
  toast(myAllergens.length ? 'Allergens saved' : 'Saved: no allergies');
  renderMenu();
};

function renderMap() {
  const wrap = $('mapWrap');
  wrap.querySelectorAll('.hotspot').forEach(h => h.remove());
  vendors.forEach(v => {
    const h = document.createElement('div');
    h.className = 'hotspot';
    h.style.left = v.mapX + '%'; h.style.top = v.mapY + '%';
    h.innerHTML = `<span class="label">${v.name.toUpperCase()}</span>`;
    h.style.pointerEvents = 'auto'; h.style.cursor = 'pointer';
    h.onclick = () => {
      wrap.querySelectorAll('.hotspot').forEach(x => x.classList.remove('show'));
      h.classList.add('show');
      setTimeout(() => { h.classList.remove('show'); stallFilter = v.id; renderMenu(); showPage('menu'); }, 700);
    };
    wrap.appendChild(h);
  });
}

function renderMenu() {
  const b = $('stallBanner'), v = vendor(stallFilter);
  b.classList.toggle('hidden', !v);
  $('menuTitle').classList.toggle('hidden', !!v);
  if (v) b.innerHTML = `<span class="badge ${v.isOpen ? 'open' : 'closed'}">${v.isOpen ? 'Open' : 'Closed'}</span>
    <h2>${v.name.toUpperCase()}</h2><p>${v.desc}<br>Open: ${v.hours}</p>`;

  let list = foods.filter(f => !stallFilter || f.stall === stallFilter);

  list.sort((a, c) => sortMode === 'asc' ? a.price - c.price : c.price - a.price);

  $('foodList').innerHTML = list.length ? list.map(foodCard).join('') : '<div class="empty">No food found.</div>';
  setBg();
}
function foodCard(f) {
  const v = vendor(f.stall) || { name: '', isOpen: false };
  const ok = canOrder(f);
  const bad = f.allergens.filter(a => myAllergens.includes(a));
  return `<div class="card ${ok ? '' : 'unavailable'}">
    <div class="pic"><img class="food" src="${f.image}" alt="">
      <span class="rating"><img src="assets/icon_rating.png" alt="">${f.rating}</span></div>
    <div class="info">
      <div class="top-row"><h4>${f.name}</h4>
        <span class="badges"><span class="badge ${v.isOpen ? 'open' : 'closed'}">${v.isOpen ? 'Open' : 'Closed'}</span>
        <span class="badge ${f.stock > 0 ? 'left' : 'out'}">${f.stock} Left</span></span></div>
      <p class="desc">${f.desc}</p>
      <p class="stall">Stall: ${f.stall} | ${v.name}</p>
      ${bad.length ? `<span class="caution">⚠ Contains ${bad.join(', ')}</span>` : ''}
      <div class="bottom-row"><span class="price">${peso(f.price)}</span>
        ${cart[f.id] ? `<span class="incart">In cart: ${cart[f.id]}</span>` : ''}
        <!-- ICON_ADDTOCART button: disabled when sold out, closed, or the cart already holds all the stock -->
        <button class="add-btn" onclick="addToCart(${f.id})" ${ok && (cart[f.id] || 0) < f.stock ? '' : 'disabled'}>
          <img src="assets/icon_addtocart.png" alt=""></button></div>
    </div></div>`;
}

function addToCart(id) {
  const f = food(id);
  if (canOrder(f) && (cart[id] || 0) < f.stock) { cart[id] = (cart[id] || 0) + 1; toast('Added ' + f.name); }
  else toast('Only ' + f.stock + ' available');
  saveState(); renderMenu(); updateBar();
}
function changeQty(id, d) {
  const f = food(id), n = (cart[id] || 0) + d;
  if (n > f.stock) { toast('Only ' + f.stock + ' available'); return; }
  if (n <= 0) delete cart[id]; else cart[id] = n;
  saveState(); renderCart(); updateBar();
}
function updateBar() {
  const n = cartCount();
  const onMenu = !$('page-menu').classList.contains('hidden');
  $('checkoutBar').classList.toggle('hidden', !(n > 0 && onMenu));
  $('cartCount').textContent = n;
  $('tabBadge').textContent = n; $('tabBadge').classList.toggle('hidden', n === 0);
  $('barItems').textContent = n + ' items';
  $('barTotal').textContent = peso(cartTotal());
}
$('checkoutBtn').onclick = () => showPage('cart');

function makeOrderNo(d) {
  const hour12 = d.getHours() % 12 || 12;
  const hhmm = String(hour12) + String(d.getMinutes()).padStart(2, '0');
  return (customerFirst[0] + customerLast[0]).toUpperCase() + d.getDate() + '-' + hhmm;
}

function renderCart() {
  const ids = Object.keys(cart).map(Number);
  if (!ids.length) { $('cartArea').innerHTML = '<div class="empty">Your cart is empty.<br><button class="btn" onclick="stallFilter=null;showPage(\'menu\')">Browse the menu</button></div>'; return; }
  paymentStep ? renderPayment(ids) : renderSummary(ids);
}
function renderSummary(ids) {
  const now = new Date();
  window.orderNo = makeOrderNo(now);
  const date = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  $('cartArea').innerHTML = `<div class="paper"><h2>Order Summary</h2><p class="sub">ISKOEATS PRE-ORDER</p><hr>
    <div class="row"><span>ORDER NO.</span><span>${window.orderNo}</span></div>
    <div class="row"><span>DATE</span><span>${date}</span></div>
    <div class="row"><span>CUSTOMER NAME</span><span>${customerName}</span></div><hr>
    <table class="t"><tr><th>ITEMS</th><th>STALL</th><th class="c">QUANTITY</th><th class="r">AMOUNT</th></tr>
    ${ids.map(id => { const f = food(id);
      return `<tr><td>${f.name}</td><td>${f.stall} ${vendor(f.stall).name}</td>
      <td class="c"><span class="qty"><button onclick="changeQty(${id},-1)">-</button><span>${cart[id]}</span>
      <!-- the + button is disabled when the quantity reached the available stock -->
      <button onclick="changeQty(${id},1)" ${cart[id] >= f.stock ? 'disabled' : ''}>+</button></span></td>
      <td class="r">${peso(f.price * cart[id])}</td></tr>`; }).join('')}</table><hr>
    <div class="row"><span>Total Item</span><span>${cartCount()}</span></div><hr>
    <div class="row total"><span>TOTAL PRICE</span><span>${peso(cartTotal())}</span></div><hr>
    <div class="row"><span>Mode of Payment</span><span>Gcash</span></div>
    <button class="btn right" onclick="startPayment()">Place Order</button></div>`;
}
function validateCart() {
  let changed = false;
  Object.keys(cart).forEach(id => {
    const f = food(+id);
    if (!f || !canOrder(f)) { delete cart[id]; changed = true; }
    else if (cart[id] > f.stock) { cart[id] = f.stock; changed = true; }
  });
  if (changed) { toast('Your cart was updated because some items changed.'); saveState(); updateBar(); }
  return Object.keys(cart).length > 0;
}
function startPayment() {
  if (!validateCart()) { renderCart(); return; }
  paymentStep = true; proofs = {}; renderCart();
}
function renderPayment(ids) {
  const byStall = {};
  ids.forEach(id => { const f = food(id); byStall[f.stall] = (byStall[f.stall] || 0) + f.price * cart[id]; });
  const stalls = Object.keys(byStall).map(Number);
  $('cartArea').innerHTML = `<div class="paper"><h2>E-Payment</h2><hr>
    <table class="t"><tr><th>STALL</th><th>GCASH NUMBER</th><th class="r">AMOUNT</th></tr>
    ${stalls.map(s => `<tr><td>${s} ${vendor(s).name}</td><td>${vendor(s).gcash}</td><td class="r">${peso(byStall[s])}</td></tr>`).join('')}</table><hr>
    <div class="row total"><span>TOTAL PRICE</span><span>${peso(cartTotal())}</span></div><hr>
    <b>UPLOAD SCREENSHOT</b><p style="font-size:13px">Send each amount to the number above, then attach your proof of payment.</p>
    ${stalls.map(s => `<div class="upload-row"><div><b>${s} ${vendor(s).name}</b><br>${proofs[s] ? `<img class="thumb" src="${proofs[s].url}" alt="">${proofs[s].name.slice(0, 18)}` : 'Required'}</div>
      <!-- this is the ICON_UPLOAD button (a hidden file input sits on top of it) -->
      <label class="upload-btn ${proofs[s] ? 'done' : ''}"><img src="assets/icon_upload.png" alt="">
      <input type="file" accept="image/*" onchange="setProof(${s},this)"></label></div>`).join('')}
    <!-- this is the border for the payment notice -->
    <div class="notice"><b>PLEASE READ</b><ul>
      <li>No refunds. All payments are final once sent.</li>
      <li>Check the number and amount first. Money sent to the wrong number or amount can't be recovered by IskoEats or the stall.</li>
      <li>Send the exact total for each stall and upload a clear, uncropped screenshot that shows the reference number.</li>
      <li>Your order is prepared only after the stall verifies your payment.</li>
      <li>Orders with fake, edited or missing screenshots will be cancelled.</li>
      <li>Unclaimed orders are not refunded.</li></ul></div>
    <label class="terms"><input type="checkbox" id="agree" onchange="checkComplete()"> I have read and agree to these terms.</label>
    <button id="completeBtn" class="btn right" onclick="completeOrder()" disabled>Complete</button></div>`;
  window.needStalls = stalls;
}
function setProof(stall, input) {
  const file = input.files[0];
  if (file && file.size > 8 * 1024 * 1024) { toast('Picture is too big (max 8 MB)'); return; }
  if (file) proofs[stall] = { name: file.name, url: URL.createObjectURL(file) };
  renderPayment(Object.keys(cart).map(Number));
}
function checkComplete() {
  const ok = window.needStalls.every(s => proofs[s]) && $('agree').checked;
  $('completeBtn').disabled = !ok;
}
function completeOrder() {
  if (!validateCart()) { paymentStep = false; renderCart(); return; }
  const items = Object.keys(cart).map(id => ({ foodId: +id, qty: cart[id] }));
  items.forEach(i => { food(i.foodId).stock -= i.qty; });
  orders.unshift({ no: window.orderNo, date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }), status: 0, items });
  cart = {}; window.orderNo = null; paymentStep = false;
  saveState(); toast('Order placed! The stall will verify your payment.');
  showPage('orders');
}
const _rp = renderPayment; renderPayment = function (ids) { _rp(ids); checkComplete(); };

function renderOrders() {
  const list = orders.filter(o => orderFilter === 'all' || (orderFilter === 'active' ? o.status < 3 : o.status === 3));
  const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];
  $('orderList').innerHTML = list.length ? list.map(o => {
    const total = o.items.reduce((s, i) => s + food(i.foodId).price * i.qty, 0);
    return `<div class="order ${o.status === 3 ? 'past' : ''}"><h3>${o.no}</h3><div class="date">${o.date}</div>
      <table class="t"><tr><th>ITEMS</th><th>STALL</th><th class="c">QUANTITY</th><th class="r">AMOUNT</th></tr>
      ${o.items.map(i => { const f = food(i.foodId);
        return `<tr><td>${f.name}</td><td>${f.stall} ${vendor(f.stall).name}</td><td class="c">${i.qty}</td><td class="r">${peso(f.price * i.qty)}</td></tr>`; }).join('')}</table>
      <!-- progress tracker: the red line stops at the current status -->
      <div class="track"><div class="fill" style="width:${o.status * 25}%"></div>
      ${steps.map((s, n) => `<div class="step ${n <= o.status ? 'on' : ''}"><i></i>${s}</div>`).join('')}</div><hr style="border:0;border-top:1px solid #aaa">
      <div class="row total"><span>TOTAL PRICE</span><span>${peso(total)}</span></div><hr style="border:0;border-top:1px solid #aaa">
      <div class="row"><span>Mode of Payment</span><span>Gcash</span></div>
      ${o.status === 2 ? `<button class="btn right" onclick="receiveOrder('${o.no}')">Order Received</button>` : ''}</div>`;
  }).join('') : '<div class="empty">No orders here yet.</div>';
}
function receiveOrder(no) { orders.find(o => o.no === no).status = 3; saveState(); toast('Enjoy your meal!'); renderOrders(); }

$('orderFilterBtn').onclick = e => { e.stopPropagation(); $('orderFilterMenu').classList.toggle('hidden'); };
$('orderFilterMenu').querySelectorAll('button').forEach(btn => btn.onclick = () => {
  orderFilter = btn.dataset.f;
  $('orderFilterLabel').textContent = btn.textContent;
  $('orderFilterMenu').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === btn));
  $('orderFilterMenu').classList.add('hidden');
  renderOrders();
});

function renderAll() { renderMap(); renderMenu(); renderCart(); renderOrders(); updateBar(); }
$('customerName').textContent = customerName;
renderAll();
