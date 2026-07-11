const createCodeTemplate = (): string => {
  return `
  <section class="signup signup--heading">
    <div class="signup-content_wrapper">
      <div class="signup-background-image">
        <h1 class="signup-title">Sign up</h1>
      </div>
    </div>
  </section>
  `;
};

export default class SignupTitleView {
  public get render(): string {
    return createCodeTemplate();
  }
}
