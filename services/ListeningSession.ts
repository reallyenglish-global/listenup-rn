import AsyncStorage from '@react-native-async-storage/async-storage';
import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private stageManager = new StageManager();
  private currentStage: Stage = this.stageManager.getStage(1)!;

  getCurrentStage(): Stage { return this.currentStage; }
  getCurrentStageNumber(): number { return this.currentStage.number; }
  getTotalStages(): number { return this.stageManager.getTotalStages(); }
  getAllStages(): Stage[] { return this.stageManager.getAllStages(); }

  async moveToNextStage(): Promise<void> {
    const next = this.stageManager.getStage(this.currentStage.number + 1);
    // At the end of the bundled course, keep the final stage replayable.
    if (!next) return;
    // Persist first: do not display progress that a failed save cannot restore.
    await AsyncStorage.setItem('@current_stage', JSON.stringify(next.number));
    this.currentStage = next;
  }

  async saveProgress(): Promise<void> {
    await AsyncStorage.setItem('@current_stage', JSON.stringify(this.currentStage.number));
  }

  async loadProgress(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('@current_stage');
      const number = saved === null ? 1 : JSON.parse(saved);
      this.currentStage = (Number.isInteger(number) && this.stageManager.getStage(number)) || this.stageManager.getStage(1)!;
    } catch {
      // Unavailable/corrupt local storage must not prevent a usable launch.
      this.currentStage = this.stageManager.getStage(1)!;
    }
  }
}
