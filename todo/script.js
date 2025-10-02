document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const addMemoButton = document.getElementById('add-memo-button');
    const modal = document.getElementById('memo-modal');
    const modalTitle = modal.querySelector('h2');
    const memoText = document.getElementById('memo-text');
    const saveMemoButton = document.getElementById('save-memo-button');
    const cancelMemoButton = document.getElementById('cancel-memo-button');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let editIndex = null;

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

    const renderTodos = () => {
        todoList.innerHTML = '';
        if (todos.length === 0) {
            todoList.innerHTML = '<li class="empty-message">할 일이 없습니다</li>';
            return;
        }
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.classList.add('todo-item');
            li.dataset.index = index;

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
            if (currentStatus === 'complete') {
                todos[index].status = 'progress';
            } else {
                todos[index].status = 'complete';
            }
        }
        saveTodos();
        renderTodos();
    });

    renderTodos();
});