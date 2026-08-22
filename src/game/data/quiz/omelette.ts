import { QUIZ_TEXT } from './content';

export interface QuizChoice
{
    key: string;
    label: string;
}

export const NARRATION_TITLE = QUIZ_TEXT.omelette.narrationTitle;

export const QUESTION = QUIZ_TEXT.omelette.question;

export const choices: QuizChoice[] = [
    { key: 'baked-potato', label: QUIZ_TEXT.omelette.choices['baked-potato'] },
    { key: 'smell-of-eggs', label: QUIZ_TEXT.omelette.choices['smell-of-eggs'] },
    { key: 'mouse', label: QUIZ_TEXT.omelette.choices.mouse },
    { key: 'too-many-crisps', label: QUIZ_TEXT.omelette.choices['too-many-crisps'] }
];

export const CORRECT_KEY = 'mouse';

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;
