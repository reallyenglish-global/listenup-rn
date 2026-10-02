import AsyncStorage from '@react-native-async-storage/async-storage';
import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private currentStage: Stage;
  private stageManager: StageManager;
  private progressLoaded = false;

  constructor() {
    this.stageManager = new StageManager();
    this.currentStage = this.stageManager.getStage(1) as Stage;
  }

  getCurrentStage(): Stage {
    return this.currentStage;
  }

  getCurrentStageNumber(): number {
    return this.currentStage.number;
  }

  getTotalStages(): number {
    return this.stageManager.getTotalStages();
  }

  getAllStages(): Stage[] {
    return this.stageManager.getAllStages();
  }

  async moveToNextStage(): Promise<void> {
    if (this.isComplete()) return;
    const nextStage = this.stageManager.getStage(this.currentStage.number + 1);
    if (nextStage) this.currentStage = nextStage;
    await this.saveProgress();
  }

  async saveProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem('@current_stage', JSON.stringify(this.currentStage.number));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async loadProgress(): Promise<void> {
    if (this.progressLoaded) {
      return;
    }
    try {
      const savedStage = await AsyncStorage.getItem('@current_stage');
      const parsed = savedStage === null ? 1 : JSON.parse(savedStage);
      const stageNumber = typeof parsed === 'number' && Number.isInteger(parsed) ? parsed : 1;
      this.currentStage = this.stageManager.getStage(stageNumber) ?? this.stageManager.getStage(1) as Stage;
      this.progressLoaded = true;
    } catch (error) {
      console.error('Error loading progress:', error);
      this.currentStage = this.stageManager.getStage(1) as Stage;
      this.progressLoaded = true;
    }
  }

  isComplete(): boolean {
    return this.currentStage.number === this.getTotalStages();
  }
}
