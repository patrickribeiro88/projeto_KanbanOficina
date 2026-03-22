document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formAgendamento");
  const mensagemSucesso = document.getElementById("mensagemSucesso");
  const btnNovoAgendamento = document.getElementById("btnNovoAgendamento");
  const inputPlaca = document.getElementById("placa");
  const inputTelefone = document.getElementById("telefone");
  const inputData = document.getElementById("dataPreferencial");

  definirDataMinima(inputData);
  aplicarMascaraTelefone(inputTelefone);
  aplicarFormatoPlaca(inputPlaca);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const dadosAgendamento = coletarDadosFormulario();
    salvarNoLocalStorage(dadosAgendamento);

    form.classList.add("d-none");
    mensagemSucesso.classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  btnNovoAgendamento.addEventListener("click", () => {
    form.reset();
    form.classList.remove("d-none");
    mensagemSucesso.classList.add("d-none");
    limparValidacoes();
    definirDataMinima(inputData);
  });
});

function definirDataMinima(inputData) {
  const hoje = new Date().toISOString().split("T")[0];
  inputData.min = hoje;
}

function aplicarMascaraTelefone(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
      valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
      valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    }

    input.value = valor;
  });
}

function aplicarFormatoPlaca(input) {
  input.addEventListener("input", () => {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  });
}

function validarFormulario() {
  const campos = [
    "nome",
    "telefone",
    "email",
    "modelo",
    "ano",
    "placa",
    "tipoServico",
    "dataPreferencial",
    "descricao"
  ];

  let valido = true;

  campos.forEach((id) => {
    const campo = document.getElementById(id);

    if (!campo.value.trim()) {
      campo.classList.add("is-invalid");
      campo.classList.remove("is-valid");
      valido = false;
    } else {
      campo.classList.remove("is-invalid");
      campo.classList.add("is-valid");
    }
  });

  const email = document.getElementById("email");
  if (!validarEmail(email.value.trim())) {
    email.classList.add("is-invalid");
    email.classList.remove("is-valid");
    valido = false;
  }

  const placa = document.getElementById("placa");
  if (placa.value.trim().length < 7) {
    placa.classList.add("is-invalid");
    placa.classList.remove("is-valid");
    valido = false;
  }

  return valido;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function coletarDadosFormulario() {
  return {
    id: Date.now(),
    os: gerarNumeroOSGenerico(),
    nome: document.getElementById("nome").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    email: document.getElementById("email").value.trim(),
    modelo: document.getElementById("modelo").value.trim(),
    ano: document.getElementById("ano").value.trim(),
    placa: document.getElementById("placa").value.trim().toUpperCase(),
    tipoServico: document.getElementById("tipoServico").value,
    dataPreferencial: document.getElementById("dataPreferencial").value,
    descricao: document.getElementById("descricao").value.trim(),
    status: "triagem",
    tecnico: "",
    origem: "cliente",
    criadoEm: new Date().toLocaleString("pt-BR")
  };
}

function gerarNumeroOSGenerico() {
  let proximaOS = Number(localStorage.getItem("proximaOS")) || 1001;
  const numeroAtual = proximaOS;
  localStorage.setItem("proximaOS", proximaOS + 1);
  return numeroAtual;
}

function salvarNoLocalStorage(agendamento) {
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  agendamentos.push(agendamento);
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function limparValidacoes() {
  document.querySelectorAll(".form-control, .form-select").forEach((campo) => {
    campo.classList.remove("is-invalid", "is-valid");
  });
}