import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { ScoreHud } from '../ui/ScoreHud';
import { choices, QuizChoice, CORRECT_KEY, CORRECT_POINTS, INCORRECT_POINTS, NARRATION_BODY } from '../data/quiz/amber2';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const TOP_TEXT_Y = 60;
const CHOICE_Y = 560;
const CHOICE_GAP = 40;
const CHOICE_WIDTH = 220;
const CONTINUE_Y = 660;

// Fourth and last "identify the dog" beat, straight after Amber1: same
// Amber/Floss choices, another photo of Amber.
export class Amber2 extends Scene
{
    private scoreHud: ScoreHud;
    private choiceButtons: Button[] = [];
    private answered: boolean = false;

    constructor ()
    {
        super('Amber2');
    }

    create ()
    {
        this.answered = false;
        this.choiceButtons = [];

        this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'amber2'));

        this.scoreHud = new ScoreHud(this);

        this.buildTopText();
        this.buildChoices();
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    private buildTopText (): void
    {
        this.add.text(CENTER_X, TOP_TEXT_Y, NARRATION_BODY, {
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

    private buildChoices (): void
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

        this.choiceButtons.forEach((button) => button.destroy());
        this.choiceButtons = [];

        this.showContinue();
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Animals')
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
