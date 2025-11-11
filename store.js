const WHATSAPP_NUMBER = "2348088949910";
const STORE_NAME = "Omosquare Fabrics & Fresh";

const products = [
  // --- Fabrics ---
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
  
  { id: "p24", name: "Omosquare Fresh Liquid Soap (1litre)", price: 1600, category: "fresh", image: "images/soap/soap2.jpg" },
];

let cart = JSON.parse(localStorage.getItem("os_cart_v1") || "[]");

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

// Helpers
function formatNaira(n) { return "₦" + n.toLocaleString(); }
function saveCart() { localStorage.setItem("os_cart_v1", JSON.stringify(cart)); }
function updateCartCount() { cartCountEl.textContent = cart.reduce((a, i) => a + i.qty, 0); }

// Render products
function renderProducts(filter = "all") {
  productListEl.innerHTML = "";
  const list = filter === "all" ? products : products.filter(p => p.category === filter);

  // Add soft green bg for Omosquare Fresh
  if (filter === "fresh") productListEl.classList.add("fresh-bg");
  else productListEl.classList.remove("fresh-bg");

  list.forEach(p => {
    const el = document.createElement("article");
    el.className = "bg-white/6 rounded-xl overflow-hidden shadow-sm flex flex-col";
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="w-full h-36 object-cover">
      <div class="p-3 flex flex-col flex-1 justify-between">
        <div>
          <h4 class="font-semibold text-sm md:text-base">${p.name}</h4>
          <div class="text-xs text-white/80 mt-1">${formatNaira(p.price)}</div>
        </div>
        <button class="add-btn mt-3 bg-kampala-accent text-black hover:bg-ankara-yellow text-sm font-semibold py-2 rounded-lg transition" data-id="${p.id}">Add to Cart</button>
      </div>`;
    productListEl.appendChild(el);
  });

  document.querySelectorAll(".add-btn").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.id)));
}

// Cart operations
function addToCart(id) {
  const prod = products.find(p => p.id === id);
  const exist = cart.find(i => i.id === id);
  if (exist) exist.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  saveCart(); updateCartCount(); renderCart();
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); renderCart(); updateCartCount(); }
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(); renderCart(); updateCartCount();
}

// Render cart
function renderCart() {
  cartItemsEl.innerHTML = "";
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="text-center text-white/70 py-8">Your cart is empty.</div>`;
    cartTotalEl.textContent = "₦0";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "flex items-center justify-between bg-white/5 rounded-lg p-3";
    div.innerHTML = `
      <div>
        <p class="font-semibold text-sm">${item.name}</p>
        <p class="text-xs text-white/60">${formatNaira(item.price)} × ${item.qty}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="minus px-2 py-1 bg-white/10 rounded">−</button>
        <button class="plus px-2 py-1 bg-white/10 rounded">+</button>
        <button class="remove text-xs underline text-white/70">Remove</button>
      </div>`;
    cartItemsEl.appendChild(div);

    div.querySelector(".minus").addEventListener("click", () => changeQty(item.id, -1));
    div.querySelector(".plus").addEventListener("click", () => changeQty(item.id, 1));
    div.querySelector(".remove").addEventListener("click", () => removeFromCart(item.id));
  });
  cartTotalEl.textContent = formatNaira(total);
}

// WhatsApp checkout
function buildWhatsAppMessage() {
  if (cart.length === 0) return null;
  let msg = `Hello ${STORE_NAME}, I would like to order:\n`;
  let total = 0;
  cart.forEach(item => {
    msg += `• ${item.name} × ${item.qty} — ₦${(item.price * item.qty).toLocaleString()}\n`;
    total += item.price * item.qty;
  });
  msg += `\nTotal: ₦${total.toLocaleString()}\n\nName:\nAddress:`;
  return encodeURIComponent(msg);
}

function openWhatsAppCheckout() {
  const encoded = buildWhatsAppMessage();
  if (!encoded) {
    alert("Your cart is empty!");
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

// Event listeners
document.querySelectorAll(".filter-btn").forEach(b => {
  b.addEventListener("click", () => {
    const cat = b.dataset.cat;
    renderProducts(cat);
    document.querySelectorAll(".filter-btn").forEach(x => x.classList.remove("bg-kampala", "text-white"));
    b.classList.add("bg-kampala", "text-white");
  });
});

cartToggleBtn.addEventListener("click", () => { cartModal.classList.remove("hidden"); renderCart(); });
cartBackdrop.addEventListener("click", () => cartModal.classList.add("hidden"));
closeCartBtn.addEventListener("click", () => cartModal.classList.add("hidden"));
clearCartBtn.addEventListener("click", () => {
  if (confirm("Clear all items?")) {
    cart = []; saveCart(); renderCart(); updateCartCount();
  }
});
cartCheckoutBtn.addEventListener("click", openWhatsAppCheckout);

// Init
(function init() {
  renderProducts();
  updateCartCount();
})();
