export default class FooterView {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('footer');
    this.container.classList.add('footer');
    this.container.innerHTML = `<div class="footer-contacts">
    <h5 class="footer-title">Contact Us</h5>
    <ul class="contacts-list list">
      <li class="contacts-item">
        <p class="contacts-title">Email</p><a href="mailto:blablabla@bla-bla.com" class="footer-text link">blablabla@bla-bla.com</a>
      </li>
      <li class="contacts-item">
        <p class="contacts-title">Phone</p><a href="tel:+3223322" class="footer-text link">322-33-22</a>
      </li>
      <li class="contacts-item">
        <p class="contacts-title">Address</p><a class="footer-text link">88 road, Bla-bla street, Krakozhia</a>
      </li>
    </ul>
  </div>
  <div class="footer-info">
    <div class="footer-logo logo"><img src="./images/Logo.png" alt="logo" class="logo-img" width="37" height="54"/><h4 class="logo-text">Organick</h4> </div>
    <p class="footer-text">Simply dummy text of the printing and typesetting industry.</br>Lorem Ipsum simply dummy text of the printing </p>
    <ul class="info-list list">
      <li class="info-item"><a href="" class="info-link link"><img src="./images/icons/insta-icon.png" alt="insta" class="info-icon"></a></li>
      <li class="info-item"><a href="" class="info-link link"><img src="./images/icons/fb-icon.png" alt="facebook" class="info-icon"></a></li>
      <li class="info-item"><a href="" class="info-link link"><img src="./images/icons/twi-icon.png" alt="twitter" class="info-icon"></a></li>
      <li class="info-item"><a href="" class="info-link link"><img src="./images/icons/pin-icon.png" alt="pinterest" class="info-icon"></a></li>
    </ul>
  </div>
  <div class="footer-additional">
    <h5 class="footer-title">Utility Pages</h5>
    <ul class="additional-list list">
      <li class="additional-item footer-text">Style Guide</li>
      <li class="additional-item footer-text">404 Not Found</li>
      <li class="additional-item footer-text">Password Protected</li>
      <li class="additional-item footer-text">Licences</li>
      <li class="additional-item footer-text">Changelog</li>
    </ul>
  </div>`;
  }

  public render(): HTMLElement {
    return this.container;
  }
}
