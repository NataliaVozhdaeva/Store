import Router from '../services/router/router';

const createCodeTemplate = (): string => {
  return `
  <section class="about about--main_page">
    <div class="about-content_wrapper">
      <div class="about-info">
        <p class="subtitle subtitle--green">About Us</p>
        <h2 class="about-title">We Believe in Working Accredited Farmers</h2>
        <p class="about-text">Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
      </div>
      <ul class="about-features list">
        <li class="about-item feature">
          <h6 class="feature-title">Organic Foods Only</h6>
          <p class="feature-text about-text">Simply dummy text of the printing and typesetting industry. Lorem Ipsum</p>
        </li>
        <li class="about-item feature">
          <h6 class="feature-title">Quality Standards</h6>
          <p class="feature-text about-text">Simply dummy text of the printing and typesetting industry. Lorem Ipsum</p>
        </li>
      </ul>
      <a href="${Router.pages.about}" class="about-btn btn btn--blue link">Learn more</a>
    </div>
  </section>`;
};

export default class MainAboutView {
  public get render(): string {
    return createCodeTemplate();
  }
}
