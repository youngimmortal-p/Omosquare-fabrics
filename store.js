// store.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ---------- Firebase config (your provided config) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyAyaEpXKLbeFCd1dzikTDtHW4UIJcSnNEc",
  authDomain: "omosquare-fabrics.firebaseapp.com",
  projectId: "omosquare-fabrics",
  storageBucket: "omosquare-fabrics.firebasestorage.app",
  messagingSenderId: "460244510484",
  appId: "1:460244510484:web:e947ae53c79045b840c401"
};
/* ----------------------------------------------------------- */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ------------------ Your existing local/fallback products ------------------
   Replace image paths or keep as-is. These show immediately on page load.
   (I included several sample product entries based on what you used earlier.)
*/
const localProducts = [
  { id: "p1", name: "Indigo Adire Cloth (5 yard)", price: 15000, category: "adire", image: "images/adire/adire1.jpg" },
    { id: "p2", name: "Indigo Adire Cloth (5 yard)", price: 15000, category: "adire", image: "images/adire/adire2.jpg" },
    { id: "p3", name: "Indigo Adire Cloth (5 yard)", price: 15000, category: "adire", image: "images/adire/adire3.jpg" },
      { id: "p4", name: "Indigo Adire Cloth (5 yard)", price: 15000, category: "adire", image: "images/adire/adire4.jpg" },
        { id: "p5", name: "Indigo Adire Cloth (5 yard)", price: 15000, category: "adire", image: "images/adire/adire5.jpg" },
          { id: "p6", name: "Indigo Adire Cloth (5 yard)", price: 15000, category: "adire", image: "images/adire/adire6.jpg" },
          
     { id: "p7", name: "Royal Kampala Set (5 yard)", price: 5000, category: "kampala", image: "images/campala/campala1.jpg" },
       { id: "p8", name: "Royal Kampala Set (5 yard)", price: 5000, category: "kampala", image: "images/campala/campala2.jpg" },
         { id: "p9", name: "Royal Kampala Set (5 yard)", price: 5000, category: "kampala", image: "images/campala/campala3.jpg" },
           { id: "p10", name: "Royal Kampala Set (5 yard)", price: 5000, category: "kampala", image: "images/campala/campala4.jpg" },
             { id: "p11", name: "Royal Kampala Set (5 yard)", price: 5000, category: "kampala", image: "images/campala/campala5.jpg" },
               { id: "p12", name: "Royal Kampala Set (5 yard)", price: 5000, category: "kampala", image: "images/campala/campala6.jpg" },
   { id: "p13", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara1.jpg" },
    { id: "p14", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara2.jpg" },
      { id: "p15", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara3.jpg" },
    { id: "p16", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara4.jpg" },
      { id: "p17", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara5.jpg" },
    { id: "p18", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara6.jpg" },
      { id: "p19", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara7.jpg" },
        { id: "p20", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara8.jpg" },
          { id: "p21", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara9.jpg" },
            { id: "p22", name: "Vibrant Ankara Mix (5 yard)", price: 5000, category: "ankara", image: "images/ankara/ankara10.jpg" },
            

  // --- Omosquare Fresh ---
  { id: "p23", name: "Omosquare Fresh Loquid Soap (250ml)", price: 450, category: "fresh", image: "images/soap/soap1.jpg" },
    { id: "p23", name: "Omosquare Fresh Liquid Soap (500ml)", price: 800, category: "fresh", image: "images/soap/soap1.jpg" },
  
  { id: "p24", name: "Omosquare Fresh Liquid Soap (1litre)", price: 1600, category: "fresh", image: "images/soap/soap2.jpg" }
];
/* -------------------------------------------------------------------- */

let products = [...localProducts]; // start with local products (they show immediately)
let currentFilter = 'all';
let cart = JSON.parse(localStorage.getItem("os_cart_v1") || "[]");

// DOM refs
const productListEl = document.getElementById("product-list");
const cartCountEl = document.getElementById("cart-count");
const cartToggleBtn = document.getElementById("cart-toggle");
const cartModal = document.getElementById("cart-modal");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const closeCartBtn = document.getElementById("close-cart");
const clearCartBtn = document.getElementById("clear-cart");
const cartCheckoutBtn = document.getElementById("cart-checkout");

function formatNaira(n){ return "₦" + Number(n).toLocaleString(); }
function escapeHtml(t){ return String(t).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// render function (reads current products array)
function renderProducts(filter = "all"){
  currentFilter = filter;
  productListEl.innerHTML = "";
  const list = filter === "all" ? products : products.filter(p => p.category === filter);

  if (filter === "fresh") productListEl.classList.add("fresh-bg"); else productListEl.classList.remove("fresh-bg");

  list.forEach(p=>{
    const el = document.createElement("article");
    el.className = "bg-white/6 rounded-xl overflow-hidden shadow-sm flex flex-col";
    el.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${escapeHtml(p.name)}" class="w-full h-36 object-cover">
      <div class="p-3 flex flex-col flex-1 justify-between">
        <div>
          <h4 class="font-semibold text-sm md:text-base">${escapeHtml(p.name)}</h4>
          <div class="text-xs text-white/80 mt-1">${formatNaira(p.price)}</div>
        </div>
        <button class="add-btn mt-3 bg-kampala-accent text-black hover:bg-ankara-yellow text-sm font-semibold py-2 rounded-lg transition" data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    productListEl.appendChild(el);
  });

  document.querySelectorAll(".add-btn").forEach(b => b.addEventListener("click", ()=>addToCart(b.dataset.id)));
}

// CART logic
function saveCart(){ localStorage.setItem("os_cart_v1", JSON.stringify(cart)); }
function updateCartCount(){ cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0); }

function addToCart(id){
  const prod = products.find(p=>p.id === id);
  if(!prod) { alert('Product not found'); return; }
  const e = cart.find(i=>i.id===id);
  if(e) e.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  saveCart(); updateCartCount(); renderCart();
}

function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); saveCart(); renderCart(); updateCartCount(); }
function changeQty(id, delta){ const it = cart.find(i=>i.id===id); if(!it) return; it.qty = Math.max(1, it.qty + delta); saveCart(); renderCart(); updateCartCount(); }

function renderCart(){
  cartItemsEl.innerHTML = "";
  if(cart.length === 0){ cartItemsEl.innerHTML = `<div class="text-center text-white/70 py-8">Your cart is empty.</div>`; cartTotalEl.textContent = "₦0"; return; }
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "flex items-center justify-between bg-white/5 rounded-lg p-3";
    div.innerHTML = `
      <div>
        <p class="font-semibold text-sm">${escapeHtml(item.name)}</p>
        <p class="text-xs text-white/60">${formatNaira(item.price)} × ${item.qty}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="minus px-2 py-1 bg-white/10 rounded">−</button>
        <button class="plus px-2 py-1 bg-white/10 rounded">+</button>
        <button class="remove text-xs underline text-white/70">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
    div.querySelector(".minus").addEventListener("click", ()=>changeQty(item.id, -1));
    div.querySelector(".plus").addEventListener("click", ()=>changeQty(item.id, 1));
    div.querySelector(".remove").addEventListener("click", ()=>removeFromCart(item.id));
  });
  cartTotalEl.textContent = formatNaira(cart.reduce((s,i)=>s + i.price * i.qty, 0));
}

// WhatsApp checkout
function buildWhatsAppMessage(){
  if(cart.length === 0) return null;
  let msg = `Hello Omosquare Fabrics, I would like to order:\n`;
  let total = 0;
  cart.forEach(it => { msg += `• ${it.name} × ${it.qty} — ₦${(it.price * it.qty).toLocaleString()}\n`; total += it.price * it.qty; });
  msg += `\nTotal: ₦${total.toLocaleString()}\n\nName:\nAddress:\n`;
  return encodeURIComponent(msg);
}
function openWhatsAppCheckout(){
  const encoded = buildWhatsAppMessage();
  if(!encoded){ alert('Your cart is empty'); return; }
  window.open(`https://wa.me/2348088949910?text=${encoded}`, '_blank');
}

// UI events
document.querySelectorAll(".filter-btn").forEach(b=>{
  b.addEventListener("click", ()=>{ const cat = b.dataset.cat; renderProducts(cat || 'all'); document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("bg-kampala","text-white")); b.classList.add("bg-kampala","text-white"); });
});

cartToggleBtn.addEventListener("click", ()=>{ cartModal.classList.remove('hidden'); renderCart(); });
cartBackdrop.addEventListener("click", ()=>cartModal.classList.add('hidden'));
closeCartBtn.addEventListener("click", ()=>cartModal.classList.add('hidden'));
clearCartBtn.addEventListener("click", ()=>{ if(confirm('Clear all items?')){ cart = []; saveCart(); renderCart(); updateCartCount(); } });
cartCheckoutBtn.addEventListener("click", openWhatsAppCheckout);

// Firestore listener: load Firebase products, put them at the TOP (owner items first)
(function initFirestoreListener(){
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snap) => {
      const firebaseProducts = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        firebaseProducts.push({
          id: docSnap.id,
          name: d.name || 'No name',
          price: Number(d.price) || 0,
          category: d.category || 'adire',
          image: d.image || ''
        });
      });
      // Put Firestore products at the top, local fallback below
      products = [...firebaseProducts, ...localProducts];
      renderProducts(currentFilter || 'all');
      updateCartCount();
    }, (err) => console.error('Firestore onSnapshot error', err));
  } catch (e) {
    console.warn('Firestore listener failed', e);
    // keep local products if Firestore can't load
    products = [...localProducts];
    renderProducts('all');
    updateCartCount();
  }
})();

// initial render (local immediately)
renderProducts('all');
updateCartCount();
