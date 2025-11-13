
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList =document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image')
    const todosContainer = document.querySelector('.todos-container');
    const progressNumbers = document.getElementById('numbers');
    const progress = document.getElementById('progress');
    let confettiFired = false;   
    const date = document.getElementById('data')

    const toggleEmptyState = () => {
        const hasTasks = taskList.children.length > 0;
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
        }
    };
    

    const saveTaskToLocalStorage = () =>{
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,completed: li.querySelector('.checkbox').checked
        }));

        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({text, completed}) => addTask(text,completed, false));
        toggleEmptyState();
        updateProgress();
    };

    const addTask = (text, completed = false, checkCompletion = true) => {
        const taskText = text || taskInput.value.trim();
        if(!taskText){
            return;
        }

        const li = document.createElement('li');
        li.innerHTML =  `
        <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} /><span>${taskText}</span>
        <div class="task-buttons">
            <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
            <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        </div>
        <span>${data}</span>
        `;

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
                taskInput.value = li.querySelector('span').textContent;
                li.remove();
                toggleEmptyState();
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

        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
        updateProgress(checkCompletion);
        saveTaskToLocalStorage();
    };

    addTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addTask();
    })
    taskInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            addTask();
        }
    });

    Sortable.create(taskList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
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