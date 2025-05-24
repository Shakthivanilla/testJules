document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');

    const flatpickrDateInput = flatpickr("#todo-date-flatpickr", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        placeholder: "Select a date..."
    });

    const inlineCalendar = flatpickr("#calendar-container-flatpickr", {
        inline: true,
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                 flatpickrDateInput.setDate(selectedDates[0]);
            }
        }
    });

    loadTodos();

    addTaskBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTodo();
        }
    });

    function addTodo() {
        const taskText = todoInput.value.trim();
        const taskDateArray = flatpickrDateInput.selectedDates;
        const taskDate = taskDateArray.length > 0 ? flatpickr.formatDate(taskDateArray[0], "Y-m-d") : "";

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const todoItem = {
            id: Date.now(),
            text: taskText,
            date: taskDate,
            completed: false
        };

        createTodoElement(todoItem); // This will now trigger animation
        saveTodo(todoItem);

        todoInput.value = '';
        flatpickrDateInput.clear();
    }

    function createTodoElement(todoItem) {
        const li = document.createElement('li');
        li.setAttribute('data-id', todoItem.id);
        if (todoItem.completed) {
            li.classList.add('completed');
        }

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = todoItem.text;
        
        const taskDateSpan = document.createElement('span');
        // Format date nicely: "Jan 1, 2023" or empty if no date
        taskDateSpan.textContent = todoItem.date ? ` (Due: ${flatpickr.formatDate(flatpickr.parseDate(todoItem.date, "Y-m-d"), "M j, Y")})` : '';
        taskDateSpan.style.fontSize = '0.9em';
        taskDateSpan.style.marginLeft = '10px';
        taskDateSpan.style.color = '#555';

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('todo-actions');

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.innerHTML = '&#10004;'; // Checkmark icon
        completeBtn.title = "Mark as complete"; // Add title for tooltip
        completeBtn.addEventListener('click', () => toggleComplete(todoItem.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '&#10006;'; // Cross icon
        deleteBtn.title = "Delete task"; // Add title for tooltip
        deleteBtn.addEventListener('click', () => deleteTodoWithAnimation(todoItem.id)); // Changed to new function

        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(taskTextSpan);
        li.appendChild(taskDateSpan);
        li.appendChild(actionsDiv);
        
        todoList.appendChild(li);

        // Add class for "add" animation then remove it
        li.classList.add('added');
        setTimeout(() => {
            li.classList.remove('added');
        }, 300); // Match animation duration in CSS (0.3s)
    }

    function deleteTodoWithAnimation(id) {
        const listItem = todoList.querySelector(`li[data-id='${id}']`);
        if (listItem) {
            listItem.classList.add('removing');
            // Wait for animation to finish before actually deleting
            listItem.addEventListener('animationend', () => {
                deleteTodo(id); // Call the original delete logic
            });
        } else {
            // Fallback if element is not found, though this shouldn't happen in normal flow
            deleteTodo(id);
        }
    }
    
    function deleteTodo(id) {
        let todos = getTodos();
        todos = todos.filter(todo => todo.id !== id);
        localStorage.setItem('todos', JSON.stringify(todos));
        
        // Remove element from UI (if not already removed by animation completion)
        const listItem = todoList.querySelector(`li[data-id='${id}']`);
        if (listItem) {
            listItem.remove();
        }
    }

    function toggleComplete(id) {
        const todos = getTodos();
        const todoIndex = todos.findIndex(todo => todo.id === id);
        if (todoIndex > -1) {
            todos[todoIndex].completed = !todos[todoIndex].completed;
            localStorage.setItem('todos', JSON.stringify(todos));
            const listItem = todoList.querySelector(`li[data-id='${id}']`);
            if (listItem) {
                listItem.classList.toggle('completed');
            }
        }
    }

    function saveTodo(todoItem) {
        const todos = getTodos();
        todos.push(todoItem);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function getTodos() {
        return JSON.parse(localStorage.getItem('todos')) || [];
    }

    function loadTodos() {
        todoList.innerHTML = ''; // Clear existing list before loading
        const todos = getTodos();
        todos.forEach(todoItem => createTodoElement(todoItem));
    }
});
