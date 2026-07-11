/**
 * @jest-environment jsdom
 */

import { createElem } from '../services/viewBuilderFunction';

test('DOM element creation', () => {
  const elem1 = createElem('className1');
  expect(elem1).not.toBeNull();
  expect(elem1 instanceof HTMLDivElement).toBe(true);
  expect(elem1.classList.contains('className1')).toBe(true);

  const elem2 = createElem('className2', 'span', 'Elem2');
  expect(elem2).not.toBeNull();
  expect(elem2 instanceof HTMLSpanElement).toBe(true);
  expect(elem2.classList.contains('className2')).toBe(true);
  expect(elem2.innerText).toBe('Elem2');

  const elem3 = createElem('className3 modifier3', 'button', 'Elem3');
  expect(elem3).not.toBeNull();
  expect(elem3 instanceof HTMLButtonElement).toBe(true);
  expect(elem3.classList.contains('className3')).toBe(true);
  expect(elem3.classList.contains('modifier3')).toBe(true);
  expect(elem3.innerText).toBe('Elem3');
});
