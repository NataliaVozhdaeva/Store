const createCodeTemplate = (): string => {
  return `<section class="hero hero--main_page">
    <div class="hero-content_wrapper">
      <p class="subtitle subtitle--green">100% Natural Food</p>
      <h1 class="hero-title">Choose the best healthier way of&nbsp;life</h1>
      <a class="hero-link_signup" href="#signup">
        <button class="hero-btn btn btn--yellow">Create an account now</button>
      </a>
      <p class="hero-link_login">Already have an account? Log in <a href="#login">here</a></p>
      
    </div>
  </section>`;
};

export default class MainHeroView {
  public get render(): string {
    return createCodeTemplate();
  }
}
