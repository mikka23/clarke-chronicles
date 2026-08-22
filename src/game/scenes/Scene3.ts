import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ScoreHud } from '../ui/ScoreHud';
import { activityChoices, ActivityChoice, MAX_PICKS, NARRATION_TITLE, NARRATION_BODY } from '../data/quiz/scene3';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const CHOICE_COLS = 4;
const CHOICE_SPACING_X = 280;
const CHOICE_SPACING_Y = 140;
const CHOICE_START_Y = 300;
const CHOICE_STAGGER = 90;
const CONTINUE_Y = 660;

export class Scene3 extends Scene
{
    private selectedKeys: Set<string> = new Set();
    private buttons: Map<string, Button> = new Map();
    private locked: boolean = false;
    private scoreHud: ScoreHud;

    constructor ()
    {
        super('Scene3');
    }

    create ()
    {
        this.selectedKeys = new Set();
        this.buttons.clear();
        this.locked = false;

        this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'butlins'));

        this.scoreHud = new ScoreHud(this);

        this.showNarration();
    }

    private showNarration (): void
    {
        const panel = new InfoPanel(this, {
            y: CENTER_Y,
            width: 880,
            title: NARRATION_TITLE,
            body: NARRATION_BODY,
            dismissLabel: "LET'S GO!",
            audioKey: 'scene3-narration',
            onDismiss: () => this.buildChoices()
        });

        panel.show();
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    private buildChoices (): void
    {
        const cols = Math.min(CHOICE_COLS, activityChoices.length);
        const rowCount = Math.ceil(activityChoices.length / cols);
        const startX = CENTER_X - ((cols - 1) * CHOICE_SPACING_X) / 2;
        const startY = CHOICE_START_Y - ((rowCount - 1) * CHOICE_SPACING_Y) / 2;

        activityChoices.forEach((choice, index) => {

            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * CHOICE_SPACING_X;
            const y = startY + row * CHOICE_SPACING_Y;

            const button = new Button(this, {
                x,
                y,
                label: choice.label.toUpperCase(),
                width: 240,
                height: 90,
                fontSize: 22,
                onClick: () => this.pickChoice(choice, button)
            });

            button.setAlpha(0);
            button.setScale(0.5);

            this.tweens.add({
                targets: button,
                alpha: 1,
                scale: 1,
                duration: 380,
                delay: index * CHOICE_STAGGER,
                ease: 'Back.Out'
            });

            this.buttons.set(choice.key, button);
        });
    }

    private pickChoice (choice: ActivityChoice, button: Button): void
    {
        if (this.locked || this.selectedKeys.has(choice.key) || this.selectedKeys.size >= MAX_PICKS)
        {
            return;
        }

        this.selectedKeys.add(choice.key);
        button.setEnabled(false);

        addScore(this, choice.points);

        const anchor = this.scoreHud.getToastAnchor();
        showScoreToast(this, choice.points, { x: anchor.x, y: anchor.y });

        if (choice.feedbackText)
        {
            this.showFeedbackText(choice.feedbackText, button.x, button.y + 70);
        }

        if (this.selectedKeys.size >= MAX_PICKS)
        {
            this.locked = true;
            this.clearRemainingChoices();
        }
    }

    private showFeedbackText (message: string, x: number, y: number): void
    {
        const text = this.add.text(x, y, message, {
            fontFamily: '"Special Elite", Georgia, serif',
            fontSize: 20,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 4,
            align: 'center',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5).setAlpha(0).setDepth(1000);

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 250,
            onComplete: () => {

                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    y: y - 30,
                    duration: 350,
                    delay: 900,
                    ease: 'Cubic.easeIn',
                    onComplete: () => text.destroy()
                });
            }
        });
    }

    private clearRemainingChoices (): void
    {
        const leftover: Button[] = [];

        this.buttons.forEach((button, key) => {

            if (!this.selectedKeys.has(key))
            {
                leftover.push(button);
            }
        });

        leftover.forEach((button, index) => {

            this.tweens.add({
                targets: button,
                y: button.y + 500,
                angle: index % 2 === 0 ? -35 : 35,
                alpha: 0,
                duration: 450,
                delay: index * 40,
                ease: 'Cubic.easeIn'
            });
        });

        this.time.delayedCall(700, () => {

            this.buttons.forEach((button) => button.destroy());
            this.buttons.clear();

            this.showContinue();
        });
    }

    private showContinue (): void
    {
        new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('ArabianDerby')
        });
    }
}
