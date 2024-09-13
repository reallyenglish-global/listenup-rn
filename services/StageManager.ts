import stagesData from '../assets/audios/s1/stages.json';

export interface Speaker {
  name: string;
  image: string;
}

export interface Stage {
  number: number;
  question: string;
  speakers: Speaker[];
  audio: string;
  duration: number;
}

export class StageManager {
  private stages: Stage[];

  constructor() {
    this.stages = this.parseStages(stagesData);
  }

  private parseStages(data: any): Stage[] {
    return data.stages.map((stage: any, index: number) => ({
      number: index + 1,
      title: stage.title,
      context: stage.situation,
      speakers: stage.speakers.map((speaker: any) => ({
        name: speaker.name,
        imageUrl: `../assets/images/speakers/${speaker.image}@2x.png`
      })),
      // replace line breaks with <br />
      transcript: stage.transcript.replace(/\r/g, '\n'),
      questions: stage.mcqs,
      audioUrl: `../assets/audios/s1/S${index + 1}.mp3`,
      failedTimes: 0,
      duration: stage.duration
    }));
  }

  getAllStages(): Stage[] {
    return this.stages;
  }

  getStage(number: number): Stage | undefined {
    return this.stages.find(stage => stage.number === number);
  }

  getTotalStages(): number {
    return this.stages.length;
  }
}