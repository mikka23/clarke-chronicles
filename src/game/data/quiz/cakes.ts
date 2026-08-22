export interface CakeChoice
{
    key: string;
    label: string;
    correct: boolean;
}

export const NARRATION_TITLE = "ON TO DESSERT";

export const NARRATION_BODY = "Time for pudding. Over the years Mum has designed "
    + "a fair few birthday cakes - see if you can pick out the ones she's actually made.";

export const QUESTION = "Which of these cakes has Mum designed over the years?";

export const CORRECT_POINTS = 2;
export const INCORRECT_POINTS = -1;

// Correct: nfl, subbuteo, henrys-cat, train, wwf, sun, turtle. Everything else in
// the grid is a decoy - shuffled into a fresh order by the scene each time.
export const cakeChoices: CakeChoice[] = [
    { key: 'nfl', label: 'NFL', correct: true },
    { key: 'subbuteo', label: 'Subbuteo', correct: true },
    { key: 'henrys-cat', label: "Henry's Cat", correct: true },
    { key: 'train', label: 'Train', correct: true },
    { key: 'wwf', label: 'WWF', correct: true },
    { key: 'sun', label: 'Sun', correct: true },
    { key: 'turtle', label: 'Turtle', correct: true },
    { key: 'he-man', label: 'He-Man', correct: false },
    { key: 'moomins', label: 'Moomins', correct: false },
    { key: 'rugrats', label: 'Rugrats', correct: false },
    { key: 'tractor', label: 'Tractor', correct: false },
    { key: 'dumbo', label: 'Dumbo', correct: false }
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
