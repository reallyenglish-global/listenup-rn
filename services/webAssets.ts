// Static requires ensure Metro includes media in the production web export.
import { Asset } from 'expo-asset';

export const audioUrls = [
  Asset.fromModule(require('../assets/audios/s1/S1.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S2.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S3.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S4.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S5.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S6.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S7.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S8.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S9.mp3')).uri,
  Asset.fromModule(require('../assets/audios/s1/S10.mp3')).uri,
];

export const speakerUrls: Record<string, string> = {
  "Aaron": Asset.fromModule(require('../assets/images/speakers/Aaron.png')).uri,
  "Anna": Asset.fromModule(require('../assets/images/speakers/Anna.png')).uri,
  "Chris": Asset.fromModule(require('../assets/images/speakers/Chris.png')).uri,
  "David": Asset.fromModule(require('../assets/images/speakers/David.png')).uri,
  "Jameela": Asset.fromModule(require('../assets/images/speakers/Jameela.png')).uri,
  "Jeremy": Asset.fromModule(require('../assets/images/speakers/Jeremy.png')).uri,
  "Marcelo": Asset.fromModule(require('../assets/images/speakers/Marcelo.png')).uri,
  "Matt": Asset.fromModule(require('../assets/images/speakers/Matt.png')).uri,
  "Miranda": Asset.fromModule(require('../assets/images/speakers/Miranda.png')).uri,
  "Nick": Asset.fromModule(require('../assets/images/speakers/Nick.png')).uri,
  "Sally": Asset.fromModule(require('../assets/images/speakers/Sally.png')).uri,
};
