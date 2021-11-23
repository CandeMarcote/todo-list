//VARIABLES

const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')

const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

const darkmodeToggle = document.querySelector('#darkmode-toggle');
const body = document.querySelector('body');

const table = document.getElementById('table');
const btn = document.querySelector('.ajax__btn')
const container = document.querySelector('.section')

//localStorage
const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.SelectedlistId'
// localStorage.clear();

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)
let darkmode = localStorage.getItem('darkmode');


//EVENTS

//DOMContentLoaded

window.addEventListener('DOMContentLoaded', e=> {
    ajaxDisplay();
    container.style.display = 'none';
    const selectedList = lists.find(list => list.id === selectedListId)

    swal("Para una mejor experiencia, recomiendo usar Google Chrome")
    if (selectedList == null) {
        listDisplayContainer.style.display = 'none';
    } else {
        listDisplayContainer.style.display = '';
    }

    if (darkmode === 'enabled') {
        enableDarkMode();
    };
});

btn.addEventListener('click', e=> {
    if(container.style.display == 'none') {
        container.style.display = ''
    }else{
        container.style.display = 'none'
    }
});

darkmodeToggle.addEventListener('click', e=> {
    darkmode = localStorage.getItem('darkmode');
    
    if(darkmode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

clearCompleteTasksButton.addEventListener('click', e=> {
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()
})

listsContainer.addEventListener('click', e=> {
    if(e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId
        saveAndRender()
    }
})

tasksContainer.addEventListener('click', e=> {
    if(e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list =>list.id === selectedListId)
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
        selectedTask.complete = e.target.checked
        save()
        renderTaskCount(selectedList)
    }
})

deleteListButton.addEventListener('click', e=> {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()
})

newListForm.addEventListener('submit', e => {
    e.preventDefault()
    const listName = newListInput.value
    if (listName == null || listName === '') return
    const list = createList(listName)
    newListInput.value = null
    lists.push(list)
    saveAndRender();
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault()
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(task)
    saveAndRender()
})

//FUNCTIONS

const enableDarkMode = () => {
    body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'enabled');
};

const disableDarkMode = () => {
    body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
};

function createTask(name) {
    return {id: Date.now().toString(), name: name, complete: false}
};


function createList(name) {
    return {id: Date.now().toString(), name: name, tasks: []}
};

function saveAndRender() {
    save()
    render()
};

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
};

function render() {
    clearElement(listsContainer)
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId)

    if (selectedListId == null) {
        listDisplayContainer.style.display = 'none'
    } else {
        listDisplayContainer.style.display = ''
        listTitleElement.innerText = selectedList.name
        renderTaskCount(selectedList)
        clearElement(tasksContainer)
        renderTasks(selectedList)
    }
};

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.complete
        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
    lists.forEach(list => {
        const ListElement = document.createElement('li')
        ListElement.dataset.listId = list.id
        ListElement.classList.add('list-name')
        ListElement.innerText = list.name
        if (list.id === selectedListId) {
            ListElement.classList.add('active-list')
        };
        listsContainer.appendChild(ListElement)
    });
};

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }    
};

render();

//AJAX

function ajaxDisplay() {
    container.classList.add('ajax__container')
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'users.json', true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200){
        let datos = JSON.parse(this.responseText)

        datos.forEach(dato => {

            const user = document.createElement('user')
            user.innerHTML = `<strong>${dato.user}</strong><br>`

            const lists = dato.lists

            lists.forEach(element => {
                const lista = document.createElement('lista')
                lista.innerHTML = `<p>• ${element.name}</p>`

                const tasks = element.tasks
                const ol = document.createElement('ol')

                tasks.forEach(it => {
                    const li = document.createElement('li')
                    li.innerHTML =it.name
                    ol.appendChild(li)
                });
                user.appendChild(lista)
                user.appendChild(ol)
            });
            container.appendChild(user)
        });
    }
}
};