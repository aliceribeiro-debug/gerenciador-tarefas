const API_URL = 'http://localhost:3000/tarefas';

const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const completedInput = document.getElementById('completed');
const taskListEl = document.getElementById('taskList');
const emptyMsg = document.getElementById('emptyMsg');
const refreshBtn = document.getElementById('refreshBtn');

// Função para criar elemento HTML da tarefa
function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = 'task' + (task.completed ? ' completed' : '');

  const info = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.textContent = task.title;

  const p = document.createElement('p');
  p.textContent = task.description;

  const priority = document.createElement('small');
  priority.textContent = 'Prioridade: ' + task.priority;

  info.appendChild(h3);
  info.appendChild(p);
  info.appendChild(priority);

  const actions = document.createElement('div');
  const editBtn = document.createElement('button');
  editBtn.className = 'btn';
  editBtn.textContent = 'Editar';
  editBtn.onclick = () => editTask(task);

  const delBtn = document.createElement('button');
  delBtn.className = 'btn';
  delBtn.textContent = 'Excluir';
  delBtn.onclick = () => deleteTask(task.id);

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  div.appendChild(info);
  div.appendChild(actions);
  return div;
}

async function loadTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  taskListEl.innerHTML = '';
  if (tasks.length === 0) {
    emptyMsg.textContent = 'Nenhuma tarefa encontrada.';
    return;
  }
  emptyMsg.textContent = '';
  tasks.forEach(t => taskListEl.appendChild(createTaskElement(t)));
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newTask = {
    title: titleInput.value,
    description: descInput.value,
    priority: priorityInput.value,
    completed: completedInput.checked
  };
  await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(newTask)
  });
  taskForm.reset();
  loadTasks();
});

// --- EDIÇÃO COM MODAL ---
let currentTaskEditing = null;

function openEditModal(task) {
  currentTaskEditing = task;

  // Preenche campos do modal com os dados da tarefa
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDescription').value = task.description;
  document.getElementById('editPriority').value = task.priority;
  document.getElementById('editCompleted').checked = task.completed;

  document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
  currentTaskEditing = null;
}

// Substitui o clique do botão "Editar"
async function editTask(task) {
  openEditModal(task);
}

// Lida com o envio do formulário de edição
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentTaskEditing) return;

  const updatedTask = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    priority: document.getElementById('editPriority').value,
    completed: document.getElementById('editCompleted').checked
  };

  await fetch(`${API_URL}/${currentTaskEditing.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask)
  });

  closeEditModal();
  loadTasks();
});

// Botão cancelar fecha o modal
document.getElementById('cancelEdit').addEventListener('click', closeEditModal);



async function deleteTask(id) {
  if (!confirm('Excluir tarefa?')) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadTasks();
}

refreshBtn.addEventListener('click', loadTasks);

window.addEventListener('load', loadTasks);
