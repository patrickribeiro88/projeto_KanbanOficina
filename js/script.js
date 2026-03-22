let proximaOS = Number(localStorage.getItem("proximaOS")) || 1001;

document.addEventListener("DOMContentLoaded", () => {
    carregarAgendamentosNoKanban();
    atualizarContadores();

    const inputBusca = document.getElementById("inputBusca");
    if (inputBusca) {
        inputBusca.addEventListener("input", filtrarCards);
    }
});

/* ==========================================
   CONTADORES
========================================== */
function atualizarContadores() {
    const colunaNovos = document.getElementById("col-novos");
    const colunaOrcamento = document.getElementById("col-orcamento");
    const colunaAndamento = document.getElementById("col-andamento");
    const colunaConcluido = document.getElementById("col-concluido");

    const qtdNovos = colunaNovos.querySelectorAll(".kanban-card").length;
    const qtdOrcamento = colunaOrcamento.querySelectorAll(".kanban-card").length;
    const qtdAndamento = colunaAndamento.querySelectorAll(".kanban-card").length;
    const qtdConcluido = colunaConcluido.querySelectorAll(".kanban-card").length;

    document.getElementById("contador-novos").innerText = qtdNovos;
    document.getElementById("contador-orcamento").innerText = qtdOrcamento;
    document.getElementById("contador-andamento").innerText = qtdAndamento;
    document.getElementById("contador-concluido").innerText = qtdConcluido;

    const caixaVazia = colunaConcluido.querySelector(".empty-state");
    if (caixaVazia) {
        if (qtdConcluido > 0) {
            caixaVazia.classList.add("d-none");
        } else {
            caixaVazia.classList.remove("d-none");
        }
    }
}

/* ==========================================
   BUSCA
========================================== */
function filtrarCards() {
    const termo = document.getElementById("inputBusca").value.toLowerCase();
    const cartoes = document.querySelectorAll(".kanban-card");

    cartoes.forEach((cartao) => {
        const textoCartao = cartao.innerText.toLowerCase();
        cartao.style.display = textoCartao.includes(termo) ? "" : "none";
    });
}

/* ==========================================
   DRAG AND DROP
========================================== */
function permitirSoltar(event) {
    event.preventDefault();
}

function arrastar(event) {
    const card = event.target.closest(".kanban-card");
    if (!card) return;

    event.dataTransfer.setData("text", card.id);

    const colunaOrigem = card.closest(".kanban-column");
    if (colunaOrigem) {
        event.dataTransfer.setData("origem", colunaOrigem.id);
    }
}

function soltar(event) {
    event.preventDefault();

    const cardId = event.dataTransfer.getData("text");
    const origemId = event.dataTransfer.getData("origem");
    const cardArrastado = document.getElementById(cardId);
    const colunaDestino = event.target.closest(".kanban-column");

    if (!colunaDestino || !cardArrastado) return;

    const cores = ["border-secondary", "border-warning", "border-primary", "border-success"];

    if (colunaDestino.id === "col-concluido" && origemId !== "col-concluido") {
        let badgeText = "OS";
        const badgeElement = cardArrastado.querySelector(".badge");

        if (badgeElement) {
            badgeText = badgeElement.innerText;
        }

        Swal.fire({
            title: "Finalizar Serviço?",
            text: `Deseja realmente finalizar a ${badgeText} e enviar uma notificação de WhatsApp para o cliente?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#198754",
            cancelButtonColor: "#6c757d",
            confirmButtonText: '<i class="bi bi-check-circle"></i> Sim, finalizar!',
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                cardArrastado.classList.remove(...cores);
                cardArrastado.classList.add("border-success");

                colunaDestino.appendChild(cardArrastado);

                atualizarStatusCard(cardArrastado.id, "concluido");
                atualizarContadores();

                Swal.fire(
                    "Notificado!",
                    "O cliente recebeu a mensagem e o veículo está pronto para retirada.",
                    "success"
                );
            }
        });
    } else {
        cardArrastado.classList.remove(...cores);

        if (colunaDestino.id === "col-novos") {
            cardArrastado.classList.add("border-secondary");
            atualizarStatusCard(cardArrastado.id, "triagem");
        } else if (colunaDestino.id === "col-orcamento") {
            cardArrastado.classList.add("border-warning");
            atualizarStatusCard(cardArrastado.id, "orcamento");
        } else if (colunaDestino.id === "col-andamento") {
            cardArrastado.classList.add("border-primary");
            atualizarStatusCard(cardArrastado.id, "andamento");
        } else if (colunaDestino.id === "col-concluido") {
            cardArrastado.classList.add("border-success");
            atualizarStatusCard(cardArrastado.id, "concluido");
        }

        colunaDestino.appendChild(cardArrastado);
        atualizarContadores();
    }
}

/* ==========================================
   EXCLUIR CARD
========================================== */
function deletarCard(elementoIcone) {
    const cartao = elementoIcone.closest(".kanban-card");
    if (!cartao) return;

    let badgeText = "esta OS";
    const badgeElement = cartao.querySelector(".badge");

    if (badgeElement) {
        badgeText = badgeElement.innerText;
    }

    Swal.fire({
        title: "Excluir Serviço?",
        text: `Tem certeza que deseja apagar ${badgeText}? Esta ação não pode ser desfeita.`,
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: '<i class="bi bi-trash"></i> Sim, excluir!',
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            removerCardDoLocalStorage(cartao.id);
            cartao.remove();
            atualizarContadores();

            Swal.fire({
                icon: "success",
                title: "Excluído!",
                text: "O cartão foi removido com sucesso.",
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

/* ==========================================
   MODAL INTERNO
========================================== */
function toggleDescricaoOutro() {
    const selectServico = document.getElementById("modalTipoServico").value;
    const divDescricao = document.getElementById("divProblemaOutro");

    if (selectServico === "Outro") {
        divDescricao.classList.remove("d-none");
    } else {
        divDescricao.classList.add("d-none");
    }
}

function salvarPedidoManual() {
    const nome = document.getElementById("modalNome").value.trim();
    const whats = document.getElementById("modalWhats").value.trim();
    const modelo = document.getElementById("modalModelo").value.trim();
    const ano = document.getElementById("modalAno").value.trim();
    const placa = document.getElementById("modalPlaca").value.trim().toUpperCase();
    const tipoServico = document.getElementById("modalTipoServico").value;
    let problemaFinal = "";

    if (!nome || !modelo || !placa || !tipoServico) {
        Swal.fire({
            icon: "error",
            title: "Atenção!",
            text: "Por favor, preencha todos os dados obrigatórios do cliente, veículo e serviço."
        });
        return;
    }

    if (tipoServico === "Outro") {
        const descricaoOutro = document.getElementById("modalProblema").value.trim();

        if (!descricaoOutro) {
            Swal.fire({
                icon: "error",
                title: "Atenção!",
                text: 'Você selecionou "Outro". Por favor, descreva o problema no campo de texto.'
            });
            return;
        }

        problemaFinal = descricaoOutro;
    } else {
        problemaFinal = tipoServico;
    }

    const novoPedido = {
        id: Date.now(),
        os: proximaOS,
        nome: nome,
        telefone: whats,
        email: "",
        modelo: modelo,
        ano: ano,
        placa: placa,
        tipoServico: tipoServico,
        descricao: problemaFinal,
        dataPreferencial: "",
        status: "triagem",
        tecnico: "",
        origem: "interno",
        criadoEm: new Date().toLocaleString("pt-BR")
    };

    salvarAgendamento(novoPedido);
    carregarAgendamentosNoKanban();

    localStorage.setItem("proximaOS", proximaOS + 1);
    proximaOS++;

    const modalElement = document.getElementById("modalNovoPedido");
    const modalInstancia = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstancia.hide();

    document.getElementById("formNovoPedidoModal").reset();
    document.getElementById("divProblemaOutro").classList.add("d-none");

    atualizarContadores();

    Swal.fire({
        icon: "success",
        title: "Pedido registrado com sucesso!",
        text: "A nova OS foi adicionada na coluna Triagem.",
        showConfirmButton: false,
        timer: 1800
    });
}

/* ==========================================
   KANBAN / LOCAL STORAGE
========================================== */
function carregarAgendamentosNoKanban() {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    document.querySelectorAll(".kanban-card[data-dinamico='true']").forEach((card) => {
        card.remove();
    });

    agendamentos.forEach((agendamento) => {
        const card = criarCardHTML(agendamento);
        const coluna = obterColunaPorStatus(agendamento.status);
        coluna.appendChild(card);
    });
}

function criarCardHTML(dados) {
    const card = document.createElement("div");
    card.className = `card kanban-card shadow-sm border-0 border-start border-4 ${obterClasseBorda(dados.status)} mt-2`;
    card.id = `card-${dados.id}`;
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "arrastar(event)");
    card.setAttribute("data-dinamico", "true");

    card.innerHTML = `
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-light text-dark border border-secondary-subtle fw-semibold">
                    OS #${dados.os}
                </span>
                <div>
                    <small class="text-muted me-2">
                        <i class="bi bi-clock me-1"></i>${dados.criadoEm || ""}
                    </small>
                    <i class="bi bi-trash text-danger" style="cursor: pointer;" onclick="deletarCard(this)" title="Excluir OS"></i>
                </div>
            </div>

            <h6 class="card-title fw-bold mb-1 text-truncate">${dados.modelo} (${dados.ano})</h6>
            <p class="card-text text-muted small mb-2">
                <i class="bi bi-person me-1"></i>${dados.nome}
            </p>

            <div class="bg-light rounded p-2 mb-2 small text-secondary border">
                <i class="bi bi-tools me-1"></i>${dados.tipoServico}
            </div>

            <div class="bg-danger-subtle rounded p-2 mb-3 small text-danger border border-danger-subtle">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>${dados.descricao}
            </div>

            <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                <span class="badge-placa">${dados.placa}</span>
            </div>
        </div>
    `;

    return card;
}

function obterColunaPorStatus(status) {
    switch (status) {
        case "orcamento":
            return document.getElementById("col-orcamento");
        case "andamento":
            return document.getElementById("col-andamento");
        case "concluido":
            return document.getElementById("col-concluido");
        case "triagem":
        default:
            return document.getElementById("col-novos");
    }
}

function obterClasseBorda(status) {
    switch (status) {
        case "orcamento":
            return "border-warning";
        case "andamento":
            return "border-primary";
        case "concluido":
            return "border-success";
        case "triagem":
        default:
            return "border-secondary";
    }
}

function atualizarStatusCard(cardId, novoStatus) {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    const idNumerico = Number(cardId.replace("card-", ""));

    const atualizado = agendamentos.map((item) => {
        if (item.id === idNumerico) {
            return { ...item, status: novoStatus };
        }
        return item;
    });

    localStorage.setItem("agendamentos", JSON.stringify(atualizado));
}

function removerCardDoLocalStorage(cardId) {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    const idNumerico = Number(cardId.replace("card-", ""));

    const filtrados = agendamentos.filter((item) => item.id !== idNumerico);
    localStorage.setItem("agendamentos", JSON.stringify(filtrados));
}

function salvarAgendamento(novoPedido) {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    agendamentos.push(novoPedido);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}