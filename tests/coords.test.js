import { parseCoordinates } from '../src/coords.js';

describe('parseCoordinates', () => {
  test('51.50851, −0.12572 (пробел после запятой)', () => {
    const result = parseCoordinates('51.50851, −0.12572');
    expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
  });

  test('51.50851,−0.12572 (без пробела)', () => {
    const result = parseCoordinates('51.50851,−0.12572');
    expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
  });

  test('[51.50851, −0.12572] (в квадратных скобках)', () => {
    const result = parseCoordinates('[51.50851, −0.12572]');
    expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
  });

  test('обычный дефис вместо математического минуса', () => {
    const result = parseCoordinates('51.50851, -0.12572');
    expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
  });

  test('лишние пробелы вокруг значений', () => {
    const result = parseCoordinates('  51.50851 ,  -0.12572  ');
    expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
  });

  test('неверный формат — буквы', () => {
    expect(() => parseCoordinates('abc, def')).toThrow();
  });

  test('неверный формат — одно число', () => {
    expect(() => parseCoordinates('51.50851')).toThrow();
  });

  test('неверный формат — пустая строка', () => {
    expect(() => parseCoordinates('')).toThrow();
  });

  test('неверный формат — лишние символы', () => {
    expect(() => parseCoordinates('51.50851, -0.12572 extra')).toThrow();
  });

  test('не строка', () => {
    expect(() => parseCoordinates(null)).toThrow();
    expect(() => parseCoordinates(123)).toThrow();
  });
});
