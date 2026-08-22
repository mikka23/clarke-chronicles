import { QUIZ_TEXT } from './content';

export interface SnackItem
{
    key: string;
    label: string;
    texture: string;
    points: number;
}

export interface SnackSet
{
    id: string;
    items: SnackItem[];
}

export const NARRATION_TITLE = QUIZ_TEXT.scene2.narrationTitle;

export const NARRATION_BODY = QUIZ_TEXT.scene2.narrationBody;

// Max picks per set before the round locks in and moves the picks to the boot.
export const MAX_PICKS_PER_SET = 2;

export const snackSets: SnackSet[] = [
    {
        id: 'crisps',
        items: [
            { key: 'bikers', label: QUIZ_TEXT.scene2.choices.bikers, texture: 'food-bikers', points: -1 },
            { key: 'brannigans', label: QUIZ_TEXT.scene2.choices.brannigans, texture: 'food-brannigans', points: 2 },
            { key: 'chipsticks', label: QUIZ_TEXT.scene2.choices.chipsticks, texture: 'food-chipsticks', points: 1 },
            { key: 'discos', label: QUIZ_TEXT.scene2.choices.discos, texture: 'food-discos', points: -1 },
            { key: 'salt-and-shake', label: QUIZ_TEXT.scene2.choices['salt-and-shake'], texture: 'food-salt-and-shake', points: 2 },
            { key: 'nik-naks', label: QUIZ_TEXT.scene2.choices['nik-naks'], texture: 'food-nik-naks', points: 1 }
        ]
    },
    {
        id: 'sweets',
        items: [
            { key: 'choc-dips', label: QUIZ_TEXT.scene2.choices['choc-dips'], texture: 'food-choc-dips', points: 2 },
            { key: 'hobnobs', label: QUIZ_TEXT.scene2.choices.hobnobs, texture: 'food-hobnobs', points: 2 },
            { key: 'mars', label: QUIZ_TEXT.scene2.choices.mars, texture: 'food-mars', points: -1 },
            { key: 'fruit', label: QUIZ_TEXT.scene2.choices.fruit, texture: 'food-fruit', points: -5 },
            { key: 'fruit-salads', label: QUIZ_TEXT.scene2.choices['fruit-salads'], texture: 'food-fruit-salads', points: 1 },
            { key: 'chocolate-digestives', label: QUIZ_TEXT.scene2.choices['chocolate-digestives'], texture: 'food-chocolate-digestives', points: 1 }
        ]
    },
    {
        id: 'drinks',
        items: [
            { key: 'coke', label: QUIZ_TEXT.scene2.choices.coke, texture: 'food-coke', points: -2 },
            { key: 'cola-cubes', label: QUIZ_TEXT.scene2.choices['cola-cubes'], texture: 'food-cola-cubes', points: 1 },
            { key: 'irn-bru', label: QUIZ_TEXT.scene2.choices['irn-bru'], texture: 'food-irn-bru', points: 2 },
            { key: 'space-raiders', label: QUIZ_TEXT.scene2.choices['space-raiders'], texture: 'food-space-raiders', points: 1 },
            { key: 'vegetables', label: QUIZ_TEXT.scene2.choices.vegetables, texture: 'food-vegetables', points: -5 },
            { key: 'wham', label: QUIZ_TEXT.scene2.choices.wham, texture: 'food-wham', points: -1 }
        ]
    }
];
