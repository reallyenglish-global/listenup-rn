import { StageManager, Stage } from './StageManager';

export class Challenge {
  constructor(stage) {
    this.questions = stage.questions;
    this.responses = stage.responses;
    this.currentQuestionIndex = 0;
    this.shuffleQuestions();
  }

  shuffleQuestions(): void {
    this.questions.map(question => {
      question['correct'] = false;
      question['answer'] = '';
      question['correctAnswer'] = question.options[0];
      question['options'] = question.options.sort(() => Math.random() - 0.5)
        .map(option => option.split('|').sort(() => Math.random() - 0.5)[0])
    });
    this.questions = this.questions.sort(() => Math.random() - 0.5);
  }

  answer(id, answer): boolean {
    let question = this.questions[id];
    question['answer'] = answer;
    question['correct'] = answer == question.answer;
  }

  passed(): boolean {
    this.questions.length == this.questions.filter(question => question['correct']).length;
  }

  response(): string {
    if (this.passed()) {
      return this.responses[0];
    } else {
      return this.responses[1];
    }
  }
}
