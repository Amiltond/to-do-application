document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList =document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image')
    const todosContainer = document.querySelector('.todos-container');
    const progressNumbers = document.getElementById('numbers');
    const progress = document.getElementById('progress');
    let confettiFired = false;    
    const date = document.getElementById('data');
    const H3 = document.querySelector("h3");
    const statContainer = document.querySelector('.stat-container');
    let isEditing = false;
    let currentEditLi = null;

    date.addEventListener('input', (e) => {
        if (e.target.value.length === 2 && e.inputType !== 'deleteContentBackward') {
            e.target.value += '/';
        }
    });

    const toggleEmptyState = () => {
        const hasTasks = taskList.children.length > 0;
        statContainer.style.display = hasTasks ? 'flex' : 'none';
        emptyImage.style.display = hasTasks ? 'none' : 'block';
        todosContainer.style.width = hasTasks ? '100%' : '50%';
        if (hasTasks) {
            todosContainer.style.justifyContent = 'flex-start';
        } else {
            todosContainer.style.justifyContent = 'center';
        }
    };

    const updateProgress = (checkCompletion = true) =>{
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

        progress.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` :
        '0%';
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`; 

        const allTasksDone = totalTasks > 0 && totalTasks ===completedTasks;

        if(checkCompletion && allTasksDone && !confettiFired) {
            confettiLaunch();
            confettiFired = true;
        }else if (!allTasksDone){
            confettiFired = false;
        };
        if (allTasksDone) {
            H3.textContent = "Parabéns!";
        } else {
            H3.textContent = "Quase lá!";
        }
    };

    // Esta função salva o texto, a data e o estado 'completed'
    const saveTaskToLocalStorage = () =>{
        const tasksToSave = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span:first-of-type').textContent,
            date: li.querySelector('span.datedate').textContent, // Salva a data
            completed: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasksToSave));
    };

    // Esta função carrega o texto, a data e o estado 'completed'
    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({text, date, completed}) => addTask(text, date, completed, false));
        toggleEmptyState();
        updateProgress();
    };

    // A função 'addTask' aceita a data vinda do localStorage
    const addTask = (text, dateValue = null, completed = false, checkCompletion = true) => {
        if (isEditing){
            return;
        }
        
        const taskText = text || taskInput.value.trim();
        const taskDate = dateValue !== null ? dateValue : date.value.trim(); 

        if(!taskText){
            return;
        };

        const li = document.createElement('li');
        li.innerHTML =  `
        <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} />
        <span>${taskText}</span>
        
        <div class="task-buttons">
            <span class="datedate">${taskDate}</span> 
            <div class="buttons-wrapper"> 
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;

        const checkbox = li.querySelector('.checkbox');
        const editBtn = li.querySelector('.edit-btn');

        if (completed){
            li.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.pointerEvents = 'none';
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? '0.5' : '1';
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto'; 
            updateProgress();
            saveTaskToLocalStorage();
        })

        editBtn.addEventListener('click', () => {
            if(!checkbox.checked) {
                currentEditLi = li; 
                taskInput.value = li.querySelector('span:first-of-type').textContent;
                date.value = li.querySelector('.datedate').textContent; 
                
                li.remove(); 
                
                isEditing = true;
                
                addTaskBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                addTaskBtn.style.backgroundColor = '#52b69a'; 
                addTaskBtn.classList.add('editing-mode'); 
                
                taskInput.style.backgroundColor = '#ffbf00'; 
                date.style.backgroundColor = '#ffbf00'; 
                
                taskInput.focus();
                
                // ▼▼ CORREÇÃO DO BUG "IMAGEM VAZIA" ▼▼
                // toggleEmptyState(); // Esta linha foi desativada!
                // ▲▲ FIM DA CORREÇÃO ▲▲
                
                // Desativa as outras tarefas
                taskList.querySelectorAll('li').forEach(item => {
                    item.style.pointerEvents = 'none';
                    item.style.opacity = '0.5';
                });
                
                updateProgress(false);
                saveTaskToLocalStorage(); 
            }
        })

        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTaskToLocalStorage();
        })

        if (checkCompletion) {
            taskList.prepend(li);
        } else {
            taskList.appendChild(li);
        }
        
        if (checkCompletion) { 
            taskInput.value = '';
            date.value = ''; 
        }
        
        taskInput.style.backgroundColor = '';
        date.style.backgroundColor = '';
        
        toggleEmptyState();
        updateProgress(checkCompletion);
        saveTaskToLocalStorage();
    };

    addTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (isEditing) {
            if (currentEditLi) {
                currentEditLi.querySelector('span:first-of-type').textContent = taskInput.value.trim();
                currentEditLi.querySelector('.datedate').textContent = date.value.trim(); 
                
                taskList.prepend(currentEditLi);

                currentEditLi.style.backgroundColor = ''; 
                currentEditLi.classList.remove('editing'); 
            }
            isEditing = false;
            currentEditLi = null;

            addTaskBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            addTaskBtn.removeAttribute("style");   // ← remove TODOS os estilos inline
            addTaskBtn.classList.remove('editing-mode');

            // Reativa as outras tarefas
            taskList.querySelectorAll('li').forEach(item => {
                item.style.pointerEvents = 'auto';
                item.style.opacity = '1';
            });

        } else {
            addTask(null, null, false, true); 
        }

        taskInput.value = '';
        taskInput.style.backgroundColor = '';
        date.value = ''; 
        date.style.backgroundColor = '';
        addTaskBtn.blur();
        saveTaskToLocalStorage(); 
        toggleEmptyState(); 
        updateProgress();
    });

    taskInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            addTaskBtn.click(); 
            taskInput.blur();
        }
    });

    date.addEventListener('keypress', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            addTaskBtn.click();
            date.blur();
        }
    });

    Sortable.create(taskList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass:'sortable-drag',
        forceFallback: true,
        fallbackOnBody: true,
        fallbackTolerance: 2,
        filter: '.checkbox, edit-btn, delete-btn, input',
        preventOnFilter: false, 
        onEnd: function () {
            saveTaskToLocalStorage();
        }
    });

    loadTasksFromLocalStorage();

});

const confettiLaunch = () => {
    confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.9 },
        colors: ["#219ebc","#52b69a","#d9ed92", "#61a5c2"]
    });
};

fa-solid