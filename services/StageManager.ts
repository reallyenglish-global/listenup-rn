import { resolveAudio, resolveSpeaker } from './mediaAssets';
import stagesData from '../assets/audios/s1/stages.json';

export interface Speaker {
  name: string;
  imageUrl: string;
}

export interface Stage {
  number: number;
  title: string;
  responses: string[];
  difficulty: number;
  context: string;
  speakers: Speaker[];
  transcript: string;
  questions: { body: string; options: string[] }[];
  audioUrl: string;
  failedTimes: number;
  duration: string;
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
      responses: [stage.successMessage, stage.failureMessage],
      difficulty: stage.difficulty,
      context: stage.situation,
      speakers: stage.speakers.map((speaker: any) => ({
        name: speaker.name,
        imageUrl: resolveSpeaker(speaker.image)
      })),
      // replace line breaks with <br />
      transcript: stage.transcript.replace(/\r/g, '\n'),
      questions: stage.mcqs,
      audioUrl: resolveAudio(index),
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
