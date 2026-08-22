import { QUIZ_TEXT } from './content';

export interface LicensePlateChoice
{
    key: string;
    plate: string;
    correct: boolean;
}

export const NARRATION_TITLE = QUIZ_TEXT.findTheCar.narrationTitle;

export const NARRATION_BODY = QUIZ_TEXT.findTheCar.narrationBody;

// Max plates that can be picked before the round locks in.
export const MAX_PICKS = 2;

export const PICK_INSTRUCTION = QUIZ_TEXT.findTheCar.pickInstruction(MAX_PICKS);

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;

// Two real plates hidden among ten made-up decoys, shuffled into a fresh
// order by the scene each time this round is played.
export const licensePlates: LicensePlateChoice[] = [
    { key: 'plate-01', plate: 'S656 ASC', correct: true },
    { key: 'plate-02', plate: 'D890 TAM', correct: true },
    { key: 'plate-03', plate: 'P234 XYK', correct: false },
    { key: 'plate-04', plate: 'M512 BQF', correct: false },
    { key: 'plate-05', plate: 'K778 WRN', correct: false },
    { key: 'plate-06', plate: 'T045 LDP', correct: false },
    { key: 'plate-07', plate: 'H629 GVX', correct: false },
    { key: 'plate-08', plate: 'N391 QKR', correct: false },
    { key: 'plate-09', plate: 'B884 ZTC', correct: false },
    { key: 'plate-10', plate: 'W217 MHY', correct: false },
    { key: 'plate-11', plate: 'F563 JNB', correct: false },
    { key: 'plate-12', plate: 'L709 RCV', correct: false }
];
