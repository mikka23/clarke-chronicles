export interface QuizChoice
{
    key: string;
    label: string;
}

export const NARRATION_BODY = "Speaking of hunger, identify the dog.";

export const choices: QuizChoice[] = [
    { key: 'amber', label: 'Amber' },
    { key: 'floss', label: 'Floss' }
];

export const CORRECT_KEY = 'floss';

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;
