export default class InfoElem {
  private className: string;
  private title: string;
  private data: string;
  private container: HTMLElement;

  constructor(className: string, title: string, data: string) {
    this.className = className;
    this.title = title;
    this.data = data;
    this.container = document.createElement('div');
    this.container.className = this.className;
    this.createElem();
  }

  public createElem(): void {
    const titleElem = document.createElement('div');
    titleElem.className = `${this.className}-title`;
    titleElem.innerHTML = this.title;
    const dataElem = document.createElement('div');
    dataElem.className = `${this.className}-data`;
    dataElem.innerHTML = this.data;
    this.container.append(titleElem, dataElem);
  }

  public render(): HTMLElement {
    return this.container;
  }
}
