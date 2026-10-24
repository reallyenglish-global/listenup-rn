import { audioUrls, speakerUrls } from './webAssets';
export const resolveAudio = (index: number) => audioUrls[index];
export const resolveSpeaker = (name: string) => speakerUrls[name];
