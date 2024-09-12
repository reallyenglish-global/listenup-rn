import { StageManager, Stage } from './StageManager';

export class ListeningSession {
  private stageManager: StageManager;
  private currentStageIndex: number;
  private progress: number = 0;
  private plays: number = 0;

  constructor() {
    this.stageManager = new StageManager();
    this.currentStageIndex = 0;
    this.progress = 0;
    this.progressTime = 0;
    this.durationTime = 0;
    this.plays = 0;
  }

  getAllStages(): Stage[] {
    return this.stageManager.getAllStages();
  }

  getCurrentStage(): Stage {
    return this.stageManager.getAllStages()[this.currentStageIndex];
  }

  getProgress(): number {
    return this.progress;
  }

  // 00:12
  getProgressTime(): string {
    const second = this.progress * this.durationTime;
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getCurrentStageTime(): string {
    // convert 01:23 to seconds
    const [minutes, seconds] = this.getCurrentStage().duration.split(':').map(Number);
    return (minutes * 60) + seconds;
  }

  setProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
  }

  getPlays(): number {
    return this.plays;
  }

  incrementPlays(): void {
    this.plays++;
  }

  moveToNextStage(): boolean {
    if (this.currentStageIndex < this.stageManager.getTotalStages() - 1) {
      this.currentStageIndex++;
      this.progress = 0;
      this.plays = 0;
      return true;
    }
    return false;
  }

  setCurrentStage(number: number): void {
    if (number > 0) {
      this.currentStageIndex = number;
      this.progress = 0;
      this.plays = 0;
      this.progressTime = 0;
      this.durationTime = this.getCurrentStageTime();
      return true;
    }
    return false;
  }

  moveToPreviousStage(): boolean {
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      this.progress = 0;
      this.plays = 0;
      return true;
    }
    return false;
  }

  isLastStage(): boolean {
    return this.currentStageIndex === this.stageManager.getTotalStages() - 1;
  }

  getTotalStages(): number {
    return this.stageManager.getTotalStages();
  }

  getCurrentStageNumber(): number {
    return this.currentStageIndex + 1;
  }
}