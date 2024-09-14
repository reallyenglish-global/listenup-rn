import { Stage } from './StageManager';

export class Challenge {
  private questions: any[];
  private responses: string[];
  private currentQuestionIndex: number;

  constructor(stage: Stage) {
    this.questions = stage.questions;
    this.responses = stage.responses;
    this.currentQuestionIndex = 0;
    this.initializeQuestions();
  }

  private initializeQuestions(): void {
    this.questions = this.questions.map(question => ({
      ...question,
      correct: false,
      answer: '',
      correctAnswer: question.options[0],
      options: question.options
        .sort(() => Math.random() - 0.5)
        .map(option => option.split('|').sort(() => Math.random() - 0.5)[0])
    }));
    //this.questions.sort(() => Math.random() - 0.5);
  }

  answer(id: number, answer: string): void {
    let question = this.questions[id];
    question.answer = answer;
    question.correct = question.correctAnswer.indexOf(answer) > -1;
  }

  passed(): boolean {
    console.log('=====', this.questions)
    return this.questions.every(question => question.correct);
  }

  response(): string {
    return this.passed() ? this.responses[0] : this.responses[1];
  }

  getQuestions(): any[] {
    return this.questions;
  }

  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  setCurrentQuestionIndex(index: number): void {
    this.currentQuestionIndex = index;
  }
}
