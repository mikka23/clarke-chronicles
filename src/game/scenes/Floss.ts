import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { ScoreHud } from '../ui/ScoreHud';
import { choices, QuizChoice, CORRECT_KEY, CORRECT_POINTS, INCORRECT_POINTS, NARRATION_BODY, CHOICES_BEFORE_END_MS } from '../data/quiz/floss';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const TOP_TEXT_Y = 60;
const CHOICE_Y = 560;
const CHOICE_GAP = 40;
const CHOICE_WIDTH = 220;
const CONTINUE_Y = 660;

// Video beat after Cakes: the Floss video plays straight through (audio on,
// no click-to-start gate, since transitioning here is already a user
// gesture) while a top caption asks the player to identify the dog. The
// Amber/Floss choices animate in shortly before the video ends so the
// player answers while the dog is still on screen, then a continue button
// appears once playback completes.
export class Floss extends Scene
{
    private video: GameObjects.Video;
    private scoreHud: ScoreHud;
    private topText: GameObjects.Text;
    private choiceButtons: Button[] = [];
    private answered: boolean = false;
    private choicesShown: boolean = false;

    constructor ()
    {
        super('Floss');
    }

    create ()
    {
        this.answered = false;
        this.choicesShown = false;
        this.choiceButtons = [];

        this.cameras.main.setBackgroundColor(0x000000);

        this.video = this.add.video(CENTER_X, CENTER_Y, 'floss');

        this.video.on('created', (_video: GameObjects.Video, width: number, height: number) => {

            const scale = Math.max(GAME_WIDTH / width, GAME_HEIGHT / height);
            this.video.setScale(scale);
        });

        this.scoreHud = new ScoreHud(this);

        this.buildTopText();

        this.video.play(false);
        this.video.once('complete', () => this.showContinue());
    }

    update (): void
    {
        if (this.choicesShown)
        {
            return;
        }

        const element = this.video.video;

        // The video element's duration isn't reliably known the instant
        // playback starts, so poll each frame instead of pre-computing a
        // delayedCall - avoids ending up with a NaN delay that never fires.
        if (!element || !element.duration || isNaN(element.duration))
        {
            return;
        }

        const remainingMs = (element.duration - element.currentTime) * 1000;

        if (remainingMs <= CHOICES_BEFORE_END_MS)
        {
            this.choicesShown = true;
            this.showChoices();
        }
    }

    private buildTopText (): void
    {
        this.topText = this.add.text(CENTER_X, TOP_TEXT_Y, NARRATION_BODY, {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 30,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 1000 },
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5).setDepth(2);
    }

    private showChoices (): void
    {
        const startX = CENTER_X - ((choices.length - 1) * (CHOICE_WIDTH + CHOICE_GAP)) / 2;

        choices.forEach((choice, index) => {

            const button = new Button(this, {
                x: startX + index * (CHOICE_WIDTH + CHOICE_GAP),
                y: CHOICE_Y,
                label: choice.label,
                width: CHOICE_WIDTH,
                onClick: () => this.selectChoice(choice)
            }).setDepth(2);

            button.setAlpha(0);
            button.setScale(0.6);

            this.tweens.add({
                targets: button,
                alpha: 1,
                scale: 1,
                duration: 350,
                ease: 'Back.Out'
            });

            this.choiceButtons.push(button);
        });
    }

    private selectChoice (choice: QuizChoice): void
    {
        if (this.answered)
        {
            return;
        }

        this.answered = true;

        const isCorrect = choice.key === CORRECT_KEY;
        const points = isCorrect ? CORRECT_POINTS : INCORRECT_POINTS;

        addScore(this, points);

        const anchor = this.scoreHud.getToastAnchor();

        // The video's own audio is still playing, so keep the toast's sound
        // effect muted rather than layering another cue over it.
        showScoreToast(this, points, { x: anchor.x, y: anchor.y, playSound: false });

        this.choiceButtons.forEach((button) => button.destroy());
        this.choiceButtons = [];
    }

    private showContinue (): void
    {
        this.topText.destroy();

        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Floss2')
        }).setDepth(2);

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
