import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { LicensePlate } from '../ui/LicensePlate';
import { ScoreHud } from '../ui/ScoreHud';
import { licensePlates, LicensePlateChoice, MAX_PICKS, CORRECT_POINTS, INCORRECT_POINTS, NARRATION_TITLE, NARRATION_BODY, PICK_INSTRUCTION } from '../data/quiz/findTheCar';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const PLATE_COLS = 4;
const PLATE_SPACING_X = 280;
const PLATE_SPACING_Y = 130;
const PLATE_START_Y = 280;
const PLATE_STAGGER = 60;
const INSTRUCTION_Y = 175;
const CONFIRM_Y = 590;
const CONTINUE_Y = 660;

// Last of the "location questions" run: the family's done travelling, and
// the player has to spot the two real plates hiding among ten decoys before
// the car can head home. Picks are provisional - the player toggles plates
// on/off and only locks them in (and scores) by hitting CONFIRM.
export class FindTheCar extends Scene
{
    private selectedChoices: Map<string, LicensePlateChoice> = new Map();
    private plateButtons: Map<string, LicensePlate> = new Map();
    private confirmed: boolean = false;
    private confirmButton: Button;
    private instructionText: GameObjects.Text;
    private scoreHud: ScoreHud;
    private background: GameObjects.Image;

    constructor ()
    {
        super('FindTheCar');
    }

    create ()
    {
        this.selectedChoices = new Map();
        this.plateButtons.clear();
        this.confirmed = false;

        this.background = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'cars'));

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
            dismissLabel: 'CLICK TO CONTINUE',
            onDismiss: () => this.buildPlates()
        });

        panel.show();
    }

    // Fisher-Yates - reshuffled fresh each time the round is played so the
    // two real plates aren't always sat in the same spot.
    private shuffledPlates (): LicensePlateChoice[]
    {
        const shuffled = [ ...licensePlates ];

        for (let i = shuffled.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));

            [ shuffled[i], shuffled[j] ] = [ shuffled[j], shuffled[i] ];
        }

        return shuffled;
    }

    private buildPlates (): void
    {
        this.instructionText = this.add.text(CENTER_X, INSTRUCTION_Y, PICK_INSTRUCTION, {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 30,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: this.instructionText, alpha: 1, duration: 300 });

        const plates = this.shuffledPlates();

        const cols = Math.min(PLATE_COLS, plates.length);
        const rowCount = Math.ceil(plates.length / cols);
        const startX = CENTER_X - ((cols - 1) * PLATE_SPACING_X) / 2;
        const startY = PLATE_START_Y - ((rowCount - 1) * PLATE_SPACING_Y) / 2;

        plates.forEach((choice, index) => {

            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * PLATE_SPACING_X;
            const y = startY + row * PLATE_SPACING_Y;

            const plateButton = new LicensePlate(this, {
                x,
                y,
                text: choice.plate,
                onClick: () => this.togglePlate(choice, plateButton)
            });

            plateButton.setAlpha(0);
            plateButton.setScale(0.5);

            this.tweens.add({
                targets: plateButton,
                alpha: 1,
                scale: 1,
                duration: 380,
                delay: index * PLATE_STAGGER,
                ease: 'Back.Out'
            });

            this.plateButtons.set(choice.key, plateButton);
        });

        this.confirmButton = new Button(this, {
            x: CENTER_X,
            y: CONFIRM_Y,
            label: 'CONFIRM',
            onClick: () => this.confirmPicks()
        });

        this.confirmButton.setEnabled(false);
    }

    private togglePlate (choice: LicensePlateChoice, plateButton: LicensePlate): void
    {
        if (this.confirmed)
        {
            return;
        }

        if (this.selectedChoices.has(choice.key))
        {
            this.selectedChoices.delete(choice.key);
            plateButton.setSelected(false);
        }
        else
        {
            if (this.selectedChoices.size >= MAX_PICKS)
            {
                return;
            }

            this.selectedChoices.set(choice.key, choice);
            plateButton.setSelected(true);
        }

        this.confirmButton.setEnabled(this.selectedChoices.size === MAX_PICKS);
    }

    private confirmPicks (): void
    {
        if (this.confirmed || this.selectedChoices.size < MAX_PICKS)
        {
            return;
        }

        this.confirmed = true;
        this.confirmButton.setEnabled(false);

        this.tweens.add({ targets: [ this.instructionText, this.confirmButton ], alpha: 0, duration: 200 });

        this.plateButtons.forEach((plateButton, key) => {

            if (this.selectedChoices.has(key))
            {
                plateButton.setEnabled(false);
            }
        });

        this.scoreSelections([ ...this.selectedChoices.values() ]);
    }

    // Scores every confirmed pick, then shows a single toast for the
    // combined total before clearing the remaining plates from the board.
    private scoreSelections (choices: LicensePlateChoice[]): void
    {
        const total = choices.reduce((sum, choice) => sum + (choice.correct ? CORRECT_POINTS : INCORRECT_POINTS), 0);

        addScore(this, total);

        const anchor = this.scoreHud.getToastAnchor();

        showScoreToast(this, total, {
            x: anchor.x,
            y: anchor.y,
            onComplete: () => this.clearRemainingPlates()
        });
    }

    private clearRemainingPlates (): void
    {
        const leftover: LicensePlate[] = [];

        this.plateButtons.forEach((plateButton, key) => {

            if (!this.selectedChoices.has(key))
            {
                leftover.push(plateButton);
            }
        });

        leftover.forEach((plateButton, index) => {

            this.tweens.add({
                targets: plateButton,
                y: plateButton.y + 500,
                angle: index % 2 === 0 ? -35 : 35,
                alpha: 0,
                duration: 450,
                delay: index * 40,
                ease: 'Cubic.easeIn'
            });
        });

        this.time.delayedCall(700, () => {

            this.plateButtons.forEach((plateButton) => plateButton.destroy());
            this.plateButtons.clear();

            this.instructionText.destroy();
            this.confirmButton.destroy();

            this.revealCar();
        });
    }

    // Swaps the background over to the found car and shows CONTINUE on top
    // of it, once the round has finished scoring.
    private revealCar (): void
    {
        this.tweens.add({
            targets: this.background,
            alpha: 0,
            duration: 300,
            onComplete: () => {

                this.background.setTexture('car-tam');
                this.fitToCanvas(this.background);

                this.tweens.add({ targets: this.background, alpha: 1, duration: 400 });

                this.showContinue();
            }
        });
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Jamils')
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
