// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const contoForm = document.getElementById("conto-form");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btn-login");
const btnSalvar = document.getElementById("btn-salvar");
const btnSair = document.getElementById("btn-sair");
const mensagem = document.getElementById("mensagem");

// Event Listeners
btnLogin.addEventListener("click", fazerLogin);
btnSalvar.addEventListener("click", salvarConto);
btnSair.addEventListener("click", sair);

// Verifica se já está logado ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const logado = localStorage.getItem("adminLogado");
  if (logado === "true") {
    mostrarFormularioConto();
  }
});

// Função para autenticar
function fazerLogin(e) {
  e.preventDefault();

  if (senhaInput.value === SENHA_ADMIN) {
    localStorage.setItem("adminLogado", "true");
    mostrarFormularioConto();
    mostrarMensagem("Login realizado com sucesso!", "success");
  } else {
    mostrarMensagem("Senha incorreta!", "danger");
    senhaInput.value = "";
  }
}

// Mostra o formulário de conto
function mostrarFormularioConto() {
  loginForm.style.display = "none";
  contoForm.style.display = "block";
}

// Salva um novo conto no Firestore
async function salvarConto(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const categorias = document.getElementById("categorias").value.trim();
  const conteudo = document.getElementById("conteudo").value.trim();

  if (!titulo || !conteudo) {
    mostrarMensagem("Preencha todos os campos obrigatórios!", "danger");
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

    mostrarMensagem("Conto salvo no Firebase com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar conto:", error);
    mostrarMensagem("Erro ao salvar conto no Firebase!", "danger");
  }
}

// Função para logout
function sair() {
  localStorage.removeItem("adminLogado");
  loginForm.style.display = "block";
  contoForm.style.display = "none";
  senhaInput.value = "";
}

// Mostra mensagens de feedback
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mt-3 alert alert-${tipo}`;
  mensagem.style.display = "block";

  setTimeout(() => {
    mensagem.style.display = "none";
  }, 3000);
}
