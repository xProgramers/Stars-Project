// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Configurações
const SENHA_ADMIN = "admin123";

// Elementos DOM
const loginForm = document.getElementById("login-form");
const adminContent = document.getElementById("admin-content");
const listaContos = document.getElementById("lista-contos");
const listaVideos = document.getElementById("lista-videos");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btn-login");
const btnSalvarConto = document.getElementById("btn-salvar-conto");
const btnSalvarVideo = document.getElementById("btn-salvar-video");
const btnSair = document.getElementById("btn-sair");
const mensagemConto = document.getElementById("mensagem-conto");
const mensagemVideo = document.getElementById("mensagem-video");

// Event Listeners
btnLogin.addEventListener("click", fazerLogin);
btnSalvarConto.addEventListener("click", salvarConto);
btnSalvarVideo.addEventListener("click", salvarVideo);
btnSair.addEventListener("click", sair);

// Verifica se já está logado ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const logado = localStorage.getItem("adminLogado");
  if (logado === "true") {
    mostrarAdminContent();
    carregarListaContos();
    carregarListaVideos();
  }
});

// Função para autenticar
function fazerLogin(e) {
  e.preventDefault();

  if (senhaInput.value === SENHA_ADMIN) {
    localStorage.setItem("adminLogado", "true");
    mostrarAdminContent();
    mostrarMensagem("Login realizado com sucesso!", "success", mensagemConto);
  } else {
    mostrarMensagem("Senha incorreta!", "danger", mensagemConto);
    senhaInput.value = "";
  }
}

// Mostra o conteúdo administrativo
function mostrarAdminContent() {
  loginForm.style.display = "none";
  adminContent.style.display = "block";
}

// Salva um novo conto no Firestore
async function salvarConto(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const categorias = document.getElementById("categorias").value.trim();
  const conteudo = document.getElementById("conteudo").value.trim();

  if (!titulo || !conteudo) {
    mostrarMensagem("Preencha todos os campos obrigatórios!", "danger", mensagemConto);
    return;
  }

  try {
    await addDoc(collection(db, "Contos"), {
      titulo,
      categorias: categorias.split(",").map((cat) => cat.trim()),
      conteudo,
      data: new Date().toISOString(),
    });

    document.getElementById("titulo").value = "";
    document.getElementById("categorias").value = "";
    document.getElementById("conteudo").value = "";

    mostrarMensagem("Conto salvo com sucesso!", "success", mensagemConto);
    carregarListaContos();
  } catch (error) {
    console.error("Erro ao salvar conto:", error);
    mostrarMensagem("Erro ao salvar conto!", "danger", mensagemConto);
  }
}

// Salva um novo vídeo no Firestore
async function salvarVideo(e) {
  e.preventDefault();

  const iframeUrl = document.getElementById("iframe-url").value.trim();
  const titulo = document.getElementById("video-titulo").value.trim();

  if (!iframeUrl || !titulo) {
    mostrarMensagem("Preencha todos os campos obrigatórios!", "danger", mensagemVideo);
    return;
  }

  try {
    // Extrai a URL do src do iframe se for um código iframe completo
    let finalUrl = iframeUrl;
    if (iframeUrl.includes("<iframe")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(iframeUrl, "text/html");
      const iframe = doc.querySelector("iframe");
      finalUrl = iframe ? iframe.src : iframeUrl;
    }

    await addDoc(collection(db, "Videos"), {
      iframeUrl: finalUrl, // Salva apenas a URL
      titulo,
      data: new Date().toISOString(),
    });

    document.getElementById("iframe-url").value = "";
    document.getElementById("video-titulo").value = "";

    mostrarMensagem("Vídeo salvo com sucesso!", "success", mensagemVideo);
    carregarListaVideos();
  } catch (error) {
    console.error("Erro ao salvar vídeo:", error);
    mostrarMensagem("Erro ao salvar vídeo!", "danger", mensagemVideo);
  }
}

// Função para logout
function sair() {
  localStorage.removeItem("adminLogado");
  loginForm.style.display = "block";
  adminContent.style.display = "none";
  senhaInput.value = "";
}

// Mostra mensagens de feedback
function mostrarMensagem(texto, tipo, elemento) {
  elemento.textContent = texto;
  elemento.className = `mt-3 alert alert-${tipo}`;
  elemento.style.display = "block";

  setTimeout(() => {
    elemento.style.display = "none";
  }, 3000);
}

// Função para carregar lista de contos
async function carregarListaContos() {
  try {
    const q = query(collection(db, "Contos"), orderBy("data", "desc"));
    const snapshot = await getDocs(q);

    listaContos.innerHTML = "";

    snapshot.forEach((doc) => {
      const conto = doc.data();
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${conto.titulo}</span>
        <div>
          <button class="btn btn-sm btn-primary me-2" data-id="${doc.id}">Editar</button>
          <button class="btn btn-sm btn-danger" data-id="${doc.id}">Excluir</button>
        </div>
      `;
      listaContos.appendChild(li);
    });

    // Adiciona os event listeners para os botões
    document.querySelectorAll(".btn-primary").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        editarConto(e.target.dataset.id);
      });
    });

    document.querySelectorAll(".btn-danger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        excluirConto(e.target.dataset.id);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar contos:", error);
    mostrarMensagem("Erro ao carregar lista de contos!", "danger", mensagemConto);
  }
}

// Função para carregar lista de vídeos
async function carregarListaVideos() {
  try {
    const q = query(collection(db, "Videos"), orderBy("data", "desc"));
    const snapshot = await getDocs(q);

    listaVideos.innerHTML = "";

    snapshot.forEach((doc) => {
      const video = doc.data();
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${video.titulo}</span>
        <div>
          <button class="btn btn-sm btn-primary me-2" data-id="${doc.id}">Editar</button>
          <button class="btn btn-sm btn-danger" data-id="${doc.id}">Excluir</button>
        </div>
      `;
      listaVideos.appendChild(li);
    });

    // Adiciona os event listeners para os botões
    document.querySelectorAll(".btn-primary").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        editarVideo(e.target.dataset.id);
      });
    });

    document.querySelectorAll(".btn-danger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        excluirVideo(e.target.dataset.id);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar vídeos:", error);
    mostrarMensagem("Erro ao carregar lista de vídeos!", "danger", mensagemVideo);
  }
}

// Função para editar conto
async function editarConto(id) {
  try {
    const contoRef = doc(db, "Contos", id);
    const contoDoc = await getDoc(contoRef);

    if (contoDoc.exists()) {
      const conto = contoDoc.data();
      document.getElementById("titulo").value = conto.titulo;
      document.getElementById("categorias").value = conto.categorias.join(", ");
      document.getElementById("conteudo").value = conto.conteudo;

      // Modifica o botão de salvar para atualizar
      btnSalvarConto.textContent = "Atualizar Conto";
      btnSalvarConto.onclick = () => atualizarConto(id);
    }
  } catch (error) {
    console.error("Erro ao carregar conto para edição:", error);
    mostrarMensagem("Erro ao carregar conto para edição!", "danger", mensagemConto);
  }
}

// Função para editar vídeo
async function editarVideo(id) {
  try {
    const videoRef = doc(db, "Videos", id);
    const videoDoc = await getDoc(videoRef);

    if (videoDoc.exists()) {
      const video = videoDoc.data();
      document.getElementById("iframe-url").value = video.iframeUrl;
      document.getElementById("video-titulo").value = video.titulo;

      // Modifica o botão de salvar para atualizar
      btnSalvarVideo.textContent = "Atualizar Vídeo";
      btnSalvarVideo.onclick = () => atualizarVideo(id);
    }
  } catch (error) {
    console.error("Erro ao carregar vídeo para edição:", error);
    mostrarMensagem("Erro ao carregar vídeo para edição!", "danger", mensagemVideo);
  }
}

// Função para atualizar conto
async function atualizarConto(id) {
  const titulo = document.getElementById("titulo").value.trim();
  const categorias = document.getElementById("categorias").value.trim();
  const conteudo = document.getElementById("conteudo").value.trim();

  if (!titulo || !conteudo) {
    mostrarMensagem("Preencha todos os campos obrigatórios!", "danger", mensagemConto);
    return;
  }

  try {
    const contoRef = doc(db, "Contos", id);
    await updateDoc(contoRef, {
      titulo,
      categorias: categorias.split(",").map((cat) => cat.trim()),
      conteudo,
      data: new Date().toISOString(),
    });

    // Limpa o formulário e restaura o botão de salvar
    document.getElementById("titulo").value = "";
    document.getElementById("categorias").value = "";
    document.getElementById("conteudo").value = "";
    btnSalvarConto.textContent = "Salvar Conto";
    btnSalvarConto.onclick = salvarConto;

    mostrarMensagem("Conto atualizado com sucesso!", "success", mensagemConto);
    carregarListaContos();
  } catch (error) {
    console.error("Erro ao atualizar conto:", error);
    mostrarMensagem("Erro ao atualizar conto!", "danger", mensagemConto);
  }
}

// Função para atualizar vídeo
async function atualizarVideo(id) {
  const iframeUrl = document.getElementById("iframe-url").value.trim();
  const titulo = document.getElementById("video-titulo").value.trim();

  if (!iframeUrl || !titulo) {
    mostrarMensagem("Preencha todos os campos obrigatórios!", "danger", mensagemVideo);
    return;
  }

  try {
    const videoRef = doc(db, "Videos", id);
    await updateDoc(videoRef, {
      iframeUrl,
      titulo,
      data: new Date().toISOString(),
    });

    // Limpa o formulário e restaura o botão de salvar
    document.getElementById("iframe-url").value = "";
    document.getElementById("video-titulo").value = "";
    btnSalvarVideo.textContent = "Salvar Vídeo";
    btnSalvarVideo.onclick = salvarVideo;

    mostrarMensagem("Vídeo atualizado com sucesso!", "success", mensagemVideo);
    carregarListaVideos();
  } catch (error) {
    console.error("Erro ao atualizar vídeo:", error);
    mostrarMensagem("Erro ao atualizar vídeo!", "danger", mensagemVideo);
  }
}

// Função para excluir conto
async function excluirConto(id) {
  if (confirm("Tem certeza que deseja excluir este conto?")) {
    try {
      await deleteDoc(doc(db, "Contos", id));
      mostrarMensagem("Conto excluído com sucesso!", "success", mensagemConto);
      carregarListaContos();
    } catch (error) {
      console.error("Erro ao excluir conto:", error);
      mostrarMensagem("Erro ao excluir conto!", "danger", mensagemConto);
    }
  }
}

// Função para excluir vídeo
async function excluirVideo(id) {
  if (confirm("Tem certeza que deseja excluir este vídeo?")) {
    try {
      await deleteDoc(doc(db, "Videos", id));
      mostrarMensagem("Vídeo excluído com sucesso!", "success", mensagemVideo);
      carregarListaVideos();
    } catch (error) {
      console.error("Erro ao excluir vídeo:", error);
      mostrarMensagem("Erro ao excluir vídeo!", "danger", mensagemVideo);
    }
  }
}
