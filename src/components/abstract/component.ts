export default abstract class Component {
  public container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
  }

  public render(): HTMLElement {
    return this.container;
  }
}
