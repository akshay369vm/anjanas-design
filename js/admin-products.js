import { db, IMGBB_API_KEY } from './firebase-config.js';
import {
    collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
    serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

let allProducts = [];

export function initProducts() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.getElementById('productForm');
    const productSearch = document.getElementById('productSearch');
    const fileInput = document.getElementById('pImageFile');

    if (addProductBtn) addProductBtn.addEventListener('click', openAddProduct);
    if (productForm) productForm.addEventListener('submit', handleProductSubmit);
    if (productSearch) productSearch.addEventListener('input', searchProducts);

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.src = URL.createObjectURL(file);
                    preview.style.display = 'block';
                }
            }
        });
    }
    fetchProducts();
}

export async function fetchProducts() {
    const tbody = document.getElementById('productTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading products...</td></tr>';
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        allProducts = [];
        snap.forEach(d => {
            const data = d.data();
            // Migrate old 'stock' field to inventory if needed
            if (data.stock !== undefined && !data.inventory) {
                data.inventory = { "M": data.stock };
            }
            // Ensure stock is sum of inventory
            if (data.inventory) {
                data.stock = Object.values(data.inventory).reduce((a, b) => a + b, 0);
            }
            allProducts.push({ id: d.id, ...data });
        });
        renderProductTable(allProducts);
    } catch (err) {
        console.error("Fetch products error:", err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="loading-cell" style="color:var(--danger)">${err.message}</td></tr>`;
    }
}

function renderProductTable(products) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No products found. Add some!</td></tr>';
        return;
    }
    tbody.innerHTML = products.map(p => {
        const stock = p.stock ?? 0;
        const stockClass = stock <= 5 ? 'stock-low' : 'stock-ok';
        const badgeMap = { 'budget-love': 'badge-budget', 'classic-love': 'badge-classic', 'festive-love': 'badge-festive', 'luxury-love': 'badge-luxury' };
        return `<tr>
            <td><img src="${p.image}" alt="${p.name}" class="product-img-sm" onerror="this.src='assets/placeholder.jpg'"></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge ${badgeMap[p.category] || ''}">${(p.category || '').replace('-', ' ')}</span></td>
            <td>₹${p.price}${p.originalPrice ? ` <s style="color:var(--text-muted);font-size:.8rem">₹${p.originalPrice}</s>` : ''}</td>
            <td>
                <div class="stock-control">
                    <button class="stock-btn" onclick="window._updateStock('${p.id}', -1)">−</button>
                    <span class="stock-value ${stockClass}">${stock}</span>
                    <button class="stock-btn" onclick="window._updateStock('${p.id}', 1)">+</button>
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn btn-edit" onclick="window._editProduct('${p.id}')">✏️ Edit</button>
                    <button class="action-btn btn-delete" onclick="window._deleteProduct('${p.id}','${p.name.replace(/'/g, "\\'")}')">🗑️</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function openAddProduct() {
    const title = document.getElementById('productModalTitle');
    const submitBtn = document.getElementById('productSubmitBtn');
    const form = document.getElementById('productForm');
    const modal = document.getElementById('productModal');
    
    if (title) title.textContent = 'Add New Product';
    if (submitBtn) submitBtn.textContent = 'Add Product';
    if (form) form.reset();
    
    const editId = document.getElementById('editProductId');
    const existingUrl = document.getElementById('existingImageUrl');
    const preview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('pImageFile');
    
    if (editId) editId.value = '';
    if (existingUrl) existingUrl.value = '';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.required = true;
    
    document.querySelectorAll('.size-stock-input').forEach(input => {
        input.value = 0;
    });
    
    if (modal) modal.classList.add('active');
}

window._editProduct = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    
    const title = document.getElementById('productModalTitle');
    const submitBtn = document.getElementById('productSubmitBtn');
    const editId = document.getElementById('editProductId');
    const existingUrl = document.getElementById('existingImageUrl');
    const pName = document.getElementById('pName');
    const pCategory = document.getElementById('pCategory');
    const pPrice = document.getElementById('pPrice');
    const pOriginal = document.getElementById('pOriginal');
    const fileInput = document.getElementById('pImageFile');
    const preview = document.getElementById('imagePreview');
    
    if (title) title.textContent = 'Edit Product';
    if (submitBtn) submitBtn.textContent = 'Save Changes';
    if (editId) editId.value = id;
    if (existingUrl) existingUrl.value = p.image || '';
    if (pName) pName.value = p.name;
    if (pCategory) pCategory.value = p.category;
    if (pPrice) pPrice.value = p.price;
    if (pOriginal) pOriginal.value = p.originalPrice || '';
    if (fileInput) fileInput.required = false;
    
    if (preview) {
        preview.src = p.image;
        preview.style.display = 'block';
    }

    const inventory = p.inventory || {};
    document.querySelectorAll('.size-stock-input').forEach(input => {
        const size = input.dataset.size;
        input.value = inventory[size] || 0;
    });

    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('active');
};

async function handleProductSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('productSubmitBtn');
    const editId = document.getElementById('editProductId').value;
    
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Uploading...';
    }
    
    try {
        let imageUrl = document.getElementById('existingImageUrl').value;
        const file = document.getElementById('pImageFile').files[0];
        if (file) {
            imageUrl = await uploadToImgBB(file);
        }
        if (!imageUrl) throw new Error("Please select an image.");

        const data = {
            name: document.getElementById('pName').value.trim(),
            image: imageUrl,
            category: document.getElementById('pCategory').value,
            price: Number(document.getElementById('pPrice').value),
            originalPrice: document.getElementById('pOriginal').value ? Number(document.getElementById('pOriginal').value) : null,
            inventory: {}
        };

        let totalStock = 0;
        document.querySelectorAll('.size-stock-input').forEach(input => {
            const qty = Number(input.value) || 0;
            if (qty > 0) {
                data.inventory[input.dataset.size] = qty;
                totalStock += qty;
            }
        });
        data.stock = totalStock;
        data.sizes = Object.keys(data.inventory);

        if (editId) {
            await updateDoc(doc(db, "products", editId), data);
            window.showToast('Product updated!');
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), data);
            window.showToast('Product added!');
        }
        
        const modal = document.getElementById('productModal');
        if (modal) modal.classList.remove('active');
        fetchProducts();
    } catch (err) {
        console.error("Product save error:", err);
        window.showToast('Error: ' + err.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = editId ? 'Save Changes' : 'Add Product';
        }
    }
}

async function uploadToImgBB(file) {
    if (IMGBB_API_KEY === "YOUR_IMGBB_API_KEY") {
        throw new Error("Please set your ImgBB API Key in js/firebase-config.js");
    }
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error?.message || "ImgBB upload failed");
    return json.data.url;
}

window._deleteProduct = async function (id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
        await deleteDoc(doc(db, "products", id));
        window.showToast('Product deleted');
        fetchProducts();
    } catch (err) {
        window.showToast('Delete failed: ' + err.message, 'error');
    }
};

window._updateStock = async function (id, delta) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const newStock = Math.max(0, (p.stock ?? 0) + delta);
    try {
        await updateDoc(doc(db, "products", id), { stock: newStock });
        p.stock = newStock;
        renderProductTable(allProducts);
    } catch (err) {
        window.showToast('Stock update failed', 'error');
    }
};

function searchProducts(e) {
    const term = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term)
    );
    renderProductTable(filtered);
}
