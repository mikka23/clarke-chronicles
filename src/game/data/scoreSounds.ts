// Filenames (no extension) under assets/sounds/positive and assets/sounds/negative.
// Preloader loads each as an audio key of `${folder}-${file}`; ScoreToast picks a
// random key from the matching pool. Add a new clip by dropping the file into the
// folder and adding its name here — no other code needs to change.
export const POSITIVE_SOUND_FILES = [
    '12-correct-answer',
    '13-chaser-answer',
    'ah-i-m-smart',
    'and-it-only-makes-common-sense',
    'logical',
    'you-re-right',
    'woooooo'
];

export const NEGATIVE_SOUND_FILES = [
    'fail',
    'fuck-off-means-fuck-off',
    'how-did-I-do-you-are-obviously-still-learning',
    'i-do-not-believe-it',
    'is-that-you',
    'ted-justfeckoff',
    'you-dont-give-anything-away',
    'it-s-shite-being-scottish'
];

export const POSITIVE_SOUND_KEYS = POSITIVE_SOUND_FILES.map((file) => `positive-${file}`);
export const NEGATIVE_SOUND_KEYS = NEGATIVE_SOUND_FILES.map((file) => `negative-${file}`);
