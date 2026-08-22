import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { ScoreHud } from '../ui/ScoreHud';
import { choices, QuizChoice, CORRECT_KEY, CORRECT_POINTS, INCORRECT_POINTS, QUESTION } from '../data/quiz/omelette';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const QUESTION_Y = 130;
const CONTINUE_Y = 660;

// The answer grid sits in the left half of the canvas, under the question:
// a small inset from the left edge out to 50% width, and from just below
// the question down to 30% up from the bottom.
const GRID_COLS = 2;
const GRID_ROWS = 2;
const GRID_LEFT = 40;
const GRID_RIGHT = GAME_WIDTH * 0.5;
const GRID_TOP = 230;
const GRID_BOTTOM = GAME_HEIGHT * 0.7;
const GRID_GAP = 20;
const CELL_WIDTH = (GRID_RIGHT - GRID_LEFT - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
const CELL_HEIGHT = (GRID_BOTTOM - GRID_TOP - GRID_GAP * (GRID_ROWS - 1)) / GRID_ROWS;

// The cells above lay out the grid's spacing; the button drawn inside each
// one is shrunk vertically so its face hugs the (larger) label instead of
// leaving a wide band of empty cream above and below the text.
const CHOICE_VERTICAL_INSET = 30;
const CHOICE_HEIGHT = CELL_HEIGHT - CHOICE_VERTICAL_INSET * 2;

// Final quiz beat, after Jamil's and before the closing mini-game: the
// omelette video sits paused on its first frame (same trick as Reception's
// toilet-paper cutscene) while the player picks an answer, then plays for
// real once they've confirmed.
export class Omelette extends Scene
{
    private video: GameObjects.Video;
    private scoreHud: ScoreHud;
    private questionText: GameObjects.Text;
    private choiceButtons: Button[] = [];
    private answered: boolean = false;

    constructor ()
    {
        super('Omelette');
    }

    create ()
    {
        this.answered = false;
        this.choiceButtons = [];

        this.cameras.main.setBackgroundColor(0x000000);

        this.video = this.add.video(CENTER_X, CENTER_Y, 'omelette');

        this.video.on('created', (_video: GameObjects.Video, width: number, height: number) => {

            const scale = Math.max(GAME_WIDTH / width, GAME_HEIGHT / height);
            this.video.setScale(scale);
        });

        // Browsers won't render a paused video's frame unless it has actually
        // played, and won't autoplay unmuted without a user gesture - so play
        // muted just long enough to grab the first frame, then freeze on it.
        this.video.setMute(true);
        this.video.play(false);
        this.video.once('play', () => this.video.pause());

        this.scoreHud = new ScoreHud(this);

        this.buildQuestion();
    }

    private buildQuestion (): void
    {
        this.questionText = this.add.text(CENTER_X, QUESTION_Y, QUESTION, {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 32,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 1000 },
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5).setDepth(2);

        choices.forEach((choice, index) => {

            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);
            const x = GRID_LEFT + col * (CELL_WIDTH + GRID_GAP) + CELL_WIDTH / 2;
            const y = GRID_TOP + row * (CELL_HEIGHT + GRID_GAP) + CELL_HEIGHT / 2;

            const button = new Button(this, {
                x,
                y,
                label: choice.label,
                width: CELL_WIDTH,
                height: CHOICE_HEIGHT,
                fontSize: 26,
                // The default red button reads poorly here, sat over a dark
                // paused video frame - a cream face with dark text keeps
                // contrast high regardless of what's behind it.
                fillColor: 0xf3ecdd,
                hoverColor: 0xffffff,
                labelColor: '#1a0f08',
                labelStroke: '#f3ecdd',
                onClick: () => this.selectChoice(choice)
            }).setDepth(2);

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

        showScoreToast(this, points, { x: anchor.x, y: anchor.y });

        this.questionText.destroy();
        this.choiceButtons.forEach((button) => button.destroy());
        this.choiceButtons = [];

        this.playVideo();
    }

    private playVideo (): void
    {
        // The first-frame trick already called play() once, so Phaser's
        // play() is a no-op the second time round (it only calls through to
        // the native video on the first invocation) - resume() is what
        // actually un-pauses the underlying <video> element.
        this.video.setMute(false);
        this.video.resume();

        this.video.once('complete', () => this.showContinue());
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Cakes')
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
