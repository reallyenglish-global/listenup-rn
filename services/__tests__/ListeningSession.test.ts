import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListeningSession } from '../ListeningSession';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('ListeningSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts at stage one before persisted progress loads', () => {
    const session = new ListeningSession();
    expect(session.getCurrentStageNumber()).toBe(1);
    expect(session.isComplete()).toBe(false);
  });

  it.each(['not-json', 'null', '0', '999', '1.5', '"2"'])('falls back for invalid progress %s', async (value) => {
    storage.getItem.mockResolvedValue(value);
    const session = new ListeningSession();

    await session.loadProgress();

    expect(session.getCurrentStageNumber()).toBe(1);
  });

  it('loads an in-range persisted stage', async () => {
    storage.getItem.mockResolvedValue('3');
    const session = new ListeningSession();

    await session.loadProgress();

    expect(session.getCurrentStageNumber()).toBe(3);
  });

  it('stays on the final stage and persists completion', async () => {
    const session = new ListeningSession();
    storage.getItem.mockResolvedValue(String(session.getTotalStages()));
    await session.loadProgress();

    await session.moveToNextStage();

    expect(session.isComplete()).toBe(true);
    expect(session.getCurrentStageNumber()).toBe(session.getTotalStages());
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
