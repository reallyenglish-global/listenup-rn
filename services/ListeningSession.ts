import AsyncStorage from '@react-native-async-storage/async-storage';
import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private currentStage: Stage;
  private currentStageNumber: Number;
  private currentStageRetries: Number = 0;
  private stageManager: StageManager;

  constructor() {
    this.stageManager = new StageManager();
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
    const stage = this.stageManager.getStage(this.currentStageNumber + 1);
    if (!stage) {
      return;
    }
    this.currentStage = stage;
    await this.saveProgress();
  }
  async retryCurrentStage(): Promise<void> {
    this.currentStage.failedTimes += 1;
    await this.saveProgress();
  }


  async saveProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem('@current_stage', JSON.stringify(this.currentStageNumber));
      await AsyncStorage.setItem('@current_stage_retries', this.currentStageRetries);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async loadProgress(): Promise<void> {
    if (this.currentStage) {
      return;
    }
    try {
      const savedStage = await AsyncStorage.getItem('@current_stage');
      console.log('loaded stage', savedStage);
      if (savedStage !== null) {
        this.currentStageNumber = JSON.parse(savedStage);
      } else {
        this.currentStageNumber = 1;
      }
      this.currentStage = this.stageManager.getStage(this.currentStageNumber);

      const savedRetries = await AsyncStorage.getItem('@current_stage_retries');
      if (savedRetries !== null) {
        this.currentStage.failedTimes = savedRetries;
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
}
