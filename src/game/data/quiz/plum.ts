export interface AnswerTier
{
    points: number;
    // Hint shown before this tier's attempt - the first tier has none, since
    // it's the free "guess with nothing to go on" attempt.
    hint?: string;
}

export const NARRATION_TITLE = "WHO IS THIS?";

export const QUESTION = "Who is the person in the photo?";

export const CORRECT_ANSWERS = [ "plum" ];

export const TIERS: AnswerTier[] = [
    { points: 10 },
    { points: 5, hint: "He was often seen walking around Pencaitland" },
    { points: 1, hint: "He shares his name with a fruit" }
];

export const INCORRECT_POINTS = -3;
