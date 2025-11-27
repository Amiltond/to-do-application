document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
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
    const somConcluido = new Audio('./sounds/concluded.mp3')
    somConcluido.volume = 0.03;
    const somAdicionar = new Audio('./sounds/addtask.mp3');
    somAdicionar.volume = 0.1;
    const somApagar = new Audio('./sounds/deletetask.mp3');
    somApagar.volume = 0.1;
    const somEditar = new Audio('./sounds/addtask.mp3')
    somEditar.volume = 0.1;

    // NOVO CÓDIGO PARA LIMITAR A DATA A DD/MM E VALIDAR LIMITES
    date.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ''); // 1. Remove tudo que não for dígito
        
        // 2. Adiciona a barra "/" automaticamente após o segundo dígito, com validação
        if (value.length >= 3) {
            let dia = parseInt(value.substring(0, 2), 10);
            let mes = parseInt(value.substring(2, 4), 10); 
            
            let isValid = true;
            
            // Validação básica do Dia e Mês
            if (dia > 31 || dia === 0) { // Dia não pode ser > 31 ou 00
                isValid = false;
            }
            // Verifica o mês apenas se houver pelo menos 4 dígitos para análise
            if (value.length >= 4 && (mes > 12 || mes === 0)) { // Mês não pode ser > 12 ou 00
                isValid = false;
            }

            if (!isValid) {
                // Se for inválido (por exemplo, 35 ou 15/13), trunca para os primeiros 2 dígitos
                // Isso força o usuário a corrigir o dia antes de digitar o mês ou vice-versa.
                value = value.substring(0, 2);
            } else {
                // Se for válido, formata como DD/MM
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
        }
        
        // 3. Limita o valor final a 5 caracteres (DD/MM)
        if (value.length > 5) {
            value = value.substring(0, 5);
        }

        e.target.value = value;
    });
    // FIM DO CÓDIGO DE VALIDAÇÃO DE DATA

    const toggleEmptyState = () => {
        const hasTasks = taskList.children.length > 0;
        statContainer.style.display = hasTasks ? 'flex' : 'none';
        emptyImage.style.display = hasTasks ? 'none' : 'block';
        taskList.style.display = hasTasks ? 'block' : 'none';
        todosContainer.style.width = '100%'; 
        
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

        const allTasksDone = totalTasks > 0 && totalTasks === completedTasks;

        if(checkCompletion && allTasksDone && !confettiFired) {
            confettiLaunch();
            somConcluido.currentTime = 0;
            somConcluido.play();
            confettiFired = true;
        }else if (!allTasksDone){
            confettiFired = false;
            somConcluido.pause();
            somConcluido.currentTime = 0;
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

    const addTask = (text, dateValue = null, completed = false, checkCompletion = true) => {
        if (isEditing){
            return;
        }
        const taskText = text || taskInput.value.trim();
        const taskDate = dateValue !== null ? dateValue : date.value.trim(); 

        if(!taskText){
            return;
        };
        
        // Previne que datas inválidas sejam adicionadas
        if (taskDate.length > 0) {
            const dateParts = taskDate.split('/');
            const dia = parseInt(dateParts[0], 10);
            const mes = parseInt(dateParts[1], 10);
            
            // Validação final antes de adicionar
            if (dateParts.length !== 2 || dia > 31 || dia === 0 || mes > 12 || mes === 0) {
                // Opcional: Avisar o usuário que a data é inválida
                console.error("Data inválida. A tarefa não foi adicionada.");
                // Opcional: alert("Por favor, insira uma data válida no formato DD/MM (ex: 15/07).");
                date.focus();
                date.style.backgroundColor = '#ffc0cb'; // Fundo rosa para erro
                return;
            }
        }


        const li = document.createElement('li');
        li.innerHTML =  `
        <input type="checkbox" class="checkbox" id="checkbox"${completed ? 'checked' : ''} />
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
                
                taskList.querySelectorAll('li').forEach(item => {
                    item.style.pointerEvents = 'none';
                    item.style.opacity = '0.5';
                });
                
                updateProgress(false);
                saveTaskToLocalStorage(); 
            }
        })

        // Note que adicionamos o '(e)' aqui para capturar o evento do clique
        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            const rect = li.getBoundingClientRect();

            // 1. Calcula a posição exata do clique na tela (0 a 1)
            const x = (rect.left + (rect.width / 2)) / window.innerWidth;
            const y = (rect.top + (rect.height / 2)) / window.innerHeight;
            // 2. Solta a explosão de bolhas nessa posição
            bubbleBurst(x, y);

            // 3. Toca o som e remove a tarefa (seu código original)
            somApagar.currentTime = 0;
            somApagar.play();

            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTaskToLocalStorage();
        });

        if (checkCompletion) {
            taskList.prepend(li);
        } else {
            taskList.appendChild(li);
        }
        
        if (checkCompletion) { 
            taskInput.value = '';
            date.value = ''; 

            somAdicionar.currentTime = 0;
            somAdicionar.play();
            lateralBurst(li);
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
            // --- LÓGICA DE EDIÇÃO ---
            if (currentEditLi) {
                // Validação de data no modo de edição
                const newDateValue = date.value.trim();
                const dateParts = newDateValue.split('/');
                const dia = parseInt(dateParts[0], 10);
                const mes = parseInt(dateParts[1], 10);

                if (newDateValue.length > 0 && (dateParts.length !== 2 || dia > 31 || dia === 0 || mes > 12 || mes === 0)) {
                    // Opcional: Avisar o usuário que a data é inválida
                    console.error("Data inválida. A edição não foi salva.");
                    date.focus();
                    date.style.backgroundColor = '#ffc0cb';
                    return;
                }
                
                // Atualiza os textos
                currentEditLi.querySelector('span:first-of-type').textContent = taskInput.value.trim();
                currentEditLi.querySelector('.datedate').textContent = newDateValue; 
                
                // Move a tarefa editada para o topo
                taskList.prepend(currentEditLi);

                currentEditLi.style.backgroundColor = ''; 
                currentEditLi.classList.remove('editing'); 

                // TOCA O SOM DE EDIÇÃO
                somEditar.currentTime = 0;
                somEditar.play().catch(e => console.log(e));
                lateralBurst(currentEditLi);
            }
            
            // Reseta variáveis
            isEditing = false;
            currentEditLi = null;

            // Volta o botão ao normal
            addTaskBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            addTaskBtn.removeAttribute("style");
            addTaskBtn.classList.remove('editing-mode');

            // Reativa as outras tarefas
            taskList.querySelectorAll('li').forEach(item => {
                item.style.pointerEvents = 'auto';
                item.style.opacity = '1';
            });

        } else {
            // --- LÓGICA DE NOVA TAREFA ---
            addTask(null, null, false, true); 
            // Se a addTask retornar sem adicionar (por data inválida, por exemplo), 
            // o código abaixo só rodará a limpeza e salvamento se a data for válida.
        }

        // Limpeza final (comum para os dois casos se a tarefa foi adicionada/editada)
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
        origin: { y: 1.1 },
        colors: ["#219ebc","#52b69a","#d9ed92", "#61a5c2"]
    });
};

const bubbleBurst = (x, y) => {
    confetti({
        particleCount: 10,       
        spread: 360,             
        startVelocity: 10,       
        ticks: 30,               
        gravity: 0.1,            
        colors: ['#486DD6', '#82c0d5'], 
        shapes: ['circle'],
        flat: true,      
        scalar: 0.7,             
        disableForReducedMotion: true,
        origin: { x: x, y: y }   
        
    });
};

const lateralBurst = (element) => {
    // O setTimeout garante que o cálculo acontece DEPOIS que o elemento se acomodou na tela
    setTimeout(() => {
        const rect = element.getBoundingClientRect();
        
        // Cálculo do centro vertical
        const y = (rect.top + (rect.height / 2)) / window.innerHeight;

        const commonConfig = {
            particleCount: 10,
            spread: 45,           
            startVelocity: 10,
            colors: ['#52b69a', '#d9ed92', '#ffffff'],
            disableForReducedMotion: true,
            flat: true,
            scalar: 0.5,
            ticks: 40,
            gravity: 0.3
        };

        // Lado ESQUERDO (tiro para a esquerda ← 180°)
        confetti({
            ...commonConfig,
            angle: 180, 
            origin: { 
                x: (rect.left + 20) / window.innerWidth, // +20 para sair de dentro da tarefa
                y: y 
            }
        });

        // Lado DIREITO (tiro para a direita → 0°)
        confetti({
            ...commonConfig,
            angle: 0, 
            origin: { 
                x: (rect.right - 20) / window.innerWidth, // -20 para sair de dentro da tarefa
                y: y 
            }
        });
    }, 50); // Espera 50ms antes de explodir
};

