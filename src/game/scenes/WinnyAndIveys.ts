import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ScoreHud } from '../ui/ScoreHud';
import { containsCloseMatch } from '../utils/fuzzyMatch';
import { NARRATION_TITLE, NARRATION_BODY, ANSWER_KEYWORDS, CORRECT_POINTS, INCORRECT_POINTS } from '../data/quiz/winnyAndIveys';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const INPUT_Y = 560;
const SUBMIT_Y = 630;

// Free-text follow-up to Grey Mare's Tail: another photo, another typed
// answer, but this one accepts the location if any of a handful of
// name-based keywords show up anywhere in what the player types.
export class WinnyAndIveys extends Scene
{
    private scoreHud: ScoreHud;
    private inputElement: HTMLInputElement;
    private inputDom: GameObjects.DOMElement;
    private submitButton: Button;
    private answered: boolean = false;

    constructor ()
    {
        super('WinnyAndIveys');
    }

    create ()
    {
        this.answered = false;

        this.layoutPhotoPair(this.add.image(0, CENTER_Y, 'winny-and-iveys'), this.add.image(0, CENTER_Y, 'winney-iveys-2'));

        this.scoreHud = new ScoreHud(this);

        this.showNarration();
    }

    // Two photos share the canvas side by side, scaled to fill as much of
    // the screen as possible with only a thin gap between them.
    private layoutPhotoPair (left: GameObjects.Image, right: GameObjects.Image): void
    {
        const GAP = 12;

        const leftSource = this.textures.get(left.texture.key).getSourceImage();
        const rightSource = this.textures.get(right.texture.key).getSourceImage();

        let leftScale = GAME_HEIGHT / leftSource.height;
        let rightScale = GAME_HEIGHT / rightSource.height;

        const leftWidth = leftSource.width * leftScale;
        const rightWidth = rightSource.width * rightScale;
        const totalWidth = leftWidth + GAP + rightWidth;

        if (totalWidth > GAME_WIDTH)
        {
            const shrink = GAME_WIDTH / totalWidth;
            leftScale *= shrink;
            rightScale *= shrink;
        }

        left.setScale(leftScale);
        right.setScale(rightScale);

        const finalLeftWidth = leftSource.width * leftScale;
        const finalRightWidth = rightSource.width * rightScale;
        const finalTotalWidth = finalLeftWidth + GAP + finalRightWidth;
        const startX = CENTER_X - finalTotalWidth / 2;

        left.setX(startX + finalLeftWidth / 2);
        right.setX(startX + finalLeftWidth + GAP + finalRightWidth / 2);
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

        const isCorrect = ANSWER_KEYWORDS.some((keyword) => containsCloseMatch(answer, keyword));
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
            onClick: () => this.scene.start('NewForest')
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
