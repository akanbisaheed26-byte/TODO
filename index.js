
const taskInput = document.querySelector("#taskInput");
const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const progressText = document.querySelector("#progressText");
const remainingText = document.querySelector("#remainingText");
const emptyState = document.querySelector("#emptyState");
const clearCompletedBtn = document.querySelector("#clearCompleted");

let tasks = [];

try {
    const savedTasks = localStorage.getItem("taskFlowTasks");

    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
            tasks = parsedTasks.filter(
                task =>
                    task &&
                    typeof task.text === "string" &&
                    typeof task.completed === "boolean" &&
                    typeof task.id === "number"
            );
        }
    }
} catch (error) {
    tasks = [];
}

function saveTasks() {
    try {
        localStorage.setItem("taskFlowTasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const remainingTasks = totalTasks - completedTasks;

    taskCount.textContent = totalTasks;
    progressText.textContent = `${completedTasks} completed`;
    remainingText.textContent =
        `${remainingTasks} task${remainingTasks === 1 ? "" : "s"} remaining`;

    emptyState.hidden = totalTasks > 0;
    clearCompletedBtn.disabled = completedTasks === 0;

    clearCompletedBtn.style.opacity =
        completedTasks === 0 ? "0.45" : "1";
}

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach(task => {
        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("completed");
        }

        const taskText = document.createElement("span");
        taskText.classList.add("task-text");
        taskText.textContent = task.text;

        const completeBtn = document.createElement("button");
        completeBtn.type = "button";
        completeBtn.classList.add("complete-btn");
        completeBtn.textContent = task.completed ? "Undo" : "Complete";
        completeBtn.setAttribute(
            "aria-label",
            `${task.completed ? "Undo completion of" : "Complete"} ${task.text}`
        );

        completeBtn.addEventListener("click", function () {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("aria-label", `Delete ${task.text}`);

        deleteBtn.addEventListener("click", function () {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(taskText, completeBtn, deleteBtn);
        taskList.appendChild(li);
    });

    updateStats();
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        taskInput.focus();
        return;
    }

    tasks.push({
        id: Date.now() + Math.random(),
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

clearCompletedBtn.addEventListener("click", function () {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

renderTasks();
