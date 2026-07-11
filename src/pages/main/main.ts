import MainHeroView from '../../components/main-hero';
import MainOfferView from '../../components/main-offers';
import MainAboutView from '../../components/main-about';
import MainCatalogView from '../../components/main-catalog';
import SpecialOfferView from '../../components/main-special';

const createCodeTemplate = (): string => {
  const mainHeroView = new MainHeroView().render;
  const mainOfferView = new MainOfferView().render;
  const mainAboutView = new MainAboutView().render;
  const mainCatalogView = new MainCatalogView().render;
  const specialOfferView = new SpecialOfferView().render;

  return `${mainHeroView}${mainOfferView}${mainAboutView}${mainCatalogView}${specialOfferView}`;
};

export default class MainView {
  public get render(): string {
    return createCodeTemplate();
  }
}
