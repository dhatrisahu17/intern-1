// ==========================================
// TO-DO LIST APPLICATION - State Management
// ==========================================

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todoAppData';
        
        // DOM elements
        this.form = document.getElementById('todoForm');
        this.input = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.todoCountEl = document.getElementById('todoCount');
        this.completedCountEl = document.getElementById('completedCount');
        
        this.init();
    }

    // ==================== INITIALIZATION ====================
    init() {
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.render();
    }

    attachEventListeners() {
        // Form submission for adding new todo
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo(this.input.value.trim());
            this.input.value = '';
            this.input.focus();
        });

        // Delegated event listeners for todo items
        this.todoList.addEventListener('click', (e) => {
            const todoItem = e.target.closest('li');
            if (!todoItem) return;

            const todoId = parseInt(todoItem.dataset.id, 10);

            // Toggle complete
            if (e.target.classList.contains('checkbox')) {
                this.toggleComplete(todoId);
            }

            // Delete todo
            if (e.target.classList.contains('btn-delete')) {
                this.deleteTodo(todoId);
            }

            // Edit todo
            if (e.target.classList.contains('btn-edit')) {
                this.editTodo(todoId, todoItem);
            }
        });

        // Filter buttons
        this.filterBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach((b) => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });
    }

    // ==================== CRUD OPERATIONS ====================
    
    // CREATE: Add new todo
    addTodo(text) {
        if (!text) return;

        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(newTodo);
        this.saveToLocalStorage();
        this.render();
    }

    // READ: Get all todos or filter them
    getTodos(filter = 'all') {
        switch (filter) {
            case 'active':
                return this.todos.filter((todo) => !todo.completed);
            case 'completed':
                return this.todos.filter((todo) => todo.completed);
            case 'all':
            default:
                return this.todos;
        }
    }

    // UPDATE: Toggle completion status
    toggleComplete(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    // UPDATE: Edit todo text
    editTodo(id, todoItem) {
        const todo = this.todos.find((t) => t.id === id);
        if (!todo) return;

        const currentText = todo.text;
        const textEl = todoItem.querySelector('.todo-text');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';

        // Replace text with input
        textEl.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                todo.text = newText;
                this.saveToLocalStorage();
            }
            this.render();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') this.render();
        });
    }

    // DELETE: Remove single todo
    deleteTodo(id) {
        this.todos = this.todos.filter((t) => t.id !== id);
        this.saveToLocalStorage();
        this.render();
    }

    // DELETE: Clear all completed todos
    clearCompleted() {
        const initialLength = this.todos.length;
        this.todos = this.todos.filter((t) => !t.completed);
        
        if (this.todos.length < initialLength) {
            this.saveToLocalStorage();
            this.render();
        }
    }

    // ==================== FILTERING ====================
    getFilteredTodos() {
        return this.getTodos(this.currentFilter);
    }

    // ==================== LOCAL STORAGE ====================
    saveToLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.todos = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.todos = [];
        }
    }

    // ==================== RENDERING ====================
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear todo list
        this.todoList.innerHTML = '';

        // Show/hide empty state
        if (this.todos.length === 0) {
            this.emptyState.style.display = 'block';
            this.clearCompletedBtn.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            const completedCount = this.todos.filter((t) => t.completed).length;
            this.clearCompletedBtn.style.display = completedCount > 0 ? 'block' : 'none';
        }

        // Render filtered todos
        filteredTodos.forEach((todo) => {
            const li = this.createTodoElement(todo);
            this.todoList.appendChild(li);
        });

        // Update statistics
        this.updateStats();
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="todo-content">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    aria-label="Toggle task completion"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            </div>
            <div class="todo-actions">
                <button class="btn-edit" title="Edit task">✎</button>
                <button class="btn-delete" title="Delete task">✕</button>
            </div>
        `;

        return li;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter((t) => t.completed).length;
        
        this.todoCountEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;
        this.completedCountEl.textContent = `${completed} completed`;
    }

    // ==================== UTILITIES ====================
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
