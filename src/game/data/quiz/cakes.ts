import { QUIZ_TEXT } from './content';

export interface CakeChoice
{
    key: string;
    label: string;
    correct: boolean;
}

export const NARRATION_TITLE = QUIZ_TEXT.cakes.narrationTitle;

export const NARRATION_BODY = QUIZ_TEXT.cakes.narrationBody;

export const QUESTION = QUIZ_TEXT.cakes.question;

export const CORRECT_POINTS = 2;
export const INCORRECT_POINTS = -1;

// Correct: nfl, subbuteo, henrys-cat, train, wwf, sun, turtle. Everything else in
// the grid is a decoy - shuffled into a fresh order by the scene each time.
export const cakeChoices: CakeChoice[] = [
    { key: 'nfl', label: QUIZ_TEXT.cakes.choices.nfl, correct: true },
    { key: 'subbuteo', label: QUIZ_TEXT.cakes.choices.subbuteo, correct: true },
    { key: 'henrys-cat', label: QUIZ_TEXT.cakes.choices['henrys-cat'], correct: true },
    { key: 'train', label: QUIZ_TEXT.cakes.choices.train, correct: true },
    { key: 'wwf', label: QUIZ_TEXT.cakes.choices.wwf, correct: true },
    { key: 'sun', label: QUIZ_TEXT.cakes.choices.sun, correct: true },
    { key: 'turtle', label: QUIZ_TEXT.cakes.choices.turtle, correct: true },
    { key: 'he-man', label: QUIZ_TEXT.cakes.choices['he-man'], correct: false },
    { key: 'moomins', label: QUIZ_TEXT.cakes.choices.moomins, correct: false },
    { key: 'rugrats', label: QUIZ_TEXT.cakes.choices.rugrats, correct: false },
    { key: 'tractor', label: QUIZ_TEXT.cakes.choices.tractor, correct: false },
    { key: 'dumbo', label: QUIZ_TEXT.cakes.choices.dumbo, correct: false }
];

// Manual slideshow of the actual cake photos, shown once the answer is confirmed.
export const cakeCarouselImages: string[] = [
    'cake1',
    'cake2',
    'cake3',
    'cake4',
    'cake5',
    'cake6',
    'cake7'
];
