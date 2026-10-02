import stagesData from '../assets/audios/s1/stages.json';

export interface Speaker {
  name: string;
  imageUrl: string;
}

export interface Question {
  body: string;
  options: string[];
  correct?: boolean;
  answer?: string;
  correctAnswer?: string;
}

export interface Stage {
  number: number;
  title: string;
  responses: [string, string];
  difficulty: string;
  context: string;
  speakers: Speaker[];
  transcript: string;
  questions: Question[];
  audioUrl: string;
  failedTimes: number;
  duration: number;
}

export class StageManager {
  private stages: Stage[];

  constructor() {
    this.stages = this.parseStages(stagesData);
  }

  private parseStages(data: { stages: Array<Record<string, unknown>> }): Stage[] {
    return data.stages.map((stage, index) => ({
      number: index + 1,
      title: String(stage.title),
      responses: [String(stage.successMessage), String(stage.failureMessage)],
      difficulty: String(stage.difficulty),
      context: String(stage.situation),
      speakers: (stage.speakers as Array<{ name: string; image: string }>).map((speaker) => ({
        name: speaker.name,
        imageUrl: `../assets/images/speakers/${speaker.image}@2x.png`
      })),
      // replace line breaks with <br />
      transcript: String(stage.transcript).replace(/\r/g, '\n'),
      questions: stage.mcqs as Question[],
      audioUrl: `../assets/audios/s1/S${index + 1}.mp3`,
      failedTimes: 0,
      duration: Number(stage.duration)
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
