// Единый обработчик кнопки "показать/скрыть пароль".
// Форма с паролем (formEmailPsw) переиспользуется и на странице login,
// и на signup, поэтому вешаем ОДИН делегированный слушатель на document
// один раз при старте приложения. Раньше эта логика жила внутри signup.ts
// и работала только после рендера страницы регистрации, из-за чего на login
// кнопка не срабатывала вовсе.
export function initPasswordToggle(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || !target.classList.contains('form-psw_toggle')) return;

    // Ищем поле пароля рядом с самой кнопкой, а не через глобальный
    // document.querySelector — так на любой странице попадаем в нужный input.
    const passwordInput = target.parentElement?.querySelector(
      '.form-psw_input'
    ) as HTMLInputElement | null;
    if (!passwordInput) return;

    const isHidden = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isHidden ? 'text' : 'password');
    target.innerHTML = isHidden ? '&#9899;' : '&#9898;';
  });
}
