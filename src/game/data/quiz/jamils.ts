export const NARRATION_TITLE = "A TASTE OF THE PAST";

export const NARRATION_BODY = "Time for something to eat - let's take a step back "
    + "in time for a nice curry at Jamil's. You order:\n\n"
    + "1 x Beef Curry\n"
    + "1 x Plain Rice\n"
    + "1 x Prawn Biryani\n"
    + "1 x Mango Chutney\n"
    + "1 x Chapati\n"
    + "Cover Charge (2 people)\n\n"
    + "How much does it cost?";

// Correct total, in pounds.
export const CORRECT_ANSWER = 2.37;

// Scoring bands, checked in order against the absolute difference (in pounds)
// between the player's guess and CORRECT_ANSWER - closest tolerance first.
export const CLOSE_TOLERANCE = 0.20;
export const CLOSE_POINTS = 5;

export const NEAR_TOLERANCE = 0.50;
export const NEAR_POINTS = 2;

export const FAR_POINTS = -2;
