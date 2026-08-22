import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ScoreHud } from '../ui/ScoreHud';
import {
    NARRATION_TITLE, NARRATION_BODY, CORRECT_ANSWER,
    CLOSE_TOLERANCE, CLOSE_POINTS, NEAR_TOLERANCE, NEAR_POINTS, FAR_POINTS
} from '../data/quiz/jamils';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const INPUT_Y = 560;
const SUBMIT_Y = 630;
const BILL_Y = 300;
const BILL_MAX_WIDTH = GAME_WIDTH - 200;
const BILL_MAX_HEIGHT = 520;

// A curry-price guessing beat: the player types a pound amount into a real
// HTML number input, scored by how close the guess lands to the actual bill
// rather than an exact match.
export class Jamils extends Scene
{
    private scoreHud: ScoreHud;
    private inputElement: HTMLInputElement;
    private inputDom: GameObjects.DOMElement;
    private submitButton: Button;
    private answered: boolean = false;
    private dimmer: GameObjects.Rectangle;
    private bill: GameObjects.Image;

    constructor ()
    {
        super('Jamils');
    }

    create ()
    {
        this.answered = false;

        this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'curry'));

        this.scoreHud = new ScoreHud(this);

        this.showNarration();
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    // Scales an image down (never up) to fit entirely within the canvas -
    // used for the bill overlay so the full receipt is readable rather than
    // cropped like the cover-fit scene backgrounds.
    private fitWithin (image: GameObjects.Image, maxWidth: number, maxHeight: number): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.min(maxWidth / source.width, maxHeight / source.height, 1);

        return image.setScale(scale);
    }

    private showNarration (): void
    {
        const panel = new InfoPanel(this, {
            y: CENTER_Y,
            width: 880,
            title: NARRATION_TITLE,
            body: NARRATION_BODY,
            bodyAlign: 'left',
            dismissLabel: "LET'S EAT",
            onDismiss: () => this.showAnswerInput()
        });

        panel.show();
    }

    private showAnswerInput (): void
    {
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'number';
        this.inputElement.min = '0';
        this.inputElement.step = '0.01';
        this.inputElement.value = '0.00';
        this.inputElement.autocomplete = 'off';
        this.inputElement.style.width = '260px';
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
        this.inputElement.select();

        // A stray window blur fires ~50ms after the narration panel's
        // dismiss tween hands off to this callback, stealing focus back to
        // the page - reclaim it once so the player can start typing right away.
        setTimeout(() => {
            if (document.activeElement !== this.inputElement)
            {
                this.inputElement.focus();
                this.inputElement.select();
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

        const guess = parseFloat(this.inputElement.value);

        if (isNaN(guess))
        {
            return;
        }

        this.answered = true;
        this.submitButton.disableInteractive();
        this.inputElement.disabled = true;

        const difference = Math.abs(guess - CORRECT_ANSWER);
        const points = difference <= CLOSE_TOLERANCE ? CLOSE_POINTS
            : difference <= NEAR_TOLERANCE ? NEAR_POINTS
            : FAR_POINTS;

        addScore(this, points);

        const anchor = this.scoreHud.getToastAnchor();

        showScoreToast(this, points, {
            x: anchor.x,
            y: anchor.y,
            onComplete: () => this.revealBill()
        });
    }

    // Lays the itemised bill on top of the curry background (dimmed behind
    // it) once the guess has been scored, then shows CONTINUE over the top.
    // The bill is scaled to fit entirely within the canvas rather than
    // cover-cropped, so none of the receipt gets cut off.
    private revealBill (): void
    {
        this.inputDom.destroy();
        this.submitButton.destroy();

        this.dimmer = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setAlpha(0);

        this.bill = this.fitWithin(this.add.image(CENTER_X, BILL_Y, 'curry-bill'), BILL_MAX_WIDTH, BILL_MAX_HEIGHT);
        this.bill.setAlpha(0);

        this.tweens.add({ targets: [ this.dimmer, this.bill ], alpha: 1, duration: 400 });

        this.showContinue();
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Omelette')
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
