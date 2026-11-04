import { Stage } from '../StageManager';
import { Challenge } from '../Challenge';

describe('Challenge', () => {
  let stage: Stage;
  let challenge: Challenge;

  beforeEach(() => {
    stage = {
      questions: [
        {
          id: 1,
          text: 'Q1?',
          options: ['After work|When she finishes work.', 'At work|When she is working.', 'In the office|When she wakes up.'],
          responses: ['Correct!', 'Try again!'],
          transcript: '',
          context: '',
          failedTimes: 0,
        },
      ],
      responses: ['Correct!', 'Try again!'],
    };
    challenge = new Challenge(stage);
  });

  it('initializes questions with correctAnswer set to first option', () => {
    const questions = challenge.getQuestions();
    expect(questions.length).toBe(1);
    // correctAnswer is the original first option before shuffling
    expect(questions[0].correctAnswer).toBe('After work|When she finishes work.');
    expect(questions[0].correct).toBe(false);
    expect(questions[0].answer).toBe('');
  });

  it('answer method marks correct when answer text is substring of correctAnswer', () => {
    challenge.answer(0, 'After work');
    expect(challenge.getQuestions()[0].correct).toBe(true);
  });

  it('answer method marks incorrect when answer text is not substring', () => {
    challenge.answer(0, 'Option B');
    expect(challenge.getQuestions()[0].correct).toBe(false);
  });

  it('passed returns true when all questions are correct', () => {
    challenge.answer(0, 'After work');
    expect(challenge.passed()).toBe(true);
  });

  it('passed returns false when not all questions are correct', () => {
    // Don't answer - question stays incorrect
    expect(challenge.passed()).toBe(false);
  });

  it('response returns Correct! when passed, Try again! otherwise', () => {
    // Before answering - not passed, should return second response
    const initialResponse = challenge.response();
    expect(initialResponse).toBe('Try again!');
    
    challenge.answer(0, 'After work');
    expect(challenge.response()).toBe('Correct!');
  });

  it('getCurrentQuestionIndex returns 0 initially', () => {
    expect(challenge.getCurrentQuestionIndex()).toBe(0);
  });

  it('setCurrentQuestionIndex updates the index', () => {
    challenge.setCurrentQuestionIndex(1);
    expect(challenge.getCurrentQuestionIndex()).toBe(1);
  });
});