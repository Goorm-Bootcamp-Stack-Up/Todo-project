document.addEventListener("DOMContentLoaded", () => {
  const todoList = document.getElementById("todo-list");
  const addMemoButton = document.getElementById("add-memo-button");
  const sortButton = document.getElementById("sort-button");
  const modal = document.getElementById("memo-modal");
  const sortModal = document.getElementById("sort-modal");
  const modalTitle = modal.querySelector("h2");
  const memoText = document.getElementById("memo-text");
  const memoPriority = document.getElementById("memo-priority");
  const saveMemoButton = document.getElementById("save-memo-button");
  const cancelMemoButton = document.getElementById("cancel-memo-button");
  const cancelSortButton = document.getElementById("cancel-sort-button");
  const filterCheckboxes = document.querySelectorAll(
    '.filter-box input[type="checkbox"]'
  );
  const sortOptions = document.querySelectorAll(".sort-option");

  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  let editIndex = null;
  let activeFilters = [];
  let currentSort = null;

  const saveTodos = () => {
    localStorage.setItem("todos", JSON.stringify(todos));
  };

  const getStatusText = (status) => {
    switch (status) {
      case "b-start":
        return "시작전";
      case "progress":
        return "진행중";
      case "complete":
        return "완료";
      default:
        return "";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "높음";
      case "medium":
        return "보통";
      case "low":
        return "낮음";
      default:
        return "보통";
    }
  };

  const getPriorityValue = (priority) => {
    switch (priority) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 2;
    }
  };

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      activeFilters = Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
      renderTodos();
    });
  });

  const sortTodos = (todosArray, sortType) => {
    const sorted = [...todosArray];
    switch (sortType) {
      case "date-new":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "date-old":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "priority-high":
        return sorted.sort(
          (a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority)
        );
      case "priority-low":
        return sorted.sort(
          (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)
        );
      default:
        return sorted;
    }
  };

  const renderTodos = () => {
    todoList.innerHTML = "";
    // 필터링된 목록 생성
    let filteredTodos = todos;
    if (activeFilters.length > 0) {
      filteredTodos = todos.filter((todo) =>
        activeFilters.includes(todo.status)
      );
    }

    // 정렬 적용
    if (currentSort) {
      filteredTodos = sortTodos(filteredTodos, currentSort);
    }

    if (filteredTodos.length === 0) {
      todoList.innerHTML = '<li class="empty-message">할 일이 없습니다</li>';
      return;
    }
    filteredTodos.forEach((todo) => {
      const li = document.createElement("li");
      li.classList.add("todo-item");
      li.dataset.index = todos.indexOf(todo); // 원본 todos의 인덱스 사용

      const isCompleted = todo.status === "complete";

      li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${
              isCompleted ? "checked" : ""
            }>
            <span class="todo-text">${todo.text}</span>
            <span class="priority-badge priority-${
              todo.priority || "medium"
            }">${getPriorityText(todo.priority)}</span>
            <span class="status-pill status-${todo.status}">${getStatusText(
        todo.status
      )}</span>
            <div class="actions">
                <button class="edit">✎</button>
                <button class="delete">✖</button>
            </div>
        `;
      todoList.appendChild(li);
    });
  };

  const openModal = (mode, index = null) => {
    if (mode === "edit") {
      editIndex = index;
      modalTitle.textContent = "메모 수정";
      memoText.value = todos[index].text;
      memoPriority.value = todos[index].priority || "medium";
    } else {
      editIndex = null;
      modalTitle.textContent = "새 메모 추가";
      memoText.value = "";
      memoPriority.value = "medium";
    }
    modal.style.display = "flex";
    memoText.focus();
  };

  const closeModal = () => {
    modal.style.display = "none";
    editIndex = null;
  };

  const openSortModal = () => {
    sortModal.style.display = "flex";
  };

  const closeSortModal = () => {
    sortModal.style.display = "none";
  };

  addMemoButton.addEventListener("click", () => openModal("add"));
  sortButton.addEventListener("click", openSortModal);
  cancelMemoButton.addEventListener("click", closeModal);
  cancelSortButton.addEventListener("click", closeSortModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  sortModal.addEventListener("click", (e) => {
    if (e.target === sortModal) closeSortModal();
  });

  sortOptions.forEach((option) => {
    option.addEventListener("click", () => {
      currentSort = option.dataset.sort;
      renderTodos();
      closeSortModal();
    });
  });

  saveMemoButton.addEventListener("click", () => {
    const text = memoText.value.trim();
    if (!text) return;

    if (editIndex !== null) {
      todos[editIndex].text = text;
      todos[editIndex].priority = memoPriority.value;
    } else {
      todos.push({
        text,
        status: "b-start",
        priority: memoPriority.value,
        createdAt: new Date().toISOString(),
      });
    }

    saveTodos();
    renderTodos();
    closeModal();
  });

  todoList.addEventListener("click", (e) => {
    const li = e.target.closest(".todo-item");
    if (!li) return;

    const index = li.dataset.index;

    if (e.target.classList.contains("delete")) {
      todos.splice(index, 1);
    } else if (e.target.classList.contains("edit")) {
      openModal("edit", index);
      return; // Re-render will happen after saving
    } else if (e.target.classList.contains("todo-checkbox")) {
      const currentStatus = todos[index].status;
      if (currentStatus === "b-start") {
        todos[index].status = "progress";
      } else if (currentStatus === "progress") {
        todos[index].status = "complete";
      } else if (currentStatus === "complete") {
        todos[index].status = "b-start";
      }
    }
    saveTodos();
    renderTodos();
  });

  renderTodos();
});
