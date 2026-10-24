import AsyncStorage from '@react-native-async-storage/async-storage';
import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private stageManager = new StageManager();
  private currentStage: Stage = this.stageManager.getStage(1)!;
  private loaded = false;
  private completed = false;

  getCurrentStage(): Stage { return this.currentStage; }
  getCurrentStageNumber(): number { return this.currentStage.number; }
  getTotalStages(): number { return this.stageManager.getTotalStages(); }
  getAllStages(): Stage[] { return this.stageManager.getAllStages(); }
  isComplete(): boolean { return this.completed; }

  async moveToNextStage(): Promise<void> {
    const next = this.stageManager.getStage(this.currentStage.number + 1);
    if (next) this.currentStage = next;
    else this.completed = true;
    await this.saveProgress();
  }

  async saveProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem('@current_stage', JSON.stringify(
        this.completed ? this.getTotalStages() + 1 : this.currentStage.number));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async loadProgress(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const saved = await AsyncStorage.getItem('@current_stage');
      const number = saved === null ? 1 : JSON.parse(saved);
      if (Number.isInteger(number) && number >= 1 && number <= this.getTotalStages() + 1) {
        this.completed = number === this.getTotalStages() + 1;
        this.currentStage = this.stageManager.getStage(this.completed ? this.getTotalStages() : number)!;
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
}
