import { Scene, GameObjects } from 'phaser';
import { setPlayer } from '../systems/GameState';
import { Button } from '../ui/Button';

interface PlayerOption
{
    key: string;
    name: string;
    texture: string;
    color: number;
    angle: number;
}

const PLAYERS: PlayerOption[] = [
    { key: 'michael', name: 'Michael', texture: 'char-michael', color: 0xf6c945, angle: 2 },
    { key: 'ben', name: 'Ben', texture: 'char-ben', color: 0x2f6fe0, angle: -3 },
    { key: 'dominic', name: 'Dominic', texture: 'char-dominic', color: 0xf2914a, angle: 4 },
    { key: 'mum', name: 'Mum', texture: 'char-mum', color: 0xff5fa8, angle: -4 },
    { key: 'dad', name: 'Dad', texture: 'char-dad', color: 0xe8402c, angle: 3 }
];

const PANEL_SIZE = 170;
const GLOW_SIZE = PANEL_SIZE * 2;

const PAGE_W = 860;
const PAGE_H = 600;
const PAGE_ROTATION = -1.2;
const PAGE_Y = 345;
const CONFIRM_Y = 670;
const GRID_COL_SPACING = 215;
const GRID_ROW_Y = [ -103, 127 ];

interface PortraitPair
{
    grey: GameObjects.Image;
    color: GameObjects.Image;
}

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

export class CharacterSelect extends Scene
{
    selectedKey: string | null = null;
    glows: Map<string, GameObjects.Image> = new Map();
    panels: Map<string, GameObjects.Container> = new Map();
    portraits: Map<string, PortraitPair> = new Map();
    frameDrawers: Map<string, (borderColor: number, borderWidth: number) => void> = new Map();
    confirmButton: Button;
    pageContainer: GameObjects.Container;
    dimmer: GameObjects.Rectangle;

    constructor ()
    {
        super('CharacterSelect');
    }

    create ()
    {
        this.ensureGlowTexture();

        this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'background-cartoon'));

        // A soft scrim behind the bubble so the panel reads as a modal
        // floating over the cartoon world, rather than another flat layer.
        this.dimmer = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x081420, 0)
            .setOrigin(0.5);

        this.pageContainer = this.add.container(CENTER_X, PAGE_Y);
        this.pageContainer.setAngle(PAGE_ROTATION);

        this.buildPage();
        this.buildTitle();
        this.buildGrid();
        this.buildConfirmButton();

        this.playBubbleIntro();
    }

    // The cartoon background differs in resolution/aspect ratio from the
    // canvas, so scale it to cover edge-to-edge rather than letterboxing.
    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    // Pops the comic page in like a speech bubble surfacing over the
    // background, with the scrim fading in behind it to sell the "modal"
    // feel rather than the page simply being another static layer.
    private playBubbleIntro (): void
    {
        this.pageContainer.setScale(0.4);
        this.pageContainer.setAlpha(0);

        this.tweens.add({
            targets: this.dimmer,
            fillAlpha: 0.4,
            duration: 260
        });

        this.tweens.add({
            targets: this.pageContainer,
            scale: 1,
            alpha: 1,
            duration: 420,
            ease: 'Back.Out'
        });
    }

    // A soft radial glow used behind a selected character's panel — simpler
    // than a full comic burst, so it reads as a highlight rather than an effect.
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

    // The white torn-comic-page panel everything else sits on, complete with
    // a folded top-left corner and the blue masthead stripe from the source art.
    private buildPage (): void
    {
        const shadow = this.add.graphics();
        shadow.fillStyle(0x02121f, 0.45);
        shadow.fillRoundedRect(-PAGE_W / 2 + 10, -PAGE_H / 2 + 14, PAGE_W, PAGE_H, 18);

        const page = this.add.graphics();
        page.fillStyle(0xf3ecdd, 1);
        page.fillRoundedRect(-PAGE_W / 2, -PAGE_H / 2, PAGE_W, PAGE_H, 18);
        page.lineStyle(3, 0x1a0f08, 0.35);
        page.strokeRoundedRect(-PAGE_W / 2, -PAGE_H / 2, PAGE_W, PAGE_H, 18);

        // Folded corner flourish, top-left, like a dog-eared comic cover.
        const fold = this.add.graphics();
        const foldSize = 60;
        const foldX = -PAGE_W / 2;
        const foldY = -PAGE_H / 2;
        fold.fillStyle(0xf6c945, 1);
        fold.beginPath();
        fold.moveTo(foldX, foldY);
        fold.lineTo(foldX + foldSize, foldY);
        fold.lineTo(foldX, foldY + foldSize);
        fold.closePath();
        fold.fillPath();
        fold.lineStyle(2, 0x1a0f08, 0.4);
        fold.lineBetween(foldX + 2, foldY + foldSize - 2, foldX + foldSize - 2, foldY + 2);

        const divider = this.add.graphics();
        divider.fillStyle(0x2f6fe0, 1);
        divider.fillRect(-PAGE_W / 2 + 40, -178, PAGE_W - 80, 12);
        divider.fillStyle(0x1a0f08, 0.25);
        divider.fillRect(-PAGE_W / 2 + 40, -166, PAGE_W - 80, 3);

        this.pageContainer.add([ shadow, page, divider, fold ]);
    }

    // Layered, mis-registered text (yellow behind blue behind red) mimics the
    // cheap four-colour print offset that gives ZZZAP!'s logo its punch.
    private buildTitle (): void
    {
        const style = {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 58,
            align: 'center' as const,
            padding: { x: 16, y: 16 }
        };

        const yellow = this.add.text(4, -236, 'CHOOSE YOUR HERO!', {
            ...style, color: '#f6c945'
        }).setOrigin(0.5).setAngle(-3);

        const blue = this.add.text(-2, -240, 'CHOOSE YOUR HERO!', {
            ...style, color: '#2f6fe0'
        }).setOrigin(0.5).setAngle(-3);

        const red = this.add.text(0, -238, 'CHOOSE YOUR HERO!', {
            ...style, color: '#e8402c', stroke: '#1a0f08', strokeThickness: 4
        }).setOrigin(0.5).setAngle(-3);

        this.pageContainer.add([ yellow, blue, red ]);
    }

    private buildGrid (): void
    {
        const ROWS: string[][] = [
            [ 'mum', 'dad' ],
            [ 'ben', 'michael', 'dominic' ]
        ];

        const positions = new Map<string, { x: number, y: number }>();

        ROWS.forEach((row, rowIndex) => {

            const rowStartX = -((row.length - 1) * GRID_COL_SPACING) / 2;

            row.forEach((key, colIndex) => {
                positions.set(key, { x: rowStartX + colIndex * GRID_COL_SPACING, y: GRID_ROW_Y[rowIndex] });
            });
        });

        PLAYERS.forEach((player) => {

            const { x, y } = positions.get(player.key)!;
            this.buildPanel(player, x, y);
        });
    }

    // Each character gets a colour-coded, slightly-rotated comic panel —
    // a stand-in for the hand-drawn strip thumbnails on the source cover.
    private buildPanel (player: PlayerOption, x: number, y: number): void
    {
        const panel = this.add.container(x, y);
        panel.setAngle(player.angle);
        this.pageContainer.add(panel);
        this.panels.set(player.key, panel);

        const glow = this.add.image(0, 0, 'char-glow')
            .setScale((PANEL_SIZE * 1.3) / GLOW_SIZE)
            .setAlpha(0);
        this.glows.set(player.key, glow);

        const shadow = this.add.graphics();
        shadow.fillStyle(0x1a0f08, 0.4);
        shadow.fillRoundedRect(-PANEL_SIZE / 2 + 6, -PANEL_SIZE / 2 + 8, PANEL_SIZE, PANEL_SIZE, 14);

        const frame = this.add.graphics();

        const drawFrame = (borderColor: number, borderWidth: number) => {
            frame.clear();
            frame.fillStyle(player.color, 1);
            frame.fillRoundedRect(-PANEL_SIZE / 2, -PANEL_SIZE / 2, PANEL_SIZE, PANEL_SIZE, 14);
            frame.lineStyle(borderWidth, borderColor, 1);
            frame.strokeRoundedRect(-PANEL_SIZE / 2, -PANEL_SIZE / 2, PANEL_SIZE, PANEL_SIZE, 14);
            frame.lineStyle(2, 0x1a0f08, 0.5);
            frame.strokeRoundedRect(-PANEL_SIZE / 2 - 3, -PANEL_SIZE / 2 - 3, PANEL_SIZE + 6, PANEL_SIZE + 6, 16);
        };

        drawFrame(0xffffff, 5);
        this.frameDrawers.set(player.key, drawFrame);

        const source = this.textures.get(player.texture).getSourceImage();
        const pad = 26;
        const baseScale = Math.min((PANEL_SIZE - pad) / source.width, (PANEL_SIZE - pad) / source.height);

        const greyKey = this.ensureGreyTexture(player.texture);

        const colorPortrait = this.add.image(0, 0, player.texture)
            .setOrigin(0.5)
            .setScale(baseScale)
            .setAlpha(0);

        const greyPortrait = this.add.image(0, 0, greyKey)
            .setOrigin(0.5)
            .setScale(baseScale);

        this.portraits.set(player.key, { grey: greyPortrait, color: colorPortrait });

        const label = this.add.text(0, PANEL_SIZE / 2 + 22, player.name.toUpperCase(), {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 26,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);

        panel.add([ shadow, glow, frame, greyPortrait, colorPortrait, label ]);

        const hitZone = this.add.zone(0, 0, PANEL_SIZE, PANEL_SIZE)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        panel.add(hitZone);

        hitZone.on('pointerover', () => {

            this.pageContainer.bringToTop(panel);

            this.tweens.add({ targets: colorPortrait, alpha: 1, duration: 120 });
            this.tweens.add({ targets: greyPortrait, alpha: 0, duration: 120 });

            if (this.selectedKey !== player.key)
            {
                this.tweens.add({ targets: panel, scale: 1.08, duration: 120 });
            }
        });

        hitZone.on('pointerout', () => {

            if (this.selectedKey !== player.key)
            {
                this.tweens.add({ targets: colorPortrait, alpha: 0, duration: 120 });
                this.tweens.add({ targets: greyPortrait, alpha: 1, duration: 120 });
                this.tweens.add({ targets: panel, scale: 1, duration: 120 });
            }
        });

        hitZone.on('pointerdown', () => {
            this.selectPlayer(player.key);
        });
    }

    // Shared flag-style button, same look used for every primary action
    // across scenes.
    private buildConfirmButton (): void
    {
        this.confirmButton = new Button(this, {
            x: CENTER_X,
            y: CONFIRM_Y,
            label: 'CONFIRM!',
            onClick: () => {

                if (!this.selectedKey)
                {
                    return;
                }

                const player = PLAYERS.find((p) => p.key === this.selectedKey);

                if (player)
                {
                    setPlayer(this, player);
                }

                this.scene.start('EpisodeTitle');
            }
        });

        this.confirmButton.setScale(0);
        this.confirmButton.setVisible(false);
    }

    private ensureGreyTexture (sourceKey: string): string
    {
        const greyKey = `${sourceKey}-grey`;

        if (this.textures.exists(greyKey))
        {
            return greyKey;
        }

        const source = this.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
        const canvasTexture = this.textures.createCanvas(greyKey, source.width, source.height);

        if (!canvasTexture)
        {
            return sourceKey;
        }

        const ctx = canvasTexture.getContext();
        ctx.drawImage(source, 0, 0, source.width, source.height);

        const imageData = ctx.getImageData(0, 0, source.width, source.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4)
        {
            const luminance = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = luminance;
            data[i + 1] = luminance;
            data[i + 2] = luminance;
        }

        ctx.putImageData(imageData, 0, 0);
        canvasTexture.refresh();

        return greyKey;
    }

    private selectPlayer (key: string)
    {
        this.sound.play('select');

        this.selectedKey = key;

        this.portraits.forEach((portrait, playerKey) => {

            const isSelected = playerKey === key;

            this.tweens.killTweensOf(portrait.color);
            this.tweens.killTweensOf(portrait.grey);
            this.tweens.add({ targets: portrait.color, alpha: isSelected ? 1 : 0, duration: 200 });
            this.tweens.add({ targets: portrait.grey, alpha: isSelected ? 0 : 1, duration: 200 });
        });

        this.panels.forEach((panel, playerKey) => {

            const isSelected = playerKey === key;

            if (isSelected)
            {
                this.pageContainer.bringToTop(panel);
            }

            this.tweens.killTweensOf(panel);
            this.tweens.add({ targets: panel, scale: isSelected ? 1.1 : 1, duration: 180, ease: 'Back.Out' });
        });

        this.glows.forEach((glow, playerKey) => {

            const isSelected = playerKey === key;

            this.tweens.killTweensOf(glow);
            this.tweens.add({ targets: glow, alpha: isSelected ? 0.9 : 0, duration: 150 });
        });

        this.frameDrawers.forEach((drawFrame, playerKey) => {
            drawFrame(playerKey === key ? 0xffd76e : 0xffffff, playerKey === key ? 6 : 5);
        });

        this.showConfirmButton();
    }

    private showConfirmButton ()
    {
        if (this.confirmButton.visible)
        {
            return;
        }

        this.confirmButton.setVisible(true);

        this.tweens.add({
            targets: this.confirmButton,
            scale: 1,
            duration: 220,
            ease: 'Back.Out'
        });
    }
}
