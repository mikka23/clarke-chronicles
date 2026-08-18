---
name: quiz-builder
description: Author quiz question data (question, choices, correct answer, points) and scaffold/extend the quiz scene logic that consumes it, wired into the shared scoring system.
---

# quiz-builder

Builds the content and logic for quiz-style scenes.

## When invoked

Clarify:
1. Which quiz (new one, or adding questions to an existing one)?
2. Are questions single-correct-answer multiple choice, or another format (true/false, multi-select)? Default to single-correct multiple choice unless told otherwise.
3. Point value per question (flat, or per-question weight)?

## Data format

Store under `src/game/data/quiz/<quiz-name>.ts`:

```ts
export interface QuizQuestion {
    id: string;
    question: string;
    choices: string[];
    correctIndex: number;
    points: number;
    image?: string;   // optional asset key shown alongside the question
    audio?: string;   // optional narrated question audio
}

export const <quizName>Questions: QuizQuestion[] = [ /* ... */ ];
```

## Steps

1. Check `src/game/data/quiz/` for an existing file/format to match before introducing a new shape.
2. Write question data per the format above. Every question needs a unique `id`, exactly one correct choice, and a `points` value.
3. If a quiz scene doesn't exist yet for this data, use the `new-scene` skill with type `quiz` rather than duplicating scene scaffolding here — this skill owns the data and the answer-checking logic, not the scene boilerplate.
4. Wire correct/incorrect handling to call into the shared score registry (see `scoring-system` skill) — never accumulate score in a local scene variable that isn't reported centrally.
5. Report the total possible points for the quiz set so the user can sanity-check balance against other scenes.

## Guardrails

- Don't hardcode question text inside scene `.ts` files — it always lives in the data file so non-code edits (wording tweaks) don't touch scene logic.
- Keep exactly one `correctIndex` per question unless the user explicitly asks for multi-select, which needs a different shape (`correctIndices: number[]`) — don't mix shapes in the same file.
