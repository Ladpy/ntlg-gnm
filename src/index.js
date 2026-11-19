import { parseCoordinates } from './coords.js';
import './style.css';

const timelineEl = document.getElementById('timeline');
const formEl = document.getElementById('input-form');
const textInputEl = document.getElementById('text-input');

const modalOverlay = document.getElementById('modal-overlay');
const coordsInput = document.getElementById('coords-input');
const modalError = document.getElementById('modal-error');
const modalCancel = document.getElementById('modal-cancel');
const modalSubmit = document.getElementById('modal-submit');

/** @type {{ text: string, latitude: number, longitude: number, createdAt: Date }[]} */
const posts = [];

let pendingText = null;
let pendingCreatedAt = null;

// ---------- Форматирование даты ----------
function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

// ---------- Отрисовка ----------
function renderPosts() {
  timelineEl.innerHTML = '';

  [...posts].reverse().forEach((post) => {
    const postEl = document.createElement('article');
    postEl.className = 'post';

    // Семантический заголовок карточки с датой/временем в правом верхнем углу.
    const headerEl = document.createElement('header');
    headerEl.className = 'post-header';

    const timeEl = document.createElement('time');
    timeEl.className = 'post-time';
    timeEl.dateTime = post.createdAt.toISOString(); // ISO 8601 для семантики
    timeEl.textContent = formatDateTime(post.createdAt);
    timeEl.title = post.createdAt.toString();

    headerEl.append(timeEl);

    const textEl = document.createElement('div');
    textEl.className = 'post-text';
    textEl.textContent = post.text;

    const coordsEl = document.createElement('div');
    coordsEl.className = 'post-coords';
    coordsEl.textContent = `${post.latitude}, ${post.longitude}`;

    postEl.append(headerEl, textEl, coordsEl);
    timelineEl.append(postEl);
  });
}

function addPost(text, latitude, longitude, createdAt) {
  posts.push({ text, latitude, longitude, createdAt });
  renderPosts();
}

// ---------- Модальное окно ----------
function openModal() {
  modalOverlay.classList.add('active');
  coordsInput.value = '';
  coordsInput.classList.remove('invalid');
  modalError.textContent = '';
  coordsInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('active');
  pendingText = null;
  pendingCreatedAt = null;
}

function showModalError(message) {
  coordsInput.classList.add('invalid');
  modalError.textContent = message;
}

// ---------- Получение координат ----------
function getUserCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation API не поддерживается'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ---------- Отправка текста ----------
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = textInputEl.value.trim();
  if (!text) return;

  // Время фиксируем в момент создания записи пользователем.
  const createdAt = new Date();

  try {
    const coords = await getUserCoordinates();
    addPost(text, coords.latitude, coords.longitude, createdAt);
    textInputEl.value = '';
  } catch (err) {
    pendingText = text;
    pendingCreatedAt = createdAt;
    openModal();
  }
});

// ---------- Ручной ввод координат ----------
modalSubmit.addEventListener('click', () => {
  const raw = coordsInput.value;

  try {
    const { latitude, longitude } = parseCoordinates(raw);
    if (pendingText) {
      addPost(pendingText, latitude, longitude, pendingCreatedAt || new Date());
      pendingText = null;
      pendingCreatedAt = null;
      textInputEl.value = '';
    }
    closeModal();
  } catch (err) {
    // Сюда попадут и ошибки формата, и ошибки диапазона — с понятным текстом.
    showModalError(err.message);
  }
});

modalCancel.addEventListener('click', () => {
  closeModal();
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});
