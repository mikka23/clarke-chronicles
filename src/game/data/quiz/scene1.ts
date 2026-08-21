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
        question: 'Select the members of the family who have had a hole in one.',
        choices: [
            { key: 'michael', label: 'Michael', texture: 'char-michael' },
            { key: 'ben', label: 'Ben', texture: 'char-ben' },
            { key: 'dominic', label: 'Dominic', texture: 'char-dominic' },
            { key: 'mum', label: 'Mum', texture: 'char-mum' },
            { key: 'dad', label: 'Dad', texture: 'char-dad' }
        ],
        correctKeys: [ 'michael', 'dad' ],
        pointsPerCorrect: 1,
        pointsPerIncorrect: -1,
        penaltyOverrides: { ben: -5 }
    }
];
