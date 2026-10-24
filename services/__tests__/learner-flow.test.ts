import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListeningSession } from '../ListeningSession';
import { Challenge } from '../Challenge';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(),
}));

beforeEach(() => { jest.clearAllMocks(); });

test('session starts safely and final advancement persists completion without an undefined stage', async () => {
  const session = new ListeningSession();
  expect(session.getCurrentStageNumber()).toBe(1);
  for (let i = 0; i < session.getTotalStages(); i++) await session.moveToNextStage();
  expect(session.isComplete()).toBe(true);
  expect(session.getCurrentStageNumber()).toBe(10);
  expect(AsyncStorage.setItem).toHaveBeenLastCalledWith('@current_stage', '11');
});

test.each(['0', '-1', '999', '1.5', 'null', '"2"', 'not-json'])('invalid stored stage %s falls back', async saved => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(saved);
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  const session = new ListeningSession();
  await session.loadProgress();
  expect(session.getCurrentStageNumber()).toBe(1);
  expect(session.isComplete()).toBe(false);
  log.mockRestore();
});

test('completion and in-range progress reload correctly', async () => {
  for (const number of [2, 10, 11]) {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(String(number));
    const session = new ListeningSession();
    await session.loadProgress();
    expect(session.getCurrentStageNumber()).toBe(Math.min(number, 10));
    expect(session.isComplete()).toBe(number === 11);
  }
});

test('repeated challenges never shuffle the source answer encoding', () => {
  const stage = new ListeningSession().getCurrentStage();
  const before = JSON.stringify(stage);
  for (let i = 0; i < 20; i++) {
    const challenge = new Challenge(stage);
    challenge.getQuestions().forEach((question, index) => {
      const answer = stage.questions[index].options[0].split('|')[0];
      challenge.answer(index, answer);
      expect(question.correct).toBe(true);
    });
    expect(challenge.passed()).toBe(true);
  }
  expect(JSON.stringify(stage)).toBe(before);
});

test('correct answer matching rejects substrings', () => {
  const stage = new ListeningSession().getCurrentStage();
  const challenge = new Challenge(stage);
  challenge.answer(0, 'work');
  expect(challenge.getQuestions()[0].correct).toBe(false);
});
