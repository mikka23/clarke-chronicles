export interface AnswerTier
{
    points: number;
    // Hint shown before this tier's attempt - the first tier has none, since
    // it's the free "guess with nothing to go on" attempt.
    hint?: string;
}

import { QUIZ_TEXT } from './content';

export const NARRATION_TITLE = QUIZ_TEXT.plum.narrationTitle;

export const QUESTION = QUIZ_TEXT.plum.question;

export const CORRECT_ANSWERS = [ "plum" ];

export const TIERS: AnswerTier[] = [
    { points: 10 },
    { points: 5, hint: QUIZ_TEXT.plum.hints.secondAttempt },
    { points: 1, hint: QUIZ_TEXT.plum.hints.thirdAttempt }
];

export const INCORRECT_POINTS = -3;
