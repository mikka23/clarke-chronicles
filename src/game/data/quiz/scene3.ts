import { QUIZ_TEXT } from './content';

export interface ActivityChoice
{
    key: string;
    label: string;
    points: number;
    // Shown as extra feedback text next to the score toast, e.g. for
    // attractions that are out of order.
    feedbackText?: string;
}

export const NARRATION_TITLE = QUIZ_TEXT.scene3.narrationTitle;

export const NARRATION_BODY = QUIZ_TEXT.scene3.narrationBody;

// Max activities that can be picked before the round locks in.
export const MAX_PICKS = 2;

export const activityChoices: ActivityChoice[] = [
    { key: 'chairlift', label: QUIZ_TEXT.scene3.choices.chairlift, points: -2, feedbackText: QUIZ_TEXT.scene3.feedback.brokenAttraction },
    { key: 'haunted-house', label: QUIZ_TEXT.scene3.choices['haunted-house'], points: -2, feedbackText: QUIZ_TEXT.scene3.feedback.brokenAttraction },
    { key: 'bumper-boats', label: QUIZ_TEXT.scene3.choices['bumper-boats'], points: 2 },
    { key: 'football', label: QUIZ_TEXT.scene3.choices.football, points: 1 },
    { key: 'simulator', label: QUIZ_TEXT.scene3.choices.simulator, points: 1 },
    { key: 'arabian-derby', label: QUIZ_TEXT.scene3.choices['arabian-derby'], points: 2 },
    { key: 'swimming', label: QUIZ_TEXT.scene3.choices.swimming, points: 2 },
    { key: 'cinema', label: QUIZ_TEXT.scene3.choices.cinema, points: 1 }
];
