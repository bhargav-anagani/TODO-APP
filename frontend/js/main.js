const API = "http://localhost:3000";

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

// Modal elements
const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalDate = document.getElementById('modalDate');
const closeModal = document.getElementById('closeModal');

let tasks = []; // store tasks globally to access modal

/* Load Tasks */
async function loadTasks() {
  const res = await fetch(`${API}/tasks`);
  tasks = await res.json(); // store globally

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

  /* UPDATE COUNTERS */
  totalCounter.innerText = total;
  completedCounter.innerText = completed;
  pendingCounter.innerText = pending;

  let percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  percentageDisplay.innerText = percentage + "%";
  progressBar.style.width = percentage + "%";

  // Add click listeners for modal
  document.querySelectorAll('.task-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Ignore clicks on buttons inside row
      if(e.target.tagName === "BUTTON") return;

      const taskId = row.dataset.id;
      const task = tasks.find(t => t.id == taskId);

      modalTitle.innerText = task.title;
      modalDescription.innerText = task.description || "No description";
      modalDate.innerText = task.task_date ? `Due: ${task.task_date}` : "";

      taskModal.classList.remove('hidden');
      taskModal.classList.add('flex');
    });
  });
}

/* Add Task */
addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const task_date = dateInput.value;

  if (!title) return alert("Enter task title");

  await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, task_date })
  });

  // Clear inputs
  titleInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";

  loadTasks();
});

/* Update Status */
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

/* Delete */
async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

/* Close Modal */
closeModal.addEventListener('click', () => {
  taskModal.classList.add('hidden');
  taskModal.classList.remove('flex');
});

// Close modal if clicking outside modal content
taskModal.addEventListener('click', (e) => {
  if(e.target === taskModal){
    taskModal.classList.add('hidden');
    taskModal.classList.remove('flex');
  }
});

loadTasks();
// THEME SWITCHER
const themeItems = document.querySelectorAll('.theme-item');

themeItems.forEach(item => {
  item.addEventListener('click', () => {
    const selectedTheme = item.getAttribute('theme');
    document.documentElement.setAttribute('data-theme', selectedTheme);
    console.log("Theme changed to", selectedTheme);
  });
});
