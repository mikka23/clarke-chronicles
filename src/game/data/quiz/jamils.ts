import { QUIZ_TEXT } from './content';

export const NARRATION_TITLE = QUIZ_TEXT.jamils.narrationTitle;

export const NARRATION_BODY = QUIZ_TEXT.jamils.narrationBody;

// Correct total, in pounds.
export const CORRECT_ANSWER = 2.37;

// Scoring bands, checked in order against the absolute difference (in pounds)
// between the player's guess and CORRECT_ANSWER - closest tolerance first.
export const CLOSE_TOLERANCE = 0.20;
export const CLOSE_POINTS = 5;

export const NEAR_TOLERANCE = 0.50;
export const NEAR_POINTS = 2;

export const FAR_POINTS = -2;
