export default abstract class Router {
  public static pages = {
    main: '#main',
    about: '#about',
    catalog: '#catalog',
    login: '#login',
    signup: '#signup',
    profile: '#profile',
    notFound: '#404',
    cart: '#cart'
  };

  public static navigate(location: string): void {
    window.location.hash = location;
  }
}
