import Teammate from '../../components/teammate';
import { teammates } from '../../utils';

interface ITeammate {
  name: string;
  bio: string;
  git: string;
  photo?: string;
}

export default class AboutView {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('section');
    this.container.classList.add('about-us');
  }

  public renderHero(): string {
    const header = `<h1>About Us</h1>`;
    return `<div class="about-hero">${header}</div>`;
  }

  public renderTeam(arr: ITeammate[]): string {
    return `
    <div class="about-wrapper">
      <p class="subtitle subtitle--green">Team</p>
      <h2 class="about-title">Our Develop Experts</h2>
      <p class="about-text">Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
      <p class="about-text">Our milk comes from the happiest cows, and our fruit is picked from genuinely cheerful trees. The only sad part? This could have been a cool store, it's even a bit of a shame that it's all fiction.</div>`;
  }

  public render(): HTMLElement {
    this.container.innerHTML = `${this.renderHero()}${this.renderTeam(
      teammates
    )}`;
    return this.container;
  }
}
