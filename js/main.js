import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCddVMjeRb4-6FVmpeA3A2TIc1wGzKwTTM",
    authDomain: "anjanas-design.firebaseapp.com",
    projectId: "anjanas-design",
    storageBucket: "anjanas-design.firebasestorage.app",
    messagingSenderId: "784272115162",
    appId: "1:784272115162:web:8eb21f126db9cd9a176ce3"
};

// Initialize Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase init error:", e);
}

const WHATSAPP_NUMBER = "919778022978"; // Anjana's number

// --- E-COMMERCE LOGIC ---

window.buyOnWhatsApp = function(name, price) {
    const message = `Hello Anjana's Design! 👋\n\nI am interested in:\n\n*Product:* ${name}\n*Price:* ₹${price}\n\nIs this available?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
};

// --- DYNAMIC RENDERING ---

export async function fetchAndRenderProducts(category = null) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    productGrid.innerHTML = '<div class="col-span-full text-center py-10">Loading collection...</div>';

    try {
        let q = collection(db, "products");
        if (category) {
            q = query(q, where("category", "==", category));
        }
        
        const querySnapshot = await getDocs(q);
        let products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        // --- FALLBACK SAMPLE DATA ---
        if (products.length === 0) {
            const allSamples = [
                { id: "s1", name: "Traditional Silk Saree", price: 2499, category: "vishu", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600" },
                { id: "s2", name: "Kasavu Mundu Set", price: 1899, category: "vishu", image: "https://images.unsplash.com/photo-1621236304191-b507d91b3bb6?auto=format&fit=crop&q=80&w=600" },
                { id: "s3", name: "Designer Kurti", price: 1299, category: "onam", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600" },
                { id: "s4", name: "Floral Print Set", price: 1599, category: "onam", image: "https://images.unsplash.com/photo-1617175548912-f870216b107e?auto=format&fit=crop&q=80&w=600" },
                { id: "s5", name: "Gold Border Dhavani", price: 3299, category: "vishu", image: "https://images.unsplash.com/photo-1609357605129-26f69abb5db8?auto=format&fit=crop&q=80&w=600" }
            ];
            products = category ? allSamples.filter(s => s.category === category) : allSamples;
        }

        if (products.length === 0) {
            productGrid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No products found in this collection.</div>';
            return;
        }

        productGrid.innerHTML = products.map(p => {
            const price = p.price || 0;
            const originalPrice = p.originalPrice;
            const discountHtml = originalPrice ? `<span class="text-xs text-gray-400 line-through ml-2">₹${originalPrice}</span>` : '';
            
            return `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                    <div class="relative aspect-[4/5] overflow-hidden">
                        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='assets/placeholder.jpg'">
                        ${p.stock === 0 ? '<div class="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">SOLD OUT</div>' : ''}
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-gray-800 mb-1">${p.name}</h3>
                        <div class="flex items-center mb-4">
                            <span class="text-pink-600 font-bold">₹${price}</span>
                            ${discountHtml}
                        </div>
                        <button onclick="buyOnWhatsApp('${p.name.replace(/'/g, "\\'")}', ${price})" 
                            class="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                            ${p.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed"' : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                            </svg>
                            Buy on WhatsApp
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Error fetching products:", err);
        productGrid.innerHTML = `<div class="col-span-full text-center py-10 text-red-500">Failed to load products. ${err.message}</div>`;
    }
}
