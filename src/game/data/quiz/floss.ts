import { QUIZ_TEXT } from './content';

export interface QuizChoice
{
    key: string;
    label: string;
}

export const NARRATION_BODY = QUIZ_TEXT.floss.narrationBody;

export const choices: QuizChoice[] = [
    { key: 'amber', label: QUIZ_TEXT.floss.choices.amber },
    { key: 'floss', label: QUIZ_TEXT.floss.choices.floss }
];

export const CORRECT_KEY = 'floss';

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;

// How long before the video ends to animate the answer choices in, so the
// player locks in a guess while the dog is still on screen.
export const CHOICES_BEFORE_END_MS = 3000;
