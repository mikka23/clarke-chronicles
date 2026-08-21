import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { scene1Questions, MultiSelectQuestion, MultiSelectChoice } from '../data/quiz/scene1';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const PANEL_SIZE = 145;
const GLOW_SIZE = PANEL_SIZE * 2;
const CHOICE_SPACING = 190;
const CHOICE_Y = 336;
const SUBMIT_Y = 581;

// Lets the background/scene register with the player before anything else
// pops in, then the question, then the choices trickle in one by one.
const SCENE_VIEW_DELAY = 900;
const CHOICE_STAGGER = 110;

export class Scene1 extends Scene
{
    private questionIndex: number = 0;
    private question: MultiSelectQuestion;
    private selectedKeys: Set<string> = new Set();
    private frameDrawers: Map<string, (borderColor: number, borderWidth: number) => void> = new Map();
    private checkMarks: Map<string, GameObjects.Text> = new Map();
    private glows: Map<string, GameObjects.Image> = new Map();
    private submitButton: Button;
    private roundObjects: GameObjects.GameObject[] = [];
    private backgroundImage: GameObjects.Image;

    constructor ()
    {
        super('Scene1');
    }

    create ()
    {
        this.questionIndex = 0;

        this.ensureGlowTexture();

        this.backgroundImage = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'ben-golf-cartoon'));

        this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x081420, 0.25);

        this.startQuestion();
    }

    private startQuestion (): void
    {
        this.roundObjects.forEach((object) => object.destroy());
        this.roundObjects = [];
        this.submitButton?.destroy();

        this.question = scene1Questions[this.questionIndex];
        this.selectedKeys = new Set();
        this.frameDrawers.clear();
        this.checkMarks.clear();
        this.glows.clear();

        this.buildSubmitButton();
        this.playIntro();
    }

    // The scene sits quietly first so the background reads, then the
    // question pops in, then the choices trickle in one after another.
    private playIntro (): void
    {
        this.time.delayedCall(SCENE_VIEW_DELAY, () => {

            const question = this.buildQuestionText();
            this.roundObjects.push(question);

            this.tweens.add({
                targets: question,
                alpha: 1,
                scale: 1,
                y: 90,
                duration: 450,
                ease: 'Back.Out',
                onComplete: () => this.buildChoices()
            });
        });
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    // Same soft radial glow used behind a selected character panel in
    // CharacterSelect, reused here so the highlight feels consistent.
    private ensureGlowTexture (): void
    {
        if (this.textures.exists('char-glow'))
        {
            return;
        }

        const canvasTexture = this.textures.createCanvas('char-glow', GLOW_SIZE, GLOW_SIZE);

        if (!canvasTexture)
        {
            return;
        }

        const ctx = canvasTexture.getContext();
        const gradient = ctx.createRadialGradient(
            GLOW_SIZE / 2, GLOW_SIZE / 2, 0,
            GLOW_SIZE / 2, GLOW_SIZE / 2, GLOW_SIZE / 2
        );
        gradient.addColorStop(0, 'rgba(255, 224, 130, 0.95)');
        gradient.addColorStop(0.55, 'rgba(255, 210, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 210, 100, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE);

        canvasTexture.refresh();
    }

    private buildQuestionText (): GameObjects.Text
    {
        return this.add.text(CENTER_X, 60, this.question.question, {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 34,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5).setAlpha(0).setScale(0.6);
    }

    private buildChoices (): void
    {
        const choices = this.question.choices;
        const startX = CENTER_X - ((choices.length - 1) * CHOICE_SPACING) / 2;

        choices.forEach((choice, index) => {

            const panel = this.buildChoicePanel(choice, startX + index * CHOICE_SPACING, CHOICE_Y);
            this.roundObjects.push(panel);

            panel.setAlpha(0);
            panel.setScale(0.5);

            this.tweens.add({
                targets: panel,
                alpha: 1,
                scale: 1,
                duration: 380,
                delay: index * CHOICE_STAGGER,
                ease: 'Back.Out',
                onComplete: () => {

                    if (index === choices.length - 1)
                    {
                        this.revealSubmitButton();
                    }
                }
            });
        });
    }

    private buildChoicePanel (choice: MultiSelectChoice, x: number, y: number): GameObjects.Container
    {
        const panel = this.add.container(x, y);

        const glow = this.add.image(0, 0, 'char-glow')
            .setScale((PANEL_SIZE * 1.3) / GLOW_SIZE)
            .setAlpha(0);
        this.glows.set(choice.key, glow);

        const shadow = this.add.graphics();
        shadow.fillStyle(0x1a0f08, 0.4);
        shadow.fillRoundedRect(-PANEL_SIZE / 2 + 6, -PANEL_SIZE / 2 + 8, PANEL_SIZE, PANEL_SIZE, 14);

        const frame = this.add.graphics();

        const drawFrame = (borderColor: number, borderWidth: number) => {
            frame.clear();
            frame.fillStyle(0xf3ecdd, 1);
            frame.fillRoundedRect(-PANEL_SIZE / 2, -PANEL_SIZE / 2, PANEL_SIZE, PANEL_SIZE, 14);
            frame.lineStyle(borderWidth, borderColor, 1);
            frame.strokeRoundedRect(-PANEL_SIZE / 2, -PANEL_SIZE / 2, PANEL_SIZE, PANEL_SIZE, 14);
        };

        drawFrame(0xffffff, 5);
        this.frameDrawers.set(choice.key, drawFrame);

        const source = this.textures.get(choice.texture).getSourceImage();
        const pad = 26;
        const baseScale = Math.min((PANEL_SIZE - pad) / source.width, (PANEL_SIZE - pad) / source.height);

        const portrait = this.add.image(0, 0, choice.texture)
            .setOrigin(0.5)
            .setScale(baseScale);

        const label = this.add.text(0, PANEL_SIZE / 2 + 22, choice.label.toUpperCase(), {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 24,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        const checkMark = this.add.text(PANEL_SIZE / 2 - 18, -PANEL_SIZE / 2 + 18, '✓', {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: 30,
            color: '#2fbf4f',
            stroke: '#1a0f08',
            strokeThickness: 4
        }).setOrigin(0.5).setVisible(false);
        this.checkMarks.set(choice.key, checkMark);

        panel.add([ shadow, glow, frame, portrait, label, checkMark ]);

        const hitZone = this.add.zone(0, 0, PANEL_SIZE, PANEL_SIZE)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        panel.add(hitZone);

        hitZone.on('pointerover', () => {
            if (!this.selectedKeys.has(choice.key))
            {
                this.tweens.add({ targets: panel, scale: 1.05, duration: 120 });
            }
        });

        hitZone.on('pointerout', () => {
            if (!this.selectedKeys.has(choice.key))
            {
                this.tweens.add({ targets: panel, scale: 1, duration: 120 });
            }
        });

        hitZone.on('pointerdown', () => this.toggleChoice(choice.key, panel));

        return panel;
    }

    private toggleChoice (key: string, panel: GameObjects.Container): void
    {
        if (this.cache.audio.exists('select'))
        {
            this.sound.play('select');
        }

        const isSelected = this.selectedKeys.has(key);

        if (isSelected)
        {
            this.selectedKeys.delete(key);
        }
        else
        {
            this.selectedKeys.add(key);
        }

        const nowSelected = !isSelected;

        this.tweens.killTweensOf(panel);
        this.tweens.add({ targets: panel, scale: nowSelected ? 1.08 : 1, duration: 150, ease: 'Back.Out' });

        const glow = this.glows.get(key);

        if (glow)
        {
            this.tweens.killTweensOf(glow);
            this.tweens.add({ targets: glow, alpha: nowSelected ? 0.9 : 0, duration: 150 });
        }

        this.frameDrawers.get(key)?.(nowSelected ? 0xffd76e : 0xffffff, nowSelected ? 6 : 5);
        this.checkMarks.get(key)?.setVisible(nowSelected);

        this.updateSubmitState();
    }

    private buildSubmitButton (): void
    {
        this.submitButton = new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'SUBMIT!',
            onClick: () => this.submitAnswer()
        });

        this.submitButton.setAlpha(0);
        this.submitButton.disableInteractive();
    }

    // Fades the submit button in once every choice has finished popping in,
    // starting at its disabled (faded) look until something is selected.
    private revealSubmitButton (): void
    {
        this.tweens.add({ targets: this.submitButton, alpha: 0.4, duration: 300 });
    }

    private updateSubmitState (): void
    {
        this.tweens.killTweensOf(this.submitButton);
        this.submitButton.setEnabled(this.selectedKeys.size >= 1);
    }

    private submitAnswer (): void
    {
        this.submitButton.disableInteractive();

        const { correctKeys, pointsPerCorrect, pointsPerIncorrect, penaltyOverrides } = this.question;

        let total = 0;

        this.selectedKeys.forEach((key) => {

            if (correctKeys.includes(key))
            {
                total += pointsPerCorrect;
            }
            else
            {
                total += penaltyOverrides?.[key] ?? pointsPerIncorrect;
            }
        });

        addScore(this, total);

        const hasNextQuestion = this.questionIndex < scene1Questions.length - 1;

        showScoreToast(this, total, {
            onComplete: () => {

                if (hasNextQuestion)
                {
                    this.questionIndex++;
                    this.startQuestion();
                }
                else
                {
                    this.transitionToReveal();
                }
            }
        });
    }

    // Fades the leftover question text, choice panels and submit button out
    // before the reveal button appears, so it's the only thing left onscreen.
    private transitionToReveal (): void
    {
        const fadeTargets = [ ...this.roundObjects, this.submitButton ];

        this.tweens.add({
            targets: fadeTargets,
            alpha: 0,
            duration: 350,
            onComplete: () => {

                fadeTargets.forEach((target) => target.destroy());
                this.roundObjects = [];

                this.showReveal();
            }
        });
    }

    private showReveal (): void
    {
        const revealButton = new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'REVEAL REALITY',
            width: 260,
            onClick: () => {

                revealButton.destroy();
                this.playRevealTransition();
            }
        });
    }

    // Glitches the cartoon out in a few quick flickers, flashes white, then
    // dissolves into the real photo underneath - the "digital world giving
    // way to reality" beat.
    private playRevealTransition (): void
    {
        const cartoonImage = this.backgroundImage;

        const realImage = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'ben-golf-real'))
            .setAlpha(0)
            .setDepth(-1);

        const flash = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0)
            .setDepth(10);

        this.tweens.add({
            targets: cartoonImage,
            alpha: 0.35,
            duration: 70,
            yoyo: true,
            repeat: 4,
            onComplete: () => {

                this.tweens.add({ targets: flash, alpha: 0.7, duration: 130, yoyo: true });

                this.tweens.add({ targets: cartoonImage, alpha: 0, duration: 700, ease: 'Sine.InOut' });

                this.tweens.add({
                    targets: realImage,
                    alpha: 1,
                    duration: 700,
                    ease: 'Sine.InOut',
                    onComplete: () => {

                        cartoonImage.destroy();
                        flash.destroy();
                        this.backgroundImage = realImage;

                        this.showContinue();
                    }
                });
            }
        });
    }

    private showContinue (): void
    {
        new Button(this, {
            x: CENTER_X,
            y: SUBMIT_Y,
            label: 'CONTINUE',
            onClick: () => this.scene.start('Game')
        });
    }
}
