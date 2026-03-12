const form = document.getElementById("serviceForm");
const receivedList = document.getElementById("receivedList");
const analysisList = document.getElementById("analysisList");
const maintenanceList = document.getElementById("maintenanceList");
const completedList = document.getElementById("completedList");
const searchInput = document.getElementById("searchInput");

const serviceModalElement = document.getElementById("serviceModal");
const serviceModal = new bootstrap.Modal(serviceModalElement);

const moveCardModalElement = document.getElementById("moveCardModal");
const moveCardModal = new bootstrap.Modal(moveCardModalElement);

const moveLeftBtn = document.getElementById("moveLeftBtn");
const moveRightBtn = document.getElementById("moveRightBtn");

let selectedCard = null;

const columns = ["received", "analysis", "maintenance", "completed"];

function updateCounts() {
  document.getElementById("countReceived").textContent =
    `${document.querySelectorAll("#receivedList .service-card").length} serviço(s)`;

  document.getElementById("countAnalysis").textContent =
    `${document.querySelectorAll("#analysisList .service-card").length} serviço(s)`;

  document.getElementById("countMaintenance").textContent =
    `${document.querySelectorAll("#maintenanceList .service-card").length} serviço(s)`;

  document.getElementById("countCompleted").textContent =
    `${document.querySelectorAll("#completedList .service-card").length} serviço(s)`;
}

function getListByStatus(status) {
  if (status === "received") return receivedList;
  if (status === "analysis") return analysisList;
  if (status === "maintenance") return maintenanceList;
  if (status === "completed") return completedList;
}

function getBadgeText(status) {
  if (status === "received") return "Novo";
  if (status === "analysis") return "Análise";
  if (status === "maintenance") return "Andamento";
  if (status === "completed") return "Finalizado";
}

function updateCardStatus(card, newStatus) {
  card.setAttribute("data-status", newStatus);

  const badge = card.querySelector(".badge-status");
  if (badge) {
    badge.textContent = getBadgeText(newStatus);
  }
}

function moveCard(card, direction) {
  const currentStatus = card.getAttribute("data-status");
  const currentIndex = columns.indexOf(currentStatus);

  if (currentIndex === -1) return;

  let newIndex = currentIndex;

  if (direction === "left" && currentIndex > 0) {
    newIndex = currentIndex - 1;
  }

  if (direction === "right" && currentIndex < columns.length - 1) {
    newIndex = currentIndex + 1;
  }

  if (newIndex === currentIndex) return;

  const newStatus = columns[newIndex];
  const targetList = getListByStatus(newStatus);

  updateCardStatus(card, newStatus);
  targetList.prepend(card);

  updateCounts();
}

function createCard(data) {
  const card = document.createElement("article");
  card.classList.add("service-card");
  card.setAttribute("data-status", "received");

  card.innerHTML = `
    <div class="card-header-custom">
      <h3>${data.name}</h3>
      <span class="badge-status">Novo</span>
    </div>

    <div class="card-content">
      <p><i class="bi bi-telephone"></i> <strong>Telefone:</strong> ${data.phone}</p>
      <p><i class="bi bi-envelope"></i> <strong>Email:</strong> ${data.email}</p>
      <p><i class="bi bi-car-front"></i> <strong>Modelo:</strong> ${data.model}</p>
      <p><i class="bi bi-calendar"></i> <strong>Ano:</strong> ${data.year}</p>
      <p><i class="bi bi-credit-card-2-front"></i> <strong>Placa:</strong> ${data.plate}</p>
      <p><i class="bi bi-tools"></i> <strong>Problema:</strong> ${data.problem}</p>
    </div>

    <div class="card-footer-custom">
      <small>Clique no card para mover</small>
      <button class="icon-btn delete-btn" title="Excluir">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  return card;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("clientName").value,
    phone: document.getElementById("clientPhone").value,
    email: document.getElementById("clientEmail").value,
    model: document.getElementById("carModel").value,
    year: document.getElementById("carYear").value,
    plate: document.getElementById("carPlate").value,
    problem: document.getElementById("problem").value
  };

  const newCard = createCard(data);
  receivedList.prepend(newCard);

  form.reset();
  serviceModal.hide();
  updateCounts();
});

document.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".delete-btn");
  const clickedCard = event.target.closest(".service-card");

  if (deleteBtn) {
    event.stopPropagation();
    const card = deleteBtn.closest(".service-card");
    card.remove();
    updateCounts();
    return;
  }

  if (clickedCard) {
    selectedCard = clickedCard;

    const currentStatus = selectedCard.getAttribute("data-status");
    const currentIndex = columns.indexOf(currentStatus);

    moveLeftBtn.disabled = currentIndex === 0;
    moveRightBtn.disabled = currentIndex === columns.length - 1;

    moveCardModal.show();
  }
});

moveLeftBtn.addEventListener("click", function () {
  if (!selectedCard) return;
  moveCard(selectedCard, "left");
  moveCardModal.hide();
});

moveRightBtn.addEventListener("click", function () {
  if (!selectedCard) return;
  moveCard(selectedCard, "right");
  moveCardModal.hide();
});

searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll(".service-card");

  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();

    if (text.includes(searchValue)) {
      card.classList.remove("hidden-card");
    } else {
      card.classList.add("hidden-card");
    }
  });
});

updateCounts();