import { QUIZ_TEXT } from './content';

export interface QuizChoice
{
    key: string;
    label: string;
}

export const NARRATION_BODY = QUIZ_TEXT.amber2.narrationBody;

export const choices: QuizChoice[] = [
    { key: 'amber', label: QUIZ_TEXT.amber2.choices.amber },
    { key: 'floss', label: QUIZ_TEXT.amber2.choices.floss }
];

export const CORRECT_KEY = 'amber';

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;
