// 1. Data State: Load from storage or initialize empty
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

// 2. Initialize the App
window.onload = function () {
    // Render the tasks first
    renderTasks();
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        const btn = document.getElementById("themeToggle");
        if (btn) btn.textContent = "☀️ Light Mode";
    }
};

/**
 * ADDS A NEW TASK
 * Merges Categorization with the maintainer's Error Handling
 */
function addTask() {
    const input = document.getElementById("taskInput");
    const category = document.getElementById("categoryInput");
    const errorMsg = document.getElementById("errorMsg");

    // Clean validation
    if (input.value.trim() === "") {
        if (errorMsg) errorMsg.textContent = "⚠️ Please enter a task.";
        return;
    }
    if (errorMsg) errorMsg.textContent = "";

    // Create the task object
    const newTask = {
        id: Date.now(),
        text: input.value,
        category: category.value,
        completed: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    tasks.push(newTask);
    saveAndRender();
    input.value = ""; // Clear input
}

/**
 * STATE MANAGEMENT FUNCTIONS
 */
function toggleTask(id) {
    tasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
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
    updateStats();
}

/**
 * UI RENDERING
 */
function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;
    
    list.innerHTML = "";

    tasks.forEach((task) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
                <span class="badge">${task.category}</span>
                <span class="task-text ${task.completed ? "completed" : ""}">${task.text}</span>
                <small style="color: #888; margin-left: 5px;">${task.timestamp || ''}</small>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
        `;
        list.appendChild(li);
    });
}

function updateStats() {
    const stats = document.getElementById("taskStats");
    const completedCount = tasks.filter(t => t.completed).length;
    if (stats) {
        stats.innerText = `✅ ${completedCount} / ${tasks.length} completed`;
    }
}

/**
 * THEME TOGGLE (Maintainer's Feature)
 */
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById("themeToggle");

    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        btn.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        btn.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
}