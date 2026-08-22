import { QUIZ_TEXT } from './content';

export interface MultiSelectChoice
{
    key: string;
    label: string;
    texture: string;
}

export interface MultiSelectQuestion
{
    id: string;
    question: string;
    choices: MultiSelectChoice[];
    correctKeys: string[];
    pointsPerCorrect: number;
    pointsPerIncorrect: number;
    // Per-choice-key override of the incorrect-selection penalty, for
    // choices that should sting worse than a normal wrong pick.
    penaltyOverrides?: Record<string, number>;
}

export const scene1Questions: MultiSelectQuestion[] = [
    {
        id: 'hole-in-one',
        question: QUIZ_TEXT.scene1.questions.holeInOne,
        choices: [
            { key: 'michael', label: QUIZ_TEXT.scene1.characterLabels.michael, texture: 'char-michael' },
            { key: 'ben', label: QUIZ_TEXT.scene1.characterLabels.ben, texture: 'char-ben' },
            { key: 'dominic', label: QUIZ_TEXT.scene1.characterLabels.dominic, texture: 'char-dominic' },
            { key: 'mum', label: QUIZ_TEXT.scene1.characterLabels.mum, texture: 'char-mum' },
            { key: 'dad', label: QUIZ_TEXT.scene1.characterLabels.dad, texture: 'char-dad' }
        ],
        correctKeys: [ 'michael', 'dad' ],
        pointsPerCorrect: 1,
        pointsPerIncorrect: -1,
        penaltyOverrides: { ben: -5 }
    },
    {
        id: 'snapped-club',
        question: QUIZ_TEXT.scene1.questions.snappedClub,
        choices: [
            { key: 'michael', label: QUIZ_TEXT.scene1.characterLabels.michael, texture: 'char-michael' },
            { key: 'ben', label: QUIZ_TEXT.scene1.characterLabels.ben, texture: 'char-ben' },
            { key: 'dominic', label: QUIZ_TEXT.scene1.characterLabels.dominic, texture: 'char-dominic' },
            { key: 'mum', label: QUIZ_TEXT.scene1.characterLabels.mum, texture: 'char-mum' },
            { key: 'dad', label: QUIZ_TEXT.scene1.characterLabels.dad, texture: 'char-dad' }
        ],
        correctKeys: [ 'ben' ],
        pointsPerCorrect: 1,
        pointsPerIncorrect: -1,
        penaltyOverrides: { mum: -5 }
    },
    {
        id: 'struck-in-throat',
        question: QUIZ_TEXT.scene1.questions.struckInThroat,
        choices: [
            { key: 'michael', label: QUIZ_TEXT.scene1.characterLabels.michael, texture: 'char-michael' },
            { key: 'ben', label: QUIZ_TEXT.scene1.characterLabels.ben, texture: 'char-ben' },
            { key: 'dominic', label: QUIZ_TEXT.scene1.characterLabels.dominic, texture: 'char-dominic' },
            { key: 'mum', label: QUIZ_TEXT.scene1.characterLabels.mum, texture: 'char-mum' },
            { key: 'dad', label: QUIZ_TEXT.scene1.characterLabels.dad, texture: 'char-dad' }
        ],
        correctKeys: [ 'ben' ],
        pointsPerCorrect: 1,
        pointsPerIncorrect: -1
    },
    {
        id: 'dont-let-him-drive',
        question: QUIZ_TEXT.scene1.questions.dontLetHimDrive,
        choices: [
            { key: 'michael', label: QUIZ_TEXT.scene1.characterLabels.michael, texture: 'char-michael' },
            { key: 'ben', label: QUIZ_TEXT.scene1.characterLabels.ben, texture: 'char-ben' },
            { key: 'dominic', label: QUIZ_TEXT.scene1.characterLabels.dominic, texture: 'char-dominic' },
            { key: 'mum', label: QUIZ_TEXT.scene1.characterLabels.mum, texture: 'char-mum' },
            { key: 'dad', label: QUIZ_TEXT.scene1.characterLabels.dad, texture: 'char-dad' }
        ],
        correctKeys: [ 'dominic' ],
        pointsPerCorrect: 1,
        pointsPerIncorrect: -1
    },
    {
        id: 'buggy-in-bunker',
        question: QUIZ_TEXT.scene1.questions.buggyInBunker,
        choices: [
            { key: 'michael', label: QUIZ_TEXT.scene1.characterLabels.michael, texture: 'char-michael' },
            { key: 'ben', label: QUIZ_TEXT.scene1.characterLabels.ben, texture: 'char-ben' },
            { key: 'dominic', label: QUIZ_TEXT.scene1.characterLabels.dominic, texture: 'char-dominic' },
            { key: 'mum', label: QUIZ_TEXT.scene1.characterLabels.mum, texture: 'char-mum' },
            { key: 'dad', label: QUIZ_TEXT.scene1.characterLabels.dad, texture: 'char-dad' }
        ],
        correctKeys: [ 'dad' ],
        pointsPerCorrect: 1,
        pointsPerIncorrect: -1,
        penaltyOverrides: { dominic: -5 }
    }
];
