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
const contoForm = document.getElementById("conto-form");
const listaContos = document.getElementById("lista-contos");
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
    carregarListaContos();
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
    carregarListaContos();
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
    mostrarMensagem("Erro ao carregar lista de contos!", "danger");
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
      btnSalvar.textContent = "Atualizar Conto";
      btnSalvar.onclick = () => atualizarConto(id);
    }
  } catch (error) {
    console.error("Erro ao carregar conto para edição:", error);
    mostrarMensagem("Erro ao carregar conto para edição!", "danger");
  }
}

// Função para atualizar conto
async function atualizarConto(id) {
  const titulo = document.getElementById("titulo").value.trim();
  const categorias = document.getElementById("categorias").value.trim();
  const conteudo = document.getElementById("conteudo").value.trim();

  if (!titulo || !conteudo) {
    mostrarMensagem("Preencha todos os campos obrigatórios!", "danger");
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
    btnSalvar.textContent = "Salvar Conto";
    btnSalvar.onclick = salvarConto;

    mostrarMensagem("Conto atualizado com sucesso!", "success");
    carregarListaContos();
  } catch (error) {
    console.error("Erro ao atualizar conto:", error);
    mostrarMensagem("Erro ao atualizar conto!", "danger");
  }
}

// Função para excluir conto
async function excluirConto(id) {
  if (confirm("Tem certeza que deseja excluir este conto?")) {
    try {
      await deleteDoc(doc(db, "Contos", id));
      mostrarMensagem("Conto excluído com sucesso!", "success");
      carregarListaContos();
    } catch (error) {
      console.error("Erro ao excluir conto:", error);
      mostrarMensagem("Erro ao excluir conto!", "danger");
    }
  }
}
