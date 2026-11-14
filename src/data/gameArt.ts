import heroBanner from '../assets/images/hero_takamiya_esports_1794619154280.jpg';
import mlArt from '../assets/images/game_mobile_legends_1794619154001.jpg';
import ffArt from '../assets/images/game_free_fire_1794619153944.jpg';
import giArt from '../assets/images/game_genshin_impact_1794619154606.jpg';
import wwArt from '../assets/images/game_wuthering_waves_1794619154660.jpg';
import nteArt from '../assets/images/game_nte_anomaly_1794619155199.jpg';
import { GameId } from '../types/store';

export const HERO_ART = heroBanner;

export const GAME_ART: Record<GameId, string> = {
  'mobile-legends': mlArt,
  'free-fire': ffArt,
  'genshin-impact': giArt,
  'wuthering-waves': wwArt,
  'neverness-to-everness': nteArt,
};
