import Router from '../../services/router/router';

export default class NotFoundView {
  public get render(): string {
    return `<section class="not-found">
      <div class="not-found-image"></div>
      <div class="not-found-info">
        <div class="not-found-info-title">404</div>
        <div class="not-found-info-subtitle">Page not found</div>
        <div class="not-found-info-description">The page you are looking for doesn't exist or has been moved</div>
        <a class="not-found-info-link" href=${Router.pages.main}><div class="btn btn--blue not-found-btn">Go to Homepage</div></a>
      </div>
    </section>`;
  }
}
