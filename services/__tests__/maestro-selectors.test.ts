import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import course from '../../assets/audios/s1/stages.json';

// These flows use JSON-compatible quoted YAML scalars. Decode before compiling:
// a backslash escaped in YAML must reach the regex engine exactly once.
const flow = readFileSync(resolve(__dirname, '../../.maestro/complete-course.yaml'), 'utf8');
const controls = new Set(['Start Listening', 'Challenge', 'OK', 'Done', 'Play audio', 'Pause audio']);
const answers: string[] = flow.split('\n')
  .filter(line => line.startsWith('- tapOn: '))
  .map(line => JSON.parse(line.slice('- tapOn: '.length)))
  .filter(text => !controls.has(text));
const questions = course.stages.flatMap(stage => stage.mcqs);

it('has one answer selector per question in the complete-course flow', () => {
  expect(answers).toHaveLength(questions.length);
});

it.each(questions.map((question, index) => [index + 1, question] as const))(
  'matches every randomized correct-answer wording for question %i',
  (number, question) => {
    const pattern = new RegExp(`^(?:${answers[number - 1]})$`);
    for (const wording of question.options[0].split('|')) {
      expect(pattern.test(wording)).toBe(true);
    }
    for (const wrong of question.options.slice(1).flatMap(option => option.split('|'))) {
      expect(pattern.test(wrong)).toBe(false);
    }
  },
);
