export type AnimalMatchMode = 'exact' | 'contains' | 'prefix';

export interface AnimalQuestion
{
    id: string;
    imageKey: string;
    mode: AnimalMatchMode;
    // For 'exact', accepted answers (typo-tolerant). For 'contains', substrings
    // that must appear somewhere in the answer. For 'prefix', prefixes the
    // answer must start with.
    values: string[];
}

export const NARRATION_TITLE = "NAME THE ANIMAL";
export const NARRATION_BODY = "Name the animal.";

export const ANIMAL_QUESTIONS: AnimalQuestion[] = [
    { id: 'patch', imageKey: 'patch', mode: 'exact', values: [ 'patch' ] },
    { id: 'pip', imageKey: 'pip', mode: 'exact', values: [ 'pip' ] },
    { id: 'magic', imageKey: 'magic', mode: 'exact', values: [ 'magic' ] },
    { id: 'pudy', imageKey: 'pudy', mode: 'contains', values: [ 'pud' ] },
    { id: 'mitzi', imageKey: 'mitzi', mode: 'prefix', values: [ 'mit' ] },
    { id: 'alice', imageKey: 'alice', mode: 'exact', values: [ 'alice' ] },
    { id: 'puschka', imageKey: 'puschka', mode: 'prefix', values: [ 'pus', 'puc' ] },
    { id: 'ben', imageKey: 'animal-ben', mode: 'exact', values: [ 'ben' ] },
    { id: 'suzuki', imageKey: 'suzuki', mode: 'exact', values: [ 'suzuki' ] }
];

export const CORRECT_POINTS = 3;
export const INCORRECT_POINTS = -1;
