let currentCategoryFilter = "all";

function getCategoryLabel(cat) {
  const labels = {
    general: "🌟 General",
    reading: "📚 Reading",
    homework: "✍️ Homework",
    examprep: "🔬 Exam Prep",
    project: "🎨 Project"
  };
  return labels[cat] || "🌟 General";
}

function addTask() {
  const input = document.getElementById("taskInput");
  const priorityInput = document.getElementById("priorityInput");
  const categoryInput = document.getElementById("categoryInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const errorMsg = document.getElementById("errorMsg");

  const taskText = input.value.trim();
  if (taskText === "") {
    errorMsg.textContent = "Please enter a task.";
    return;
  }
  errorMsg.textContent = "";

  const now = new Date();
  const timestamp = `Added: ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const taskData = {
    text: taskText,
    completed: false,
    priority: priorityInput ? priorityInput.value : "low",
    category: categoryInput ? categoryInput.value : "general",
    dueDate: dueDateInput ? dueDateInput.value : "",
    timestamp: timestamp
  };

  createTaskElement(taskData);
  
  // Reset inputs
  input.value = "";
  if (dueDateInput) dueDateInput.value = "";
  if (priorityInput) priorityInput.value = "low";
  if (categoryInput) categoryInput.value = "general";

  taskTracker();
  saveTasks();
  
  // Sync view
  filterCategory(currentCategoryFilter);
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `priority-${task.priority} category-${task.category}`;
  
  // Store state in data attributes for resilient local storage saving
  li.setAttribute("data-text", task.text);
  li.setAttribute("data-priority", task.priority);
  li.setAttribute("data-category", task.category);
  li.setAttribute("data-due-date", task.dueDate || "");
  li.setAttribute("data-timestamp", task.timestamp);

  // Format due date nicely if present
  let dueDateHtml = "";
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    if (!isNaN(d.getTime())) {
      dueDateHtml = `<span class="due-date-badge">📅 ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`;
    }
  }

  li.innerHTML = `
    <div class="task-main" style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
      <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark completed" style="margin: 0;">
      <span class="task-text ${task.completed ? 'completed' : ''}" style="word-break: break-word;">${task.text}</span>
    </div>
    <div class="task-meta" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
      <span class="task-badge badge-${task.category}">${getCategoryLabel(task.category)}</span>
      <span class="task-badge priority-badge" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-muted); opacity: 0.85;">${task.priority.toUpperCase()}</span>
      ${dueDateHtml}
      <small class="task-timestamp" style="color: var(--text-muted); opacity: 0.7; font-size: 0.7rem;">${task.timestamp}</small>
    </div>
    <div class="task-actions" style="display: flex; gap: 0.5rem; margin-left: 0.5rem;">
      <button class="edit-btn">Edit</button>
      <button class="remove-btn">Remove</button>
    </div>
  `;

  const checkbox = li.querySelector('input[type="checkbox"]');
  checkbox.addEventListener("change", () => {
    li.querySelector('.task-text').classList.toggle("completed");
    taskTracker();
    saveTasks();
  });

  const editButton = li.querySelector('.edit-btn');
  editButton.addEventListener("click", () => {
    const span = li.querySelector('.task-text');
    const newTask = prompt("Edit task:", span.textContent);
    if (newTask !== null && newTask.trim() !== "") {
      const trimmed = newTask.trim();
      span.textContent = trimmed;
      li.setAttribute("data-text", trimmed);
      saveTasks();
    }
  });

  li.querySelector('.remove-btn').addEventListener("click", () => {
    li.remove();
    taskTracker();
    saveTasks();
  });

  document.getElementById("taskList").appendChild(li);
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    tasks.push({
      text: li.getAttribute("data-text") || li.querySelector(".task-text").textContent,
      completed: li.querySelector("input").checked,
      priority: li.getAttribute("data-priority") || "low",
      category: li.getAttribute("data-category") || "general",
      dueDate: li.getAttribute("data-due-date") || "",
      timestamp: li.getAttribute("data-timestamp") || li.querySelector(".task-timestamp").textContent
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  savedTasks.forEach((task) => createTaskElement(task));
  taskTracker();
}

document.addEventListener("DOMContentLoaded", loadTasks);

const clearAllBtn = document.getElementById("clearAllBtn");
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      document.getElementById("taskList").innerHTML = "";
      taskTracker();
      saveTasks();
    }
  });
}

function initCategoryFilters() {
  const filters = document.querySelectorAll(".filter-pill");
  filters.forEach(pill => {
    pill.addEventListener("click", () => {
      filters.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      
      const category = pill.getAttribute("data-category");
      filterCategory(category);
    });
  });
}

function filterCategory(category) {
  currentCategoryFilter = category;
  const searchInput = document.getElementById("searchInput");
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  
  document.querySelectorAll("#taskList li").forEach(li => {
    const liCategory = li.getAttribute("data-category") || "general";
    const liText = (li.getAttribute("data-text") || li.querySelector(".task-text").textContent).toLowerCase();
    
    const matchesCategory = category === "all" || liCategory === category;
    const matchesSearch = liText.includes(query);
    
    if (matchesCategory && matchesSearch) {
      li.style.display = "flex";
      li.style.opacity = "1";
    } else {
      li.style.display = "none";
      li.style.opacity = "0";
    }
  });
}

document.addEventListener("DOMContentLoaded", initCategoryFilters);

function taskTracker() {
  const tasks = document.querySelectorAll("#taskList li");
  const completed = document.querySelectorAll("#taskList input:checked");
  const stats = document.getElementById("taskStats");
  if (stats) stats.innerText = `✅ ${completed.length} / ${tasks.length} completed`;

  const headerStats = document.getElementById("headerStats");
  if (headerStats) {
    const percentage = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
    headerStats.innerText = `🎯 ${percentage}%`;
  }
  
  const celebration = document.getElementById("celebration");
  if (tasks.length > 0 && tasks.length === completed.length) {
    celebration.classList.remove("hidden");
    celebration.classList.add("show");
  } else {
    celebration.classList.remove("show");
    celebration.classList.add("hidden");
  }
}
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll("#taskList li").forEach((li) => {
      const text = li.querySelector("span").textContent.toLowerCase();
      li.style.display = text.includes(query) ? "flex" : "none";
    });
  });
}

// Theme Selector & Persistence Engine
document.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.getElementById("themeSwitcher");
  const savedTheme = localStorage.getItem("theme") || "dark";

  // Apply theme to document root
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (themeSwitcher) {
    themeSwitcher.value = savedTheme;
    themeSwitcher.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      document.documentElement.setAttribute("data-theme", selectedTheme);
      localStorage.setItem("theme", selectedTheme);
    });
  }
});

// Dynamic Greeting & Live Date Engine
function updateHeaderGreetingAndDate() {
  const greetingEl = document.getElementById("headerGreeting");
  const dateEl = document.getElementById("headerDate");
  
  if (!greetingEl && !dateEl) return;

  const now = new Date();
  const hour = now.getHours();
  
  let greetingText = "👋 Focus Time!";
  if (hour >= 5 && hour < 12) {
    greetingText = "🌅 Good morning, Student!";
  } else if (hour >= 12 && hour < 17) {
    greetingText = "☀️ Good afternoon, Student!";
  } else if (hour >= 17 && hour < 22) {
    greetingText = "🌆 Good evening, Student!";
  } else {
    greetingText = "🌌 Happy late-night study!";
  }

  // Format date: e.g. "Sun, May 17"
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  if (greetingEl) greetingEl.textContent = greetingText;
  if (dateEl) dateEl.textContent = formattedDate;
}

// Initialize greeting and date when page loads
document.addEventListener("DOMContentLoaded", updateHeaderGreetingAndDate);

// ==========================================================================
// POMODORO FOCUS TIMER ENGINE
// ==========================================================================

let timerInterval = null;
let timeLeft = 25 * 60; // default 25 mins
let isTimerRunning = false;
let currentTimerMode = "study"; // "study", "short", "long"

const timerTimes = {
  study: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

function initPomodoro() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  const resetTimerBtn = document.getElementById("resetTimerBtn");
  const modeButtons = document.querySelectorAll(".mode-btn");
  
  if (!startPauseBtn) return; // not on this page

  // Mode Selection
  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const mode = btn.getAttribute("data-mode");
      switchTimerMode(mode);
    });
  });

  // Controls
  startPauseBtn.addEventListener("click", toggleTimer);
  resetTimerBtn.addEventListener("click", resetTimer);

  updateTimerDisplay();
}

function switchTimerMode(mode) {
  pauseTimer();
  currentTimerMode = mode;
  timeLeft = timerTimes[mode];
  updateTimerDisplay();
}

function toggleTimer() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  if (isTimerRunning) {
    pauseTimer();
  } else {
    isTimerRunning = true;
    if (startPauseBtn) startPauseBtn.innerText = "⏸️ Pause";
    timerInterval = setInterval(tickTimer, 1000);
  }
}

function pauseTimer() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  isTimerRunning = false;
  if (startPauseBtn) startPauseBtn.innerText = "▶️ Start";
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  timeLeft = timerTimes[currentTimerMode];
  updateTimerDisplay();
}

function tickTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay();
  } else {
    // Timer Expired!
    pauseTimer();
    playCompletionAlert();
    triggerTimerConfetti();
    
    // Auto reset to mode time
    timeLeft = timerTimes[currentTimerMode];
    updateTimerDisplay();
    
    alert(`🎉 Focus Session Finished: ${currentTimerMode.toUpperCase()} completed!`);
  }
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById("timerDisplay");
  if (!timerDisplay) return;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  timerDisplay.innerText = formattedTime;
  
  // Sync tab title
  const modeEmoji = currentTimerMode === "study" ? "⏱️" : "☕";
  document.title = `(${formattedTime}) ${modeEmoji} Study Tracker`;
}

// Custom web audio chime (no assets needed!)
function playCompletionAlert() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a lovely double-tone chime
    const playTone = (freq, startOffset, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + duration);
    };
    
    // Play chime: C5 (523.25Hz) followed by E5 (659.25Hz)
    playTone(523.25, 0, 0.4);
    playTone(659.25, 0.15, 0.5);
  } catch (e) {
    console.error("Audio error", e);
  }
}

function triggerTimerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  }
}

document.addEventListener("DOMContentLoaded", initPomodoro);

// ==========================================================================
// STUDY INSPIRATION QUOTES ROTATOR
// ==========================================================================

const studyQuotes = [
  { text: "Focus on being productive, not busy.", author: "Tim Ferriss" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Small progress each day adds up to big results.", author: "Satya Nani" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" }
];

let currentQuoteIndex = 0;

function initQuotes() {
  const newQuoteBtn = document.getElementById("newQuoteBtn");
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", rotateQuote);
  }
}

function rotateQuote() {
  const quoteTextEl = document.getElementById("quoteText");
  const quoteAuthorEl = document.getElementById("quoteAuthor");
  
  if (!quoteTextEl || !quoteAuthorEl) return;

  // Find a new random index that is different from current
  let newIndex = currentQuoteIndex;
  while (newIndex === currentQuoteIndex && studyQuotes.length > 1) {
    newIndex = Math.floor(Math.random() * studyQuotes.length);
  }
  currentQuoteIndex = newIndex;
  
  const nextQuote = studyQuotes[currentQuoteIndex];

  // Smooth fade transition using CSS opacities
  quoteTextEl.style.opacity = "0";
  quoteAuthorEl.style.opacity = "0";

  setTimeout(() => {
    quoteTextEl.innerText = `"${nextQuote.text}"`;
    quoteAuthorEl.innerText = `— ${nextQuote.author}`;
    
    quoteTextEl.style.opacity = "0.9";
    quoteAuthorEl.style.opacity = "1";
  }, 300);
}

document.addEventListener("DOMContentLoaded", initQuotes);
