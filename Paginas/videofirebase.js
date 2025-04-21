// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDNNijPd8smx7BdtKpXODzuLN6zDdtshkw",
  authDomain: "contos-990b5.firebaseapp.com",
  projectId: "contos-990b5",
  storageBucket: "contos-990b5.firebasestorage.app",
  messagingSenderId: "791897273039",
  appId: "1:791897273039:web:d8415f5dbd904219d37dba",
  measurementId: "G-X398G31NFG",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Carrega os vídeos da aba Achadinhos
async function carregarVideosAchadinhos() {
  try {
    const container = document.getElementById("achadinhos-container");
    if (!container) {
      console.error("Container de vídeos não encontrado");
      return;
    }

    container.className = "iframe-container";
    const q = query(collection(db, "Videos"), orderBy("data", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";

    snapshot.forEach((doc) => {
      // Cria um container para cada vídeo e suas informações
      const videoContainer = document.createElement("div");
      videoContainer.className = "video-container";

      // Cria o elemento para o título
      const info = document.createElement("div");
      info.className = "video-info";
      info.innerHTML = `<h3>${doc.data().titulo}</h3>`;

      // Cria o wrapper do vídeo
      const wrapper = document.createElement("div");
      wrapper.className = "video-item";

      // Cria o iframe
      const iframe = document.createElement("iframe");
      iframe.src = doc.data().iframeUrl;
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("frameborder", "0");

      // Monta a estrutura
      wrapper.appendChild(iframe);
      videoContainer.appendChild(info); // Título primeiro
      videoContainer.appendChild(wrapper); // Vídeo depois
      container.appendChild(videoContainer); // Adiciona ao container principal
    });
  } catch (error) {
    console.error("Erro ao carregar vídeos:", error);
  }
}

// Carrega os vídeos quando a página é carregada
document.addEventListener("DOMContentLoaded", () => {
  carregarVideosAchadinhos();
});

// Recarrega os vídeos quando a aba é clicada
const achadinhosTab = document.getElementById("achadinhoss-tab");
if (achadinhosTab) {
  achadinhosTab.addEventListener("click", () => {
    carregarVideosAchadinhos();
  });
}

// Adiciona um listener para o evento de mudança de aba
const videoTabs = document.getElementById("videoTabs");
if (videoTabs) {
  videoTabs.addEventListener("click", (e) => {
    if (e.target.id === "achadinhoss-tab") {
      carregarVideosAchadinhos();
    }
  });
}
