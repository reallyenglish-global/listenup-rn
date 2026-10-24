import { test, expect, Page } from '@playwright/test';
import data from '../assets/audios/s1/stages.json';

const exactOptions = (options: string) => new RegExp(`^(?:${options.split('|').map(
  option => option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`);

async function answerStage(page: Page, index: number, wrong = false) {
  for (const [questionIndex, question] of data.stages[index].mcqs.entries()) {
    await expect(page.getByText(question.body, { exact: true })).toBeVisible();
    await page.getByRole('button', {
      name: exactOptions(question.options[wrong && questionIndex === 0 ? 1 : 0]),
    }).click();
  }
  await expect(page.getByText(wrong ? data.stages[index].failureMessage : data.stages[index].successMessage,
    { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
}

test('complete every stage, play bundled audio, review correct transcripts and persist completion', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  const failedAssets: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failedAssets.push(response.url()); });
  await page.goto('/');
  for (const [index, stage] of data.stages.entries()) {
    await expect(page.getByText(`Stage ${index + 1}`, { exact: true })).toBeVisible();
    await expect(page.getByText(stage.title, { exact: true })).toBeVisible();
    await page.getByText('Start Listening', { exact: true }).click();
    const audio = page.locator('audio');
    await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.readyState)).toBeGreaterThan(0);
    if (index === 0) {
      await audio.evaluate((el: HTMLAudioElement) => el.play());
      await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(0);
      await audio.evaluate((el: HTMLAudioElement) => el.pause());
    }
    await page.getByText('Challenge', { exact: true }).click();
    await answerStage(page, index);
    await expect(page.getByText(`Stage ${index + 1} - Transcript`, { exact: true })).toBeVisible();
    await expect(page.getByText(stage.transcript.replace(/\r/g, '\n'), { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    if (index === 0) {
      await expect(page.getByText('Stage 2', { exact: true })).toBeVisible();
      await page.reload();
    }
  }
  await expect(page.getByText('All stages complete!', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('All stages complete!', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(failedAssets).toEqual([]);
});

test('failed challenge retries the same stage without corrupting correct answers', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Start Listening', { exact: true }).click();
  await page.getByText('Challenge', { exact: true }).click();
  await answerStage(page, 0, true);
  await expect(page.getByText('Stage 1', { exact: true })).toBeVisible();
  await page.getByText('Start Listening', { exact: true }).click();
  await page.getByText('Challenge', { exact: true }).click();
  await answerStage(page, 0);
  await expect(page.getByText('Stage 1 - Transcript', { exact: true })).toBeVisible();
});

for (const saved of ['not-json', '0', '-1', '999', '1.5', 'null', '"2"']) {
  test(`invalid saved stage ${saved} falls back to stage 1`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('@current_stage', value), saved);
    await page.goto('/');
    await expect(page.getByText('Stage 1', { exact: true })).toBeVisible();
  });
}
