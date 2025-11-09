// server.js
// Servidor Express simples que persiste tarefas em um arquivo JSON (tasks.json).
// Rota base: http://localhost:3000/tarefas

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

// ---------- helpers para ler e gravar arquivo JSON ----------
function readTasksFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Erro lendo tasks.json:', err);
    return [];
  }
}

function writeTasksToFile(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro gravando tasks.json:', err);
    throw err;
  }
}

// ---------- Rotas ----------
app.get('/tarefas', (req, res) => {
  const tasks = readTasksFromFile();
  res.json(tasks);
});

app.post('/tarefas', (req, res) => {
  const { title, description = '', priority = 'Média', completed = false } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Título é obrigatório e deve ser string.' });
  }

  const id = 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
  const now = Date.now();

  const newTask = { id, title, description, priority, completed: !!completed, createdAt: now, updatedAt: now };

  const tasks = readTasksFromFile();
  tasks.push(newTask);
  writeTasksToFile(tasks);

  res.status(201).json(newTask);
});

app.put('/tarefas/:id', (req, res) => {
  const id = req.params.id;
  const patch = req.body;

  const tasks = readTasksFromFile();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada.' });

  tasks[idx] = { ...tasks[idx], ...patch, updatedAt: Date.now() };
  writeTasksToFile(tasks);
  res.json(tasks[idx]);
});

app.delete('/tarefas/:id', (req, res) => {
  const id = req.params.id;
  const tasks = readTasksFromFile();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada.' });

  const removed = tasks.splice(idx, 1)[0];
  writeTasksToFile(tasks);
  res.json({ success: true, removed });
});

app.get('/', (req, res) => res.send('API de Tarefas rodando! Use /tarefas'));

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
