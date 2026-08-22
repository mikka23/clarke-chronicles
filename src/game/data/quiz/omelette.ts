export interface QuizChoice
{
    key: string;
    label: string;
}

export const NARRATION_TITLE = "BONFIRE NIGHT OMELETTE";

export const QUESTION = "It is bonfire day and Dad has just cooked an omelette, "
    + "but Michael is refusing to eat it, why?";

export const choices: QuizChoice[] = [
    { key: 'baked-potato', label: 'He wants to eat a baked potato at the fireworks' },
    { key: 'smell-of-eggs', label: "He can't stand the smell of eggs" },
    { key: 'mouse', label: 'He thinks there is a mouse in it' },
    { key: 'too-many-crisps', label: "He's already eaten too many crisps" }
];

export const CORRECT_KEY = 'mouse';

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;
