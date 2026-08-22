import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ScoreHud } from '../ui/ScoreHud';
import { isCloseMatch } from '../utils/fuzzyMatch';
import { NARRATION_TITLE, NARRATION_BODY, CORRECT_ANSWERS, CORRECT_POINTS, INCORRECT_POINTS } from '../data/quiz/mull';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const INPUT_Y = 560;
const SUBMIT_Y = 630;

// Free-text follow-up to New Forest, part of this run of photo
// beats: expects the island name "Mull".
export class Mull extends Scene
{
    private scoreHud: ScoreHud;
    private inputElement: HTMLInputElement;
    private inputDom: GameObjects.DOMElement;
    private submitButton: Button;
    private answered: boolean = false;

    constructor ()
    {
        super('Mull');
    }

    create ()
    {
        this.answered = false;

        this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'mull'));

        this.scoreHud = new ScoreHud(this);

        this.showNarration();
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    private showNarration (): void
    {
        const panel = new InfoPanel(this, {
            y: CENTER_Y,
            width: 880,
            title: NARRATION_TITLE,
            body: NARRATION_BODY,
            dismissLabel: "I KNOW THIS...",
            onDismiss: () => this.showAnswerInput()
        });

        panel.show();
    }

    private showAnswerInput (): void
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
                this.submitAnswer();
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
            onClick: () => this.submitAnswer()
        });

        this.submitButton.setAlpha(0);

        this.tweens.add({ targets: this.submitButton, alpha: 1, duration: 300 });
    }

    private submitAnswer (): void
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

        const isCorrect = CORRECT_ANSWERS.some((accepted) => isCloseMatch(answer, accepted));
        const points = isCorrect ? CORRECT_POINTS : INCORRECT_POINTS;

        addScore(this, points);

        const anchor = this.scoreHud.getToastAnchor();

        showScoreToast(this, points, {
            x: anchor.x,
            y: anchor.y,
            onComplete: () => this.showContinue()
        });
    }

    private showContinue (): void
    {
        this.inputDom.destroy();
        this.submitButton.destroy();

        const button = new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Skye')
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
