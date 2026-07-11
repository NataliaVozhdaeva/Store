export const createElem = (
  className: string,
  tag: keyof HTMLElementTagNameMap = 'div',
  innerText = ''
): HTMLElement =>
  Object.assign(document.createElement(tag), {
    className,
    innerText
  });
