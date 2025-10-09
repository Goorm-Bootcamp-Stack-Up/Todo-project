document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const addMemoButton = document.getElementById('add-memo-button');
    const modal = document.getElementById('memo-modal');
    const modalTitle = modal.querySelector('h2');
    const memoText = document.getElementById('memo-text');
    const saveMemoButton = document.getElementById('save-memo-button');
    const cancelMemoButton = document.getElementById('cancel-memo-button');
    const filterCheckboxes = document.querySelectorAll('.filter-box input[type="checkbox"]');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let editIndex = null;
    let activeFilters = [];

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'b-start': return '시작전';
            case 'progress': return '진행중';
            case 'complete': return '완료';
            default: return '';
        }
    };

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            activeFilters = Array.from(filterCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            renderTodos();
        });
    });

    const renderTodos = () => {
        todoList.innerHTML = '';
        // 필터링된 목록 생성
        let filteredTodos = todos;
        if (activeFilters.length > 0) {
            filteredTodos = todos.filter(todo => activeFilters.includes(todo.status));
        }

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="empty-message">할 일이 없습니다</li>';
            return;
        }
        filteredTodos.forEach((todo) => {
            const li = document.createElement('li');
            li.classList.add('todo-item');
            li.dataset.index = todos.indexOf(todo); // 원본 todos의 인덱스 사용

            const isCompleted = todo.status === 'complete';

            li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${isCompleted ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <span class="status-pill status-${todo.status}">${getStatusText(todo.status)}</span>
            <div class="actions">
                <button class="edit">✎</button>
                <button class="delete">✖</button>
            </div>
        `;
            todoList.appendChild(li);
        });
    };

    const openModal = (mode, index = null) => {
        if (mode === 'edit') {
            editIndex = index;
            modalTitle.textContent = '메모 수정';
            memoText.value = todos[index].text;
        } else {
            editIndex = null;
            modalTitle.textContent = '새 메모 추가';
            memoText.value = '';
        }
        modal.style.display = 'flex';
        memoText.focus();
    };

    const closeModal = () => {
        modal.style.display = 'none';
        editIndex = null;
    };

    addMemoButton.addEventListener('click', () => openModal('add'));
    cancelMemoButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    saveMemoButton.addEventListener('click', () => {
        const text = memoText.value.trim();
        if (!text) return;

        if (editIndex !== null) {
            todos[editIndex].text = text;
        } else {
            todos.push({ text, status: 'b-start' });
        }
        
        saveTodos();
        renderTodos();
        closeModal();
    });

    todoList.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        if (!li) return;

        const index = li.dataset.index;

        if (e.target.classList.contains('delete')) {
            todos.splice(index, 1);
        } else if (e.target.classList.contains('edit')) {
            openModal('edit', index);
            return; // Re-render will happen after saving
        } else if (e.target.classList.contains('todo-checkbox')) {
            const currentStatus = todos[index].status;
            if (currentStatus === 'b-start') {
                todos[index].status = 'progress';
            } else if (currentStatus === 'progress') {
                todos[index].status = 'complete';
            } else if (currentStatus === 'complete') {
                todos[index].status = 'b-start';
            }
        }
        saveTodos();
        renderTodos();
    });

    renderTodos();
});