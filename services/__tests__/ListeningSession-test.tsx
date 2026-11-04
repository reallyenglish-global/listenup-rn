import { ListeningSession } from '../ListeningSession';

describe('ListeningSession', () => {
  it('initializes with stage 1 when no saved progress', async () => {
    // Mock AsyncStorage to return null (no saved progress)
    const mockSetItem = jest.fn().mockResolvedValue(undefined);
    const mockGetItem = jest.fn().mockResolvedValue(null);
    
    // We need to mock @react-native-async-storage/async-storage
    jest.mock('@react-native-async-storage/async-storage', () => ({
      setItem: mockSetItem,
      getItem: mockGetItem,
    }));

    const session = new ListeningSession();
    await session.loadProgress();
    
    // Should default to stage 1
    expect(session.getCurrentStageNumber()).toBe(1);
  });

  it('loads progress when saved stage exists', async () => {
    const mockSetItem = jest.fn().mockResolvedValue(undefined);
    const mockGetItem = jest.fn().mockResolvedValue('3');
    
    jest.mock('@react-native-async-storage/async-storage', () => ({
      setItem: mockSetItem,
      getItem: mockGetItem,
    }));

    const session = new ListeningSession();
    await session.loadProgress();
    
    expect(session.getCurrentStageNumber()).toBe(3);
  });

  it('moves to next stage correctly', async () => {
    const mockSetItem = jest.fn().mockResolvedValue(undefined);
    const mockGetItem = jest.fn().mockResolvedValue('1');
    
    jest.mock('@react-native-async-storage/async-storage', () => ({
      setItem: mockSetItem,
      getItem: mockGetItem,
    }));

    const session = new ListeningSession();
    await session.loadProgress();
    
    // Initially at stage 1
    expect(session.getCurrentStageNumber()).toBe(1);
    
    // Move to next stage
    await session.moveToNextStage();
    
    // Should now be at stage 2
    expect(session.getCurrentStageNumber()).toBe(2);
  });
});