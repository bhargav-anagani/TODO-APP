const API = "https://todo-app-xn6y.onrender.com";

/* =========================
   AUTH CHECK
========================= */
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
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
async function loadTasks(filter = "all") {
  try {
    const res = await fetch(`${API}/tasks`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    tasks = await res.json();

    listBody.innerHTML = "";

    let total = tasks.length;
    let completed = 0;
    let pending = 0;

    tasks.forEach(task => {
      if (task.status === "completed") completed++;
      else pending++;
    });

    const filteredTasks = tasks.filter(task => {
      if (filter === "all") return true;
      return task.status === filter;
    });

    if (filteredTasks.length === 0) {
      listBody.innerHTML = `<tr><td colspan="4" class="text-center py-10 opacity-50 font-bold">No tasks found</td></tr>`;
    }

    filteredTasks.forEach((task, index) => {
      const isCompleted = task.status === "completed";
      listBody.innerHTML += `
        <tr class="task-row cursor-pointer border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition-all animate-fade-in" 
            style="animation-delay: ${index * 0.05}s"
            data-id="${task._id}">
          <td class="pl-8 py-4">
            <div class="flex items-center gap-4">
              <div class="w-3 h-3 rounded-full ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}"></div>
              <div>
                <p class="font-bold text-lg ${isCompleted ? 'line-through opacity-50' : ''}">${task.title}</p>
                <p class="text-xs opacity-60 truncate max-w-xs">${task.description || "No description"}</p>
              </div>
            </div>
          </td>
          <td class="opacity-70 font-bold">${task.task_date || "-"}</td>
          <td>
            <span class="badge ${isCompleted ? 'badge-success' : 'badge-warning'} font-bold px-4 py-3">
              ${task.status.toUpperCase()}
            </span>
          </td>
          <td class="pr-8 text-center">
            <div class="flex justify-center gap-3">
              <button onclick="event.stopPropagation(); toggleStatus('${task._id}', '${task.status}')" 
                class="btn btn-ghost btn-circle hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Mark as ${isCompleted ? 'Pending' : 'Completed'}">
                <i class="bx ${isCompleted ? 'bx-undo' : 'bx-check'} text-xl"></i>
              </button>
              <button onclick="event.stopPropagation(); deleteTask('${task._id}')" 
                class="btn btn-ghost btn-circle hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete Task">
                <i class="bx bx-trash text-xl"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    /* Counters */
    totalCounter.innerText = total;
    completedCounter.innerText = completed;
    pendingCounter.innerText = pending;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const startVal = parseInt(percentageDisplay.innerText.replace('%', '')) || 0;
    animateValue(percentageDisplay, startVal, percentage, 800, "%");
    progressBar.style.width = percentage + "%";

    /* Modal click handlers */
    document.querySelectorAll(".task-row").forEach(row => {
      row.addEventListener("click", () => {
        const taskId = row.dataset.id;
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        modalTitle.innerText = task.title;
        modalDescription.innerText = task.description || "No description provided.";
        modalDate.innerText = task.task_date || "No due date set.";

        taskModal.classList.remove("hidden");
        taskModal.classList.add("flex");
        setTimeout(() => {
          taskModal.classList.remove("opacity-0");
          taskModal.querySelector(".modal-content").classList.remove("scale-95", "opacity-0");
          taskModal.querySelector(".modal-content").classList.add("scale-100", "opacity-100");
        }, 10);
      });
    });
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

function animateValue(obj, start, end, duration, suffix = "") {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/* SEARCH & FILTER LOGIC */
document.querySelector(".search-input").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".task-row").forEach(row => {
    const title = row.querySelector("strong").innerText.toLowerCase();
    row.style.display = title.includes(term) ? "" : "none";
  });
});

document.querySelectorAll("[data-filter]").forEach(link => {
  link.addEventListener("click", (e) => {
    const filter = e.target.closest("[data-filter]").dataset.filter;
    loadTasks(filter);
  });
});

/* =========================
   ADD TASK
   ========================= */
addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const task_date = dateInput.value;

  if (!title) {
    titleInput.classList.add("border-red-500");
    setTimeout(() => titleInput.classList.remove("border-red-500"), 2000);
    return;
  }

  addBtn.disabled = true;
  addBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';

  await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      title,
      description,
      task_date
    })
  });

  titleInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";

  addBtn.disabled = false;
  addBtn.innerHTML = 'Add Task <i class="bx bx-plus ml-2"></i>';

  loadTasks();
});

/* =========================
   UPDATE STATUS
========================= */
async function toggleStatus(taskId, currentStatus) {
  const newStatus =
    currentStatus === "pending" ? "completed" : "pending";

  await fetch(`${API}/tasks/${taskId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status: newStatus })
  });

  loadTasks();
}

/* =========================
   DELETE TASK
   ========================= */
async function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  await fetch(`${API}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  loadTasks();
}

/* =========================
   MODAL CONTROLS
   ========================= */
const hideModal = () => {
  taskModal.classList.add("opacity-0");
  taskModal.querySelector(".modal-content").classList.add("scale-95", "opacity-0");
  taskModal.querySelector(".modal-content").classList.remove("scale-100", "opacity-100");
  setTimeout(() => {
    taskModal.classList.add("hidden");
    taskModal.classList.remove("flex");
  }, 300);
};

closeModal.addEventListener("click", hideModal);

taskModal.addEventListener("click", e => {
  if (e.target === taskModal) hideModal();
});

/* =========================
   THEME SWITCHER
========================= */
const themeItems = document.querySelectorAll(".theme-item");
// Default to light if no theme is stored
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);

themeItems.forEach(item => {
  item.addEventListener("click", () => {
    const selectedTheme = item.getAttribute("theme");
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
});

/* =========================
   INIT
========================= */
loadTasks();
