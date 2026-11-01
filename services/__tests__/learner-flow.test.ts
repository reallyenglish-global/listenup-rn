import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge } from '../Challenge';
import { ListeningSession } from '../ListeningSession';
import { StageManager } from '../StageManager';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test('retry does not shuffle the authoritative answer key', () => {
  const stage = new StageManager().getStage(1)!;
  const original = JSON.stringify(stage.questions);
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  try {
    new Challenge(stage);
    expect(JSON.stringify(stage.questions)).toBe(original);
  } finally { random.mockRestore(); }
});

test('a correct answer must match a complete alternative, not a substring', () => {
  const challenge = new Challenge(new StageManager().getStage(1)!);
  challenge.answer(0, 'work');
  expect(challenge.getQuestions()[0].correct).toBe(false);
});

test('success and failure show the corresponding stage feedback', () => {
  const stage = new StageManager().getStage(1)!;
  const challenge = new Challenge(stage);
  expect(challenge.response()).toBe(stage.responses[1]);
  stage.questions.forEach((q, i) => challenge.answer(i, q.options[0].split('|')[0]));
  expect(challenge.passed()).toBe(true);
  expect(challenge.response()).toBe(stage.responses[0]);
});

test.each(['null', '0', '999', '"2"', '{broken'])('invalid saved stage %s recovers to stage one', async saved => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(saved);
  const session = new ListeningSession();
  await session.loadProgress();
  expect(session.getCurrentStageNumber()).toBe(1);
});

test('completed stage progresses and restores after a fresh session', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  const session = new ListeningSession();
  await session.loadProgress();
  await session.moveToNextStage();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('@current_stage', '2');
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2');
  const reopened = new ListeningSession();
  await reopened.loadProgress();
  expect(reopened.getCurrentStageNumber()).toBe(2);
});

test('finishing the final stage never persists a nonexistent stage', async () => {
  const total = new StageManager().getTotalStages();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(String(total));
  const session = new ListeningSession();
  await session.loadProgress();
  await session.moveToNextStage();
  expect(session.getCurrentStageNumber()).toBe(total);
  expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('@current_stage', String(total + 1));
});


test('storage read failure still launches a usable first lesson', async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('unavailable'));
  const session = new ListeningSession();
  await session.loadProgress();
  expect(session.getCurrentStageNumber()).toBe(1);
});

test('failed progress save neither advances nor prevents retry', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  const session = new ListeningSession();
  await session.loadProgress();
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('full'));
  await expect(session.moveToNextStage()).rejects.toThrow('full');
  expect(session.getCurrentStageNumber()).toBe(1);
  await session.moveToNextStage();
  expect(session.getCurrentStageNumber()).toBe(2);
});
