// Load data from storage or initialize empty array
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

// Initial render
renderTasks();

function addTask() {
  const input = document.getElementById("taskInput");
  const category = document.getElementById("categoryInput");

  if (input.value.trim() === "") return;

  const newTask = {
    id: Date.now(),
    text: input.value,
    category: category.value,
    completed: false,
  };

  tasks.push(newTask);
  saveAndRender();
  input.value = "";
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
   li.innerHTML = `
    <div class="task-content">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
        <span class="badge">${task.category}</span>
        <span class="task-text ${task.completed ? "completed" : ""}">${task.text}</span>
    </div>
    <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
`;
    list.appendChild(li);
  });
}
