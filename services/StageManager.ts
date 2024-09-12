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
    return data.stages.map((stage: any) => ({
      number: stage.number,
      question: stage.question,
      speakers: stage.speakers.map((speaker: any) => ({
        name: speaker.name,
        image: `../assets/images/speakers/${speaker.image}.png`
      })),
      audio: stage.audio,
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