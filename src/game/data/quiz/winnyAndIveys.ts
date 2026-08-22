import { QUIZ_TEXT } from './content';

export const NARRATION_TITLE = QUIZ_TEXT.winnyAndIveys.narrationTitle;

export const NARRATION_BODY = QUIZ_TEXT.winnyAndIveys.narrationBody;

// Accepted as a substring anywhere in the typed answer, not the whole
// string, since the real answer is a place name attached to people's
// names ("Winny and Ivey's") and players may phrase it a few ways.
export const ANSWER_KEYWORDS = [ "winny", "whinnie", "ivey", "ivy", "east kilbride" ];

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;
