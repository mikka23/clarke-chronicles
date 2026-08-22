import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ToggleTile } from '../ui/ToggleTile';
import { ScoreHud } from '../ui/ScoreHud';
import { cakeChoices, cakeCarouselImages, CakeChoice, CORRECT_POINTS, INCORRECT_POINTS, NARRATION_TITLE, NARRATION_BODY, QUESTION } from '../data/quiz/cakes';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const QUESTION_Y = 130;
const CONFIRM_Y = 590;
const CONTINUE_Y = 660;

const GRID_COLS = 4;
const TILE_WIDTH = 200;
const TILE_HEIGHT = 80;
const TILE_GAP_X = 24;
const TILE_GAP_Y = 24;
const GRID_TOP = 230;

const CAROUSEL_FRAME_WIDTH = 700;
const CAROUSEL_FRAME_HEIGHT = 420;
const CAROUSEL_ARROW_GAP = 60;
const CAROUSEL_ARROW_SIZE = 56;
const CAROUSEL_INDEX_Y = CENTER_Y + CAROUSEL_FRAME_HEIGHT / 2 + 34;

// Dessert-time multi-select round after Jamil's omelette: player picks every
// cake design they think Mum has actually made from a shuffled grid of real
// and decoy designs, confirms, then flips through the real photos in a
// manual left/right carousel before moving on.
export class Cakes extends Scene
{
    private scoreHud: ScoreHud;
    private questionText: GameObjects.Text;
    private tiles: Map<string, ToggleTile> = new Map();
    private choicesByKey: Map<string, CakeChoice> = new Map();
    private selectedKeys: Set<string> = new Set();
    private confirmButton: Button;
    private confirmed: boolean = false;

    constructor ()
    {
        super('Cakes');
    }

    create ()
    {
        this.tiles.clear();
        this.choicesByKey.clear();
        this.selectedKeys.clear();
        this.confirmed = false;

        this.cameras.main.setBackgroundColor(0x2b1608);

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
            dismissLabel: 'CLICK TO CONTINUE',
            onDismiss: () => this.buildQuestion()
        });

        panel.show();
    }

    // Fisher-Yates - reshuffled fresh each time the round is played so the
    // correct answers aren't always sat in the same grid spot.
    private shuffledChoices (): CakeChoice[]
    {
        const shuffled = [ ...cakeChoices ];

        for (let i = shuffled.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));

            [ shuffled[i], shuffled[j] ] = [ shuffled[j], shuffled[i] ];
        }

        return shuffled;
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
        }).setOrigin(0.5);

        this.buildChoices();
    }

    private buildChoices (): void
    {
        const choices = this.shuffledChoices();

        const startX = CENTER_X - ((GRID_COLS - 1) * (TILE_WIDTH + TILE_GAP_X)) / 2;
        const startY = GRID_TOP;

        choices.forEach((choice, index) => {

            this.choicesByKey.set(choice.key, choice);

            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);
            const x = startX + col * (TILE_WIDTH + TILE_GAP_X);
            const y = startY + row * (TILE_HEIGHT + TILE_GAP_Y);

            const tile = new ToggleTile(this, {
                x,
                y,
                width: TILE_WIDTH,
                height: TILE_HEIGHT,
                label: choice.label,
                onClick: () => this.toggleChoice(choice, tile)
            });

            tile.setAlpha(0);
            tile.setScale(0.5);

            this.tweens.add({
                targets: tile,
                alpha: 1,
                scale: 1,
                duration: 350,
                delay: index * 50,
                ease: 'Back.Out'
            });

            this.tiles.set(choice.key, tile);
        });

        this.confirmButton = new Button(this, {
            x: CENTER_X,
            y: CONFIRM_Y,
            label: 'CONFIRM',
            onClick: () => this.confirmPicks()
        });

        this.confirmButton.setEnabled(false);
    }

    private toggleChoice (choice: CakeChoice, tile: ToggleTile): void
    {
        if (this.confirmed)
        {
            return;
        }

        if (this.selectedKeys.has(choice.key))
        {
            this.selectedKeys.delete(choice.key);
            tile.setSelected(false);
        }
        else
        {
            this.selectedKeys.add(choice.key);
            tile.setSelected(true);
        }

        this.confirmButton.setEnabled(this.selectedKeys.size >= 1);
    }

    private confirmPicks (): void
    {
        if (this.confirmed || this.selectedKeys.size === 0)
        {
            return;
        }

        this.confirmed = true;
        this.confirmButton.setEnabled(false);

        this.tweens.add({ targets: [ this.questionText, this.confirmButton ], alpha: 0, duration: 200 });

        this.tiles.forEach((tile) => tile.setEnabled(false));

        this.scoreSelections([ ...this.selectedKeys ]);
    }

    // Scores every confirmed pick, then shows a single toast for the
    // combined total before clearing the board and moving into the photo
    // carousel.
    private scoreSelections (keys: string[]): void
    {
        const total = keys.reduce((sum, key) => {

            const choice = this.choicesByKey.get(key)!;

            return sum + (choice.correct ? CORRECT_POINTS : INCORRECT_POINTS);

        }, 0);

        addScore(this, total);

        const anchor = this.scoreHud.getToastAnchor();

        showScoreToast(this, total, {
            x: anchor.x,
            y: anchor.y,
            onComplete: () => this.clearBoard()
        });
    }

    private clearBoard (): void
    {
        this.questionText.destroy();
        this.confirmButton.destroy();

        this.tiles.forEach((tile) => tile.destroy());
        this.tiles.clear();

        this.showCarousel();
    }

    private showCarousel (): void
    {
        let index = 0;

        this.add.rectangle(CENTER_X, CENTER_Y, CAROUSEL_FRAME_WIDTH + 20, CAROUSEL_FRAME_HEIGHT + 20, 0xf3ecdd)
            .setStrokeStyle(4, 0x1a0f08);

        const image = this.add.image(CENTER_X, CENTER_Y, cakeCarouselImages[index]);
        this.fitToFrame(image);

        const indexText = this.add.text(CENTER_X, CAROUSEL_INDEX_Y, this.carouselLabel(index), {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 24,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 4,
            padding: { x: 8, y: 8 }
        }).setOrigin(0.5);

        const showAt = (newIndex: number) => {

            index = newIndex;
            image.setTexture(cakeCarouselImages[index]);
            this.fitToFrame(image);
            indexText.setText(this.carouselLabel(index));
        };

        new Button(this, {
            x: CENTER_X - CAROUSEL_FRAME_WIDTH / 2 - CAROUSEL_ARROW_GAP,
            y: CENTER_Y,
            label: '◀',
            width: CAROUSEL_ARROW_SIZE,
            height: CAROUSEL_ARROW_SIZE,
            fontSize: 22,
            italic: false,
            onClick: () => showAt((index - 1 + cakeCarouselImages.length) % cakeCarouselImages.length)
        });

        new Button(this, {
            x: CENTER_X + CAROUSEL_FRAME_WIDTH / 2 + CAROUSEL_ARROW_GAP,
            y: CENTER_Y,
            label: '▶',
            width: CAROUSEL_ARROW_SIZE,
            height: CAROUSEL_ARROW_SIZE,
            fontSize: 22,
            italic: false,
            onClick: () => showAt((index + 1) % cakeCarouselImages.length)
        });

        this.showContinue();
    }

    private carouselLabel (index: number): string
    {
        return `${index + 1} / ${cakeCarouselImages.length}`;
    }

    private fitToFrame (image: GameObjects.Image): void
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.min(CAROUSEL_FRAME_WIDTH / source.width, CAROUSEL_FRAME_HEIGHT / source.height);

        image.setScale(scale);
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Floss')
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
