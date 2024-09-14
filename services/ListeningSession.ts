import AsyncStorage from '@react-native-async-storage/async-storage';
import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private currentStage: Stage;
  private stageManager: StageManager;

  constructor() {
    this.stageManager = new StageManager();
    this.currentStage = this.stageManager.getStage(1);
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
    const nextStageNumber = this.currentStage.number + 1;
    this.currentStage = this.stageManager.getStage(nextStageNumber);
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
    try {
      const savedStage = await AsyncStorage.getItem('@current_stage');
      console.log('loaded stage', savedStage);
      if (savedStage !== null) {
        const stageNumber = JSON.parse(savedStage);
        this.currentStage = this.stageManager.getStage(stageNumber);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
}
