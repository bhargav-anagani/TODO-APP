const API = "http://localhost:3000";

/* =========================
   AUTH CHECK
========================= */
const userId = localStorage.getItem("userId");
if (!userId) {
  window.location.href = "login.html";
}
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
});


/* =========================
   UI ELEMENTS
========================= */
const usernameDisplay = document.getElementById("usernameDisplay");
usernameDisplay.innerText = localStorage.getItem("username") || "User";

const totalCounter = document.querySelector(".total-counter");
const completedCounter = document.querySelector(".completed-counter");
const pendingCounter = document.querySelector(".pending-counter");
const percentageDisplay = document.querySelector(".percentage-display");
const progressBar = document.querySelector(".progress-bar");

const titleInput = document.querySelector(".task-title");
const descriptionInput = document.querySelector(".task-description");
const dateInput = document.querySelector(".schedule-date");
const addBtn = document.querySelector(".add-task-button");
const listBody = document.querySelector(".todos-list-body");

/* Modal elements */
const taskModal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalDate = document.getElementById("modalDate");
const closeModal = document.getElementById("closeModal");

let tasks = [];

/* =========================
   LOAD TASKS (USER-WISE)
========================= */
async function loadTasks() {
  const res = await fetch(`${API}/tasks/${userId}`);
  tasks = await res.json();

  listBody.innerHTML = "";

  let total = tasks.length;
  let completed = 0;
  let pending = 0;

  tasks.forEach(task => {
    if (task.status === "completed") completed++;
    else pending++;

    listBody.innerHTML += `
      <tr class="task-row cursor-pointer" data-id="${task.id}">
        <td><strong>${task.title}</strong></td>
        <td>${task.task_date || "-"}</td>
        <td>${task.status}</td>
        <td>
          <button onclick="toggleStatus(${task.id}, '${task.status}')">✔</button>
          <button onclick="deleteTask(${task.id})">❌</button>
        </td>
      </tr>
    `;
  });

  /* Counters */
  totalCounter.innerText = total;
  completedCounter.innerText = completed;
  pendingCounter.innerText = pending;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  percentageDisplay.innerText = percentage + "%";
  progressBar.style.width = percentage + "%";

  /* Modal click handlers */
  document.querySelectorAll(".task-row").forEach(row => {
    row.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") return;

      const taskId = row.dataset.id;
      const task = tasks.find(t => t.id == taskId);

      modalTitle.innerText = task.title;
      modalDescription.innerText = task.description || "No description";
      modalDate.innerText = task.task_date ? `Due: ${task.task_date}` : "";

      taskModal.classList.remove("hidden");
      taskModal.classList.add("flex");
    });
  });
}

/* =========================
   ADD TASK
========================= */
addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const task_date = dateInput.value;

  if (!title) {
    alert("Enter task title");
    return;
  }

  await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      task_date,
      userId
    })
  });

  titleInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";

  loadTasks();
});

/* =========================
   UPDATE STATUS
========================= */
async function toggleStatus(id, status) {
  await fetch(`${API}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: status === "pending" ? "completed" : "pending"
    })
  });
  loadTasks();
}

/* =========================
   DELETE TASK
========================= */
async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, {
    method: "DELETE"
  });
  loadTasks();
}

/* =========================
   MODAL CONTROLS
========================= */
closeModal.addEventListener("click", () => {
  taskModal.classList.add("hidden");
  taskModal.classList.remove("flex");
});

taskModal.addEventListener("click", e => {
  if (e.target === taskModal) {
    taskModal.classList.add("hidden");
    taskModal.classList.remove("flex");
  }
});

/* =========================
   THEME SWITCHER
========================= */
const themeItems = document.querySelectorAll(".theme-item");

themeItems.forEach(item => {
  item.addEventListener("click", () => {
    const selectedTheme = item.getAttribute("theme");
    document.documentElement.setAttribute("data-theme", selectedTheme);
  });
});

/* =========================
   INIT
========================= */
loadTasks();
