import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ScoreHud } from '../ui/ScoreHud';
import { isCloseMatch } from '../utils/fuzzyMatch';
import { ANIMAL_QUESTIONS, AnimalQuestion, NARRATION_TITLE, NARRATION_BODY, CORRECT_POINTS, INCORRECT_POINTS } from '../data/quiz/animals';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const INPUT_Y = 560;
const SUBMIT_Y = 630;

function normalize (text: string): string
{
    return text.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function isAnimalAnswerCorrect (answer: string, question: AnimalQuestion): boolean
{
    const normalizedAnswer = normalize(answer);

    switch (question.mode)
    {
        case 'exact':
            return question.values.some((value) => isCloseMatch(answer, value));
        case 'contains':
            return question.values.some((value) => normalizedAnswer.includes(normalize(value)));
        case 'prefix':
            return question.values.some((value) => normalizedAnswer.startsWith(normalize(value)));
    }
}

// One free-text "name the animal" beat per pet photo, run back to back in a
// single scene (same loop-through-a-question-list shape as Scene1), then
// straight on to PaulCartoon.
export class Animals extends Scene
{
    private questionIndex: number = 0;
    private scoreHud: ScoreHud;
    private background: GameObjects.Image;
    private inputElement: HTMLInputElement;
    private inputDom: GameObjects.DOMElement;
    private submitButton: Button;
    private answered: boolean = false;

    constructor ()
    {
        super('Animals');
    }

    create ()
    {
        this.questionIndex = 0;

        this.scoreHud = new ScoreHud(this);

        this.startQuestion();
    }

    private startQuestion (): void
    {
        this.answered = false;

        const question = ANIMAL_QUESTIONS[this.questionIndex];

        this.background?.destroy();
        this.background = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, question.imageKey));

        this.showNarration(question);
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    private showNarration (question: AnimalQuestion): void
    {
        const panel = new InfoPanel(this, {
            y: CENTER_Y,
            width: 880,
            title: NARRATION_TITLE,
            body: NARRATION_BODY,
            dismissLabel: "I KNOW THIS...",
            onDismiss: () => this.showAnswerInput(question)
        });

        panel.show();
    }

    private showAnswerInput (question: AnimalQuestion): void
    {
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.placeholder = 'Type your answer...';
        this.inputElement.autocomplete = 'off';
        this.inputElement.style.width = '380px';
        this.inputElement.style.padding = '12px 16px';
        this.inputElement.style.fontSize = '20px';
        this.inputElement.style.fontFamily = '"Special Elite", Georgia, serif';
        this.inputElement.style.border = '3px solid #1a0f08';
        this.inputElement.style.borderRadius = '10px';
        this.inputElement.style.textAlign = 'center';
        this.inputElement.style.background = '#f3ecdd';
        this.inputElement.style.color = '#1a0f08';
        this.inputElement.style.outline = 'none';

        this.inputDom = this.add.dom(CENTER_X, INPUT_Y, this.inputElement).setAlpha(0);

        this.tweens.add({ targets: this.inputDom, alpha: 1, duration: 300 });

        this.inputElement.addEventListener('keydown', (event) => {

            if (event.key === 'Enter')
            {
                this.submitAnswer(question);
            }
        });

        this.inputElement.focus();

        // A stray window blur fires ~50ms after the narration panel's
        // dismiss tween hands off to this callback, stealing focus back to
        // the page - reclaim it once so the player can start typing right away.
        setTimeout(() => {
            if (document.activeElement !== this.inputElement)
            {
                this.inputElement.focus();
            }
        }, 100);

        this.submitButton = new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'SUBMIT!',
            onClick: () => this.submitAnswer(question)
        });

        this.submitButton.setAlpha(0);

        this.tweens.add({ targets: this.submitButton, alpha: 1, duration: 300 });
    }

    private submitAnswer (question: AnimalQuestion): void
    {
        if (this.answered)
        {
            return;
        }

        const answer = this.inputElement.value;

        if (!answer.trim())
        {
            return;
        }

        this.answered = true;
        this.submitButton.disableInteractive();
        this.inputElement.disabled = true;

        const isCorrect = isAnimalAnswerCorrect(answer, question);
        const points = isCorrect ? CORRECT_POINTS : INCORRECT_POINTS;

        addScore(this, points);

        const anchor = this.scoreHud.getToastAnchor();

        showScoreToast(this, points, {
            x: anchor.x,
            y: anchor.y,
            onComplete: () => this.advance()
        });
    }

    private advance (): void
    {
        this.inputDom.destroy();
        this.submitButton.destroy();

        if (this.questionIndex < ANIMAL_QUESTIONS.length - 1)
        {
            this.questionIndex++;
            this.startQuestion();
        }
        else
        {
            this.showContinue();
        }
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('PaulCartoon')
        });

        button.setAlpha(0);
        button.setScale(0.6);

        this.tweens.add({
            targets: button,
            alpha: 1,
            scale: 1,
            duration: 350,
            ease: 'Back.Out'
        });
    }
}
