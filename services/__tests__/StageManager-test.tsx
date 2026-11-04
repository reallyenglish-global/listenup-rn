import { StageManager, Stage } from '../StageManager';

describe('StageManager', () => {
  it('parses stages from data with correct structure', () => {
    const sm = new StageManager();
    const stages = sm.getAllStages();
    expect(stages).toBeInstanceOf(Array);
    expect(stages.length).toBeGreaterThan(0);
    // Verify first stage has expected fields - use actual property names from data
    const first = stages[0];
    expect(first).toHaveProperty('number');
    expect(first).toHaveProperty('title');
    // The actual data uses audioUrl, not audio
    expect(first).toHaveProperty('audioUrl');
    expect(first).toHaveProperty('duration');
    expect(first).toHaveProperty('speakers');
    expect(first).toHaveProperty('questions');
    expect(first).toHaveProperty('transcript');
    expect(first).toHaveProperty('failedTimes');
    expect(first).toHaveProperty('context');
  });

  it('finds a stage by number', () => {
    const sm = new StageManager();
    const stage1 = sm.getStage(1);
    const stage2 = sm.getStage(2);
    expect(stage1).toBeDefined();
    expect(stage2).toBeDefined();
    expect(stage1?.number).toBe(1);
    expect(stage2?.number).toBe(2);
  });

  it('returns undefined for non-existent stage', () => {
    const sm = new StageManager();
    expect(sm.getStage(999)).toBeUndefined();
  });

  it('getTotalStages returns correct count', () => {
    const sm = new StageManager();
    expect(sm.getTotalStages()).toBeGreaterThan(0);
  });
});