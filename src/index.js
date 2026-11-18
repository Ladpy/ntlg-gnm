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

/** @type {{ text: string, latitude: number, longitude: number }[]} */
const posts = [];

let pendingText = null; // текст, ожидающий координат

// ---------- Отрисовка ----------
function renderPosts() {
  timelineEl.innerHTML = '';
  // Самый новый пост — сверху
  [...posts].reverse().forEach((post) => {
    const postEl = document.createElement('div');
    postEl.className = 'post';

    const textEl = document.createElement('div');
    textEl.className = 'post-text';
    textEl.textContent = post.text;

    const coordsEl = document.createElement('div');
    coordsEl.className = 'post-coords';
    coordsEl.textContent = `${post.latitude}, ${post.longitude}`;

    postEl.append(textEl, coordsEl);
    timelineEl.append(postEl);
  });
}

function addPost(text, latitude, longitude) {
  posts.push({ text, latitude, longitude });
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
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ---------- Обработка отправки текста ----------
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = textInputEl.value.trim();
  if (!text) return;

  try {
    const coords = await getUserCoordinates();
    addPost(text, coords.latitude, coords.longitude);
    textInputEl.value = '';
  } catch (err) {
    // Координаты недоступны — показываем модальное окно
    pendingText = text;
    openModal();
  }
});

// ---------- Ручной ввод координат ----------
modalSubmit.addEventListener('click', () => {
  const raw = coordsInput.value;

  try {
    const { latitude, longitude } = parseCoordinates(raw);
    if (pendingText) {
      addPost(pendingText, latitude, longitude);
      pendingText = null;
      textInputEl.value = '';
    }
    closeModal();
  } catch (err) {
    showModalError(err.message);
  }
});

modalCancel.addEventListener('click', () => {
  closeModal();
});

// Закрытие по клику на оверлей
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Закрытие по Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});
