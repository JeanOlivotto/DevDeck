// Exemplo simples de tarefas em memória
const tasks = {
  todo: [
    { title: 'Exemplo: Falar com cliente', desc: 'Reunião às 14h', id: 1 },
  ],
  doing: [
    { title: 'Exemplo: Refatorar código', desc: 'Módulo de autenticação', id: 2 },
  ],
  done: [
    { title: 'Exemplo: Ideia nova', desc: 'Kanban visual', id: 3 },
  ],
};

function renderTasks() {
  ['todo', 'doing', 'done'].forEach((col) => {
    const el = document.getElementById(col + '-tasks');
    el.innerHTML = '';
    tasks[col].forEach((task) => {
      const div = document.createElement('div');
      div.className = 'task';
      div.innerHTML = `<strong>${task.title}</strong><br><small>${task.desc}</small>`;
      el.appendChild(div);
    });
  });
}

function addTask(col) {
  const title = prompt('Título da tarefa:');
  if (!title) return;
  const desc = prompt('Descrição:');
  tasks[col].push({ title, desc, id: Date.now() });
  renderTasks();
}

window.onload = renderTasks;
