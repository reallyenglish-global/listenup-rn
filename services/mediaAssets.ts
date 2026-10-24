// Preserve the existing native media contract; web resolves bundled assets separately.
export const resolveAudio = (index: number) => `../assets/audios/s1/S${index + 1}.mp3`;
export const resolveSpeaker = (name: string) => `../assets/images/speakers/${name}@2x.png`;
