export interface ActivityChoice
{
    key: string;
    label: string;
    points: number;
    // Shown as extra feedback text next to the score toast, e.g. for
    // attractions that are out of order.
    feedbackText?: string;
}

export const NARRATION_TITLE = "SETTLING IN";

export const NARRATION_BODY = "You have settled in at Butlins, you have the "
    + "Irn Bru in the bath tub. What would you like to do today?";

// Max activities that can be picked before the round locks in.
export const MAX_PICKS = 2;

export const activityChoices: ActivityChoice[] = [
    { key: 'chairlift', label: 'Chairlift', points: -2, feedbackText: "It's broken!" },
    { key: 'haunted-house', label: 'Haunted House', points: -2, feedbackText: "It's broken!" },
    { key: 'bumper-boats', label: 'Bumper Boats', points: 2 },
    { key: 'football', label: 'Football', points: 1 },
    { key: 'simulator', label: 'Simulator', points: 1 },
    { key: 'arabian-derby', label: 'Arabian Derby', points: 2 },
    { key: 'swimming', label: 'Swimming', points: 2 },
    { key: 'cinema', label: 'Cinema', points: 1 }
];
