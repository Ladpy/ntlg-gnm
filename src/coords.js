/**
 * Разбирает строку с координатами.
 * Поддерживаемые форматы:
 *   "51.50851, −0.12572"   (пробел после запятой)
 *   "51.50851,−0.12572"    (без пробела)
 *   "[51.50851, −0.12572]" (в квадратных скобках)
 *
 * @param {string} input
 * @returns {{ latitude: number, longitude: number }}
 * @throws {Error} если формат не соответствует ожидаемому
 */
export function parseCoordinates(input) {
  if (typeof input !== 'string') {
    throw new Error('Координаты должны быть строкой');
  }

  // Нормализуем математический минус (U+2212) в обычный дефис.
  // Это позволяет не тащить «−» в регулярку отдельным токеном
  // и не терять знак числа.
  const normalized = input.trim().replace(/−/g, '-');

  // Опциональные квадратные скобки, два числа (возможно отрицательных)
  // через запятую, с произвольными пробелами вокруг.
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

  return { latitude, longitude };
}