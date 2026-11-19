/**
 * Разбирает строку с координатами и валидирует их диапазоны.
 *
 * Широта:  [-90, 90]
 * Долгота: [-180, 180]
 *
 * Поддерживаемые форматы:
 *   "51.50851, −0.12572"   (пробел после запятой)
 *   "51.50851,−0.12572"    (без пробела)
 *   "[51.50851, −0.12572]" (в квадратных скобках)
 *
 * @param {string} input
 * @returns {{ latitude: number, longitude: number }}
 * @throws {Error} если формат неверный или значение вне допустимого диапазона
 */
export function parseCoordinates(input) {
  if (typeof input !== 'string') {
    throw new Error('Координаты должны быть строкой');
  }

  // Нормализуем математический минус (U+2212) в обычный дефис.
  const normalized = input.trim().replace(/−/g, '-');

  const regex = /^\[?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]?$/;
  const match = normalized.match(regex);

  if (!match) {
    throw new Error(
      'Неверный формат координат. Ожидается: "широта, долгота" или "[широта, долгота]"'
    );
  }

  const latitude = parseFloat(match[1]);
  const longitude = parseFloat(match[2]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error('Не удалось распознать числовые значения координат');
  }

  // Проверка диапазонов — физические границы координат на Земле.
  if (latitude < -90 || latitude > 90) {
    throw new Error(
      `Широта должна быть в диапазоне от -90 до 90 (получено: ${latitude})`
    );
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error(
      `Долгота должна быть в диапазоне от -180 до 180 (получено: ${longitude})`
    );
  }

  return { latitude, longitude };
}
