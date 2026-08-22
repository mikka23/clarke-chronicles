import { Scene, GameObjects } from 'phaser';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import { ScoreHud } from '../ui/ScoreHud';
import { snackSets, SnackItem, MAX_PICKS_PER_SET, NARRATION_TITLE, NARRATION_BODY } from '../data/quiz/scene2';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const PANEL_SIZE = 145;
const CHOICE_COLS = 3;
const CHOICE_SPACING_Y = 175;
const CHOICE_START_Y = 240;
// The shelf lives entirely in the right half of the screen, clear of the
// boot area over on the left, with a small margin off the right edge.
const CHOICE_AREA_LEFT = GAME_WIDTH * 0.50;
const CHOICE_AREA_RIGHT = GAME_WIDTH * 0.93;

const CHOICE_STAGGER = 90;

// The open car boot in the asda.jpg background, expressed as a fraction of
// the canvas so picked items have somewhere to visually land.
const BOOT_X_MIN = GAME_WIDTH * 0.10;
const BOOT_X_MAX = GAME_WIDTH * 0.25;
const BOOT_Y_MIN = GAME_HEIGHT * 0.50; // 50% from bottom
const BOOT_Y_MAX = GAME_HEIGHT * 0.70; // 30% from bottom
const BOOT_COLS = 3;
const BOOT_ROWS = 2;
const BOOT_CELL_W = (BOOT_X_MAX - BOOT_X_MIN) / BOOT_COLS;
const BOOT_CELL_H = (BOOT_Y_MAX - BOOT_Y_MIN) / BOOT_ROWS;
const BOOT_ICON_PAD = 6;

export class Scene2 extends Scene
{
    private setIndex: number = 0;
    private selectedKeys: Set<string> = new Set();
    private panels: Map<string, GameObjects.Container> = new Map();
    private bootedCount: number = 0;
    private totalPicks: number = 0;
    private locked: boolean = false;
    private setPoints: number = 0;
    private scoreHud: ScoreHud;

    constructor ()
    {
        super('Scene2');
    }

    create ()
    {
        this.setIndex = 0;
        this.bootedCount = 0;

        this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'asda'));

        this.scoreHud = new ScoreHud(this);

        this.showNarration();
    }

    // Story-context panel that sets up the trip before the shopping list
    // appears, matching the way EpisodeTitle briefs the player on the rules.
    private showNarration (): void
    {
        const panel = new InfoPanel(this, {
            y: CENTER_Y,
            width: 880,
            title: NARRATION_TITLE,
            body: NARRATION_BODY,
            dismissLabel: "LET'S GO!",
            audioKey: 'scene2-narration',
            onDismiss: () => this.startSet()
        });

        panel.show();
    }

    private startSet (): void
    {
        this.selectedKeys = new Set();
        this.panels.clear();
        this.locked = false;
        this.setPoints = 0;

        this.buildChoices();
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    private buildChoices (): void
    {
        const items = snackSets[this.setIndex].items;
        const cols = Math.min(CHOICE_COLS, items.length);
        const spacingX = (CHOICE_AREA_RIGHT - CHOICE_AREA_LEFT) / cols;
        const startX = CHOICE_AREA_LEFT + spacingX / 2;

        items.forEach((item, index) => {

            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * spacingX;
            const y = CHOICE_START_Y + row * CHOICE_SPACING_Y;

            const panel = this.buildChoicePanel(item, x, y);

            panel.setAlpha(0);
            panel.setScale(0.5);

            this.tweens.add({
                targets: panel,
                alpha: 1,
                scale: 1,
                duration: 380,
                delay: index * CHOICE_STAGGER,
                ease: 'Back.Out'
            });
        });
    }

    private buildChoicePanel (item: SnackItem, x: number, y: number): GameObjects.Container
    {
        const panel = this.add.container(x, y);

        const source = this.textures.get(item.texture).getSourceImage();
        const iconScale = Math.min(PANEL_SIZE / source.width, PANEL_SIZE / source.height);

        const icon = this.add.image(0, 0, item.texture)
            .setOrigin(0.5)
            .setScale(iconScale);

        panel.add(icon);

        const hitZone = this.add.zone(0, 0, PANEL_SIZE, PANEL_SIZE)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        panel.add(hitZone);

        hitZone.on('pointerover', () => {
            if (!this.locked && !this.selectedKeys.has(item.key))
            {
                this.tweens.add({ targets: panel, scale: 1.1, duration: 120 });
            }
        });

        hitZone.on('pointerout', () => {
            if (!this.locked && !this.selectedKeys.has(item.key))
            {
                this.tweens.add({ targets: panel, scale: 1, duration: 120 });
            }
        });

        hitZone.on('pointerdown', () => this.pickItem(item, panel));

        this.panels.set(item.key, panel);

        return panel;
    }

    // Picking an item locks it in immediately (there's no un-picking a
    // packed snack) and flies it straight into the boot. Once two picks are
    // made for this set, the rest of the shelf falls away and the next set
    // of six appears.
    private pickItem (item: SnackItem, panel: GameObjects.Container): void
    {
        if (this.locked || this.selectedKeys.has(item.key) || this.selectedKeys.size >= MAX_PICKS_PER_SET)
        {
            return;
        }

        if (this.cache.audio.exists('select'))
        {
            this.sound.play('select');
        }

        this.selectedKeys.add(item.key);

        addScore(this, item.points);
        this.setPoints += item.points;

        this.totalPicks++;

        if (this.totalPicks === 3 && this.cache.audio.exists('leave-the-gun-take-the-cannoli'))
        {
            this.sound.play('leave-the-gun-take-the-cannoli');
        }

        this.flyToBoot(panel);

        if (this.selectedKeys.size >= MAX_PICKS_PER_SET)
        {
            this.locked = true;

            const anchor = this.scoreHud.getToastAnchor();
            showScoreToast(this, this.setPoints, { x: anchor.x, y: anchor.y });

            this.clearRemainingChoices(item.key);
        }
    }

    // Sends a picked panel shrinking and arcing down into the next free
    // slot in the boot, then swaps it for a small static icon once it lands.
    private flyToBoot (panel: GameObjects.Container): void
    {
        const slot = this.bootedCount;
        this.bootedCount++;

        const col = slot % BOOT_COLS;
        const row = Math.floor(slot / BOOT_COLS);
        const targetX = BOOT_X_MIN + (col + 0.5) * BOOT_CELL_W;
        const targetY = BOOT_Y_MIN + (row + 0.5) * BOOT_CELL_H;
        const texture = (panel.list.find((child) => child instanceof GameObjects.Image) as GameObjects.Image | undefined)?.texture.key;

        this.tweens.add({
            targets: panel,
            x: targetX,
            y: targetY,
            scale: 0.4,
            duration: 550,
            ease: 'Cubic.easeIn',
            onComplete: () => {

                panel.destroy();

                if (texture)
                {
                    const source = this.textures.get(texture).getSourceImage();
                    const iconScale = Math.min(
                        (BOOT_CELL_W - BOOT_ICON_PAD) / source.width,
                        (BOOT_CELL_H - BOOT_ICON_PAD) / source.height
                    );

                    this.add.image(targetX, targetY, texture).setScale(iconScale);
                }
            }
        });
    }

    // The two shelf panels that weren't picked topple off screen so the
    // shelf reads as cleared before the next set of six slides in.
    private clearRemainingChoices (pickedKey: string): void
    {
        const leftover: GameObjects.Container[] = [];

        this.panels.forEach((panel, key) => {

            if (key !== pickedKey && !this.selectedKeys.has(key))
            {
                leftover.push(panel);
            }
        });

        leftover.forEach((panel, index) => {

            this.tweens.add({
                targets: panel,
                y: panel.y + 500,
                angle: index % 2 === 0 ? -35 : 35,
                alpha: 0,
                duration: 450,
                delay: index * 40,
                ease: 'Cubic.easeIn'
            });
        });

        this.time.delayedCall(600, () => {

            leftover.forEach((panel) => panel.destroy());
            this.panels.clear();

            this.advance();
        });
    }

    private advance (): void
    {
        const hasNextSet = this.setIndex < snackSets.length - 1;

        if (hasNextSet)
        {
            this.setIndex++;
            this.startSet();
        }
        else
        {
            this.showContinue();
        }
    }

    private showContinue (): void
    {
        new Button(this, {
            x: CENTER_X,
            y: 660,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Scene3')
        });
    }
}
