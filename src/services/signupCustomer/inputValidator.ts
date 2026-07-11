export default class InputValidator {
  private className: string;
  private validationFunction: (input: string) => boolean;
  private errorMessage: string;

  constructor(
    className: string,
    validationFunction: (input: string) => boolean,
    errorMessage: string
  ) {
    this.className = className;
    this.validationFunction = validationFunction;
    this.errorMessage = errorMessage;
    this.init();
  }

  public init(): void {
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.classList.contains(this.className)) {
        this.handleValidation(target);
      }
    });
  }

  public handleValidation(inputElement: HTMLInputElement): void {
    const inputText = inputElement.value;
    const errorElement = inputElement.nextElementSibling as HTMLElement;

    if (this.validationFunction(inputText)) {
      inputElement.classList.remove('error');
      errorElement.textContent = '';
    } else {
      inputElement.classList.add('error');
      errorElement.textContent = this.errorMessage;
    }
  }
}
