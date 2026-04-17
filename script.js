function addTask() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (task.trim()=== "") {
    errorMsg.textContent = " Please enter a task.";
    return;
  };
  errorMsg.textContent = "";

  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = task;
  const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      const newTask = prompt("Edit task:", span.textContent);
      if (newTask !== null) {
        span.textContent = newTask;
      }
    });
    li.appendChild(span);
    li.appendChild(editButton);
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", function () {
    li.remove();
  });
  li.appendChild(removeButton);
  document.getElementById("taskList").appendChild(li);
  
  input.value = "";
}