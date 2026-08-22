import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { ScoreHud } from '../ui/ScoreHud';
import { isCloseMatch } from '../utils/fuzzyMatch';
import { QUESTION, CORRECT_ANSWERS, TIERS, INCORRECT_POINTS } from '../data/quiz/plum';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const QUESTION_Y = 70;
const PHOTO_X = 900;
const PHOTO_Y = 380;
const PHOTO_WIDTH = 380;
const PHOTO_HEIGHT = 460;

const HINT_Y = 210;
const INPUT_X = 360;
const INPUT_Y = 420;
const SUBMIT_Y = 490;
const FEEDBACK_Y = 550;

// Tiered "who is this?" beat, straight after PaulCartoon: a free-text guess
// against a photo of Plum, worth fewer points (and eventually revealing a
// hint) with each wrong attempt, following on to the mini game afterwards.
export class Plum extends Scene
{
    private scoreHud: ScoreHud;
    private inputElement: HTMLInputElement;
    private inputDom: GameObjects.DOMElement;
    private submitButton: Button;
    private hintText: GameObjects.Text;
    private feedbackText?: GameObjects.Text;
    private tierIndex: number = 0;
    private answered: boolean = false;

    constructor ()
    {
        super('Plum');
    }

    create ()
    {
        this.tierIndex = 0;
        this.answered = false;
        this.feedbackText = undefined;

        this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x081420, 1);

        this.buildPhoto();

        this.scoreHud = new ScoreHud(this);

        this.buildQuestionText();
        this.buildHintText();
        this.buildAnswerInput();
    }

    private buildPhoto (): void
    {
        const image = this.add.image(PHOTO_X, PHOTO_Y, 'plum');

        const source = this.textures.get('plum').getSourceImage();
        const scale = Math.min(PHOTO_WIDTH / source.width, PHOTO_HEIGHT / source.height);
        image.setScale(scale);

        const frame = this.add.graphics();
        frame.lineStyle(6, 0xf3ecdd, 1);
        frame.strokeRect(PHOTO_X - PHOTO_WIDTH / 2, PHOTO_Y - PHOTO_HEIGHT / 2, PHOTO_WIDTH, PHOTO_HEIGHT);
    }

    private buildQuestionText (): void
    {
        this.add.text(CENTER_X, QUESTION_Y, QUESTION, {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 34,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 1000 },
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5);
    }

    private buildHintText (): void
    {
        this.hintText = this.add.text(INPUT_X, HINT_Y, '', {
            fontFamily: '"Special Elite", Georgia, serif',
            fontSize: 22,
            color: '#ffd76e',
            stroke: '#1a0f08',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 460 },
            padding: { x: 8, y: 8 }
        }).setOrigin(0.5);
    }

    private buildAnswerInput (): void
    {
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.placeholder = 'Type your answer...';
        this.inputElement.autocomplete = 'off';
        this.inputElement.style.width = '340px';
        this.inputElement.style.padding = '12px 16px';
        this.inputElement.style.fontSize = '20px';
        this.inputElement.style.fontFamily = '"Special Elite", Georgia, serif';
        this.inputElement.style.border = '3px solid #1a0f08';
        this.inputElement.style.borderRadius = '10px';
        this.inputElement.style.textAlign = 'center';
        this.inputElement.style.background = '#f3ecdd';
        this.inputElement.style.color = '#1a0f08';
        this.inputElement.style.outline = 'none';

        this.inputDom = this.add.dom(INPUT_X, INPUT_Y, this.inputElement);

        this.inputElement.addEventListener('keydown', (event) => {

            if (event.key === 'Enter')
            {
                this.submitAnswer();
            }
        });

        this.inputElement.focus();

        setTimeout(() => {
            if (document.activeElement !== this.inputElement)
            {
                this.inputElement.focus();
            }
        }, 100);

        this.submitButton = new Button(this, {
            x: INPUT_X,
            y: SUBMIT_Y,
            label: 'SUBMIT!',
            onClick: () => this.submitAnswer()
        });
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

        const isCorrect = CORRECT_ANSWERS.some((accepted) => isCloseMatch(answer, accepted));

        if (isCorrect)
        {
            this.finish(TIERS[this.tierIndex].points);
            return;
        }

        const hasNextTier = this.tierIndex < TIERS.length - 1;

        if (hasNextTier)
        {
            this.tierIndex++;
            this.inputElement.value = '';
            this.hintText.setText(TIERS[this.tierIndex].hint ?? '');
            this.showFeedback('Not quite - try again.');
            this.inputElement.focus();
            return;
        }

        this.finish(INCORRECT_POINTS);
    }

    private showFeedback (message: string): void
    {
        this.feedbackText?.destroy();

        this.feedbackText = this.add.text(INPUT_X, FEEDBACK_Y, message, {
            fontFamily: '"Special Elite", Georgia, serif',
            fontSize: 18,
            color: '#e8402c',
            stroke: '#1a0f08',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
    }

    private finish (points: number): void
    {
        this.answered = true;
        this.submitButton.disableInteractive();
        this.inputElement.disabled = true;

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
        this.feedbackText?.destroy();

        const button = new Button(this, {
            x: INPUT_X,
            y: SUBMIT_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('GameOver')
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
