import AsyncStorage from '@react-native-async-storage/async-storage';
import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private currentStage: Stage;
  private currentStageNumber: Number;
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
    const nextStageNumber = this.currentStage.number + 1;
    console.log('======', 'moveToNextStage', nextStageNumber);
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
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
}
