// admin.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, deleteDoc, onSnapshot, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ---------- Firebase config (your config) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyAyaEpXKLbeFCd1dzikTDtHW4UIJcSnNEc",
  authDomain: "omosquare-fabrics.firebaseapp.com",
  projectId: "omosquare-fabrics",
  storageBucket: "omosquare-fabrics.firebasestorage.app",
  messagingSenderId: "460244510484",
  appId: "1:460244510484:web:e947ae53c79045b840c401"
};
/* -------------------------------------------------- */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Cloudinary values (provided)
const CLOUDINARY_CLOUD_NAME = "dqmtponfc";
const CLOUDINARY_UPLOAD_PRESET = "Omosquarefabrics"; // exact preset name

// DOM
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const createBtn = document.getElementById('create-btn');
const logoutBtn = document.getElementById('logout-btn');
const ownerEmailEl = document.getElementById('owner-email');
const ownerUidEl = document.getElementById('owner-uid');
const adminPanel = document.getElementById('admin-panel');
const signedIn = document.getElementById('signed-in');
const authForms = document.getElementById('auth-forms');
const loader = document.getElementById('loader');

const prodName = document.getElementById('prod-name');
const prodPrice = document.getElementById('prod-price');
const prodCategory = document.getElementById('prod-category');
const prodImage = document.getElementById('prod-image');
const imgPreview = document.getElementById('img-preview');
const saveBtn = document.getElementById('save-prod');
const prodListEl = document.getElementById('prod-list');
const cancelEdit = document.getElementById('cancel-edit');

let editingId = null;
let unsubscribe = null;

// Auth handlers
loginBtn.addEventListener('click', async () => {
  try { loader.classList.remove('hidden'); await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value); }
  catch (e) { alert(e.message); } finally { loader.classList.add('hidden'); }
});
createBtn.addEventListener('click', async () => {
  try { loader.classList.remove('hidden'); await createUserWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value); alert('Account created. Please log in.'); }
  catch (e) { alert(e.message); } finally { loader.classList.add('hidden'); }
});
logoutBtn.addEventListener('click', async ()=>{ await signOut(auth); });

onAuthStateChanged(auth, (user) => {
  if (user) {
    authForms.classList.add('hidden'); signedIn.classList.remove('hidden'); adminPanel.classList.remove('hidden');
    ownerEmailEl.textContent = user.email; ownerUidEl.textContent = 'UID: ' + user.uid;
    startProductsListener();
  } else {
    authForms.classList.remove('hidden'); signedIn.classList.add('hidden'); adminPanel.classList.add('hidden'); stopProductsListener();
  }
});

// Image preview
prodImage.addEventListener('change', () => {
  const f = prodImage.files[0];
  if (!f) { imgPreview.innerHTML = ''; return; }
  imgPreview.innerHTML = `<img src="${URL.createObjectURL(f)}" class="w-32 h-32 object-cover rounded" />`;
});

// Save product: upload image to Cloudinary (unsigned) then save doc to Firestore
saveBtn.addEventListener('click', async () => {
  const name = prodName.value.trim();
  const price = Number(prodPrice.value);
  const category = prodCategory.value;
  if (!name || !price || !category) { alert('Please fill name, price and category'); return; }

  try {
    loader.classList.remove('hidden');

    let imageUrl = '';
    if (prodImage.files && prodImage.files[0]) {
      const file = prodImage.files[0];
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      imageUrl = data.secure_url;
    }

    const payload = { name, price, category, image: imageUrl || '', createdAt: Date.now() };

    if (editingId) {
      await updateDoc(doc(db, 'products', editingId), payload);
      editingId = null;
    } else {
      await addDoc(collection(db, 'products'), payload);
    }

    prodName.value=''; prodPrice.value=''; prodImage.value=''; imgPreview.innerHTML='';
  } catch (e) {
    alert('Error: ' + e.message);
  } finally { loader.classList.add('hidden'); }
});

cancelEdit.addEventListener('click', ()=>{ editingId=null; prodName.value=''; prodPrice.value=''; prodImage.value=''; imgPreview.innerHTML=''; });

// Products listener (shows list in admin)
function startProductsListener(){
  if (unsubscribe) return;
  const qCol = collection(db, 'products');
  unsubscribe = onSnapshot(qCol, (snap) => {
    prodListEl.innerHTML = '';
    snap.forEach(docSnap => {
      const data = docSnap.data(); const id = docSnap.id;
      const item = document.createElement('div');
      item.className = 'p-2 bg-white/5 rounded flex items-center gap-3';
      item.innerHTML = `
        <img src="${data.image || ''}" class="w-16 h-16 object-cover rounded ${data.image ? '' : 'bg-white/10'}" />
        <div class="flex-1">
          <div class="font-semibold text-sm">${data.name}</div>
          <div class="text-xs text-white/70">₦${Number(data.price).toLocaleString()} • ${data.category}</div>
        </div>
        <div class="flex flex-col gap-2">
          <button data-id="${id}" class="edit-btn text-xs bg-white/10 px-2 py-1 rounded">Edit</button>
          <button data-id="${id}" class="del-btn text-xs bg-ankara-red px-2 py-1 rounded">Delete</button>
        </div>
      `;
      prodListEl.appendChild(item);
    });

    // attach handlers
    document.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.target.dataset.id; if (!confirm('Delete product?')) return; await deleteDoc(doc(db, 'products', id));
    }));

    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.target.dataset.id; editingId = id;
      const docSnap = await getDoc(doc(db, 'products', id)); if (!docSnap.exists()) return alert('Missing');
      const data = docSnap.data();
      prodName.value = data.name || ''; prodPrice.value = data.price || ''; prodCategory.value = data.category || 'adire';
      if (data.image) imgPreview.innerHTML = `<img src="${data.image}" class="w-32 h-32 object-cover rounded" />`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }, (err) => console.error('Products listener error', err));
}

function stopProductsListener(){ if (unsubscribe) { unsubscribe(); unsubscribe = null; } prodListEl.innerHTML = ''; }
