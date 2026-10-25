const people = {
  lena: { initials: 'LL', avatarClass: 'avatar-lena' },
  jonas: { initials: 'CL', avatarClass: 'avatar-jonas' },
  amira: { initials: 'BL', avatarClass: 'avatar-amira' },
};

const initialTasks = [
  {
    title: 'Wäsche waschen',
    description: 'Schmutzige Wäsche sortieren, waschen und zum Trocknen aufhängen.',
    category: 'Wäsche',
    assignee: 'lena',
    due: 'Kein Termin',
    status: 'tasks',
    priority: 'normal',
  },
  {
    title: 'Zimmer aufräumen',
    description: 'Gegenstände wegräumen und Oberflächen ordentlich hinterlassen.',
    category: 'Ordnung',
    assignee: 'jonas',
    due: 'Kein Termin',
    status: 'tasks',
    priority: 'normal',
  },
  {
    title: 'Geschirr spülen',
    description: 'Benutztes Geschirr abwaschen und anschließend abtrocknen.',
    category: 'Küche',
    assignee: 'amira',
    due: 'Kein Termin',
    status: 'tasks',
    priority: 'normal',
  },
  {
    title: 'Hund Gassi gehen',
    description: 'Mit dem Hund eine Runde draußen spazieren gehen.',
    category: 'Haustier',
    assignee: 'lena',
    due: 'Kein Termin',
    status: 'tasks',
    priority: 'normal',
  },
];

const categoryClasses = {
  Wäsche: 'category-waesche',
  Ordnung: 'category-ordnung',
  Küche: 'category-kueche',
  Haustier: 'category-haustier',
};

const taskDialog = document.querySelector('#task-dialog');
const taskForm = document.querySelector('#task-form');
const searchInput = document.querySelector('#search-input');
const assigneeFilter = document.querySelector('#assignee-filter');
let taskId = 0;
let targetStatus = 'tasks';

function createTaskCard(task) {
  const person = people[task.assignee];
  const card = document.createElement('article');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.assignee = task.assignee;
  card.dataset.taskId = String(++taskId);

  const top = document.createElement('div');
  top.className = 'task-card-top';
  const category = document.createElement('span');
  category.className = `category ${categoryClasses[task.category] ?? 'category-ordnung'}`;
  category.textContent = task.category;
  const priority = document.createElement('span');
  priority.className = `priority${task.priority === 'high' ? ' priority-high' : ''}`;
  priority.setAttribute('aria-label', task.priority === 'high' ? 'Hohe Priorität' : 'Normale Priorität');
  priority.textContent = task.priority === 'high' ? '•••' : '••';
  top.append(category, priority);

  const title = document.createElement('h3');
  title.textContent = task.title;
  const description = document.createElement('p');
  description.className = 'task-description';
  description.textContent = task.description;

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const assignee = document.createElement('div');
  assignee.className = 'task-assignee';
  const avatar = document.createElement('span');
  avatar.className = `avatar ${person.avatarClass}`;
  avatar.setAttribute('aria-label', person.initials);
  avatar.textContent = person.initials;
  assignee.append(avatar);

  const due = document.createElement('span');
  due.className = 'task-due';
  due.textContent = task.due;
  meta.append(assignee, due);
  card.append(top, title, description, meta);

  return card;
}

function updateCounts() {
  document.querySelectorAll('.kanban-column').forEach((column) => {
    const status = column.dataset.status;
    const count = column.querySelectorAll('.task-card').length;
    column.querySelector(`[data-count-for="${status}"]`).textContent = String(count);
  });
}

function applyFilters() {
  const query = searchInput.value.trim().toLocaleLowerCase('de');
  const selectedAssignee = assigneeFilter.value;

  document.querySelectorAll('.task-card').forEach((card) => {
    const matchesText = card.textContent.toLocaleLowerCase('de').includes(query);
    const matchesAssignee = selectedAssignee === 'all' || card.dataset.assignee === selectedAssignee;
    card.hidden = !matchesText || !matchesAssignee;
  });
}

initialTasks.forEach((task) => {
  document.querySelector(`[data-list-for="${task.status}"]`).append(createTaskCard(task));
});
updateCounts();

document.querySelectorAll('[data-add-to]').forEach((button) => {
  button.addEventListener('click', () => {
    targetStatus = button.dataset.addTo;
    taskForm.reset();
    taskDialog.showModal();
    taskForm.elements.title.focus();
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => taskDialog.close());
document.querySelector('.cancel-button').addEventListener('click', () => taskDialog.close());

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const category = formData.get('category');
  const task = {
    title: String(formData.get('title')).trim(),
    description: String(formData.get('description')).trim() || 'Noch keine Beschreibung hinzugefügt.',
    assignee: String(formData.get('assignee')),
    category: String(category),
    due: 'Kein Termin',
    status: targetStatus,
    priority: 'normal',
  };

  if (!task.title || !people[task.assignee] || !categoryClasses[task.category]) {
    return;
  }

  document.querySelector(`[data-list-for="${targetStatus}"]`).append(createTaskCard(task));
  updateCounts();
  applyFilters();
  taskDialog.close();
});

searchInput.addEventListener('input', applyFilters);
assigneeFilter.addEventListener('change', applyFilters);

document.querySelectorAll('.task-list').forEach((list) => {
  list.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.task-card');
    if (!card) return;
    card.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', card.dataset.taskId);
  });

  list.addEventListener('dragend', (event) => {
    const card = event.target.closest('.task-card');
    if (card) card.classList.remove('dragging');
    document.querySelectorAll('.kanban-column.drag-over').forEach((column) => column.classList.remove('drag-over'));
  });
});

document.querySelectorAll('.kanban-column').forEach((column) => {
  column.addEventListener('dragover', (event) => {
    event.preventDefault();
    column.classList.add('drag-over');
    event.dataTransfer.dropEffect = 'move';
  });

  column.addEventListener('dragleave', (event) => {
    if (!column.contains(event.relatedTarget)) column.classList.remove('drag-over');
  });

  column.addEventListener('drop', (event) => {
    event.preventDefault();
    column.classList.remove('drag-over');
    const draggedId = event.dataTransfer.getData('text/plain');
    const card = document.querySelector(`[data-task-id="${draggedId}"]`);
    const list = column.querySelector('.task-list');
    if (!card || !list) return;
    list.append(card);
    updateCounts();
    applyFilters();
  });
});
