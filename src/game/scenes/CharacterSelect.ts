import { Scene, GameObjects, Geom, Math as PhaserMath } from 'phaser';
import { setPlayer } from '../systems/GameState';

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

const PAGE_W = 780;
const PAGE_H = 640;
const PAGE_ROTATION = -1.2;
const PAGE_Y = 372;
const CONFIRM_Y = 678;

interface PortraitPair
{
    grey: GameObjects.Image;
    color: GameObjects.Image;
}

export class CharacterSelect extends Scene
{
    selectedKey: string | null = null;
    glows: Map<string, GameObjects.Image> = new Map();
    panels: Map<string, GameObjects.Container> = new Map();
    portraits: Map<string, PortraitPair> = new Map();
    frameDrawers: Map<string, (borderColor: number, borderWidth: number) => void> = new Map();
    confirmButton: GameObjects.Container;
    confirmLabel: GameObjects.Text;
    pageContainer: GameObjects.Container;

    constructor ()
    {
        super('CharacterSelect');
    }

    create ()
    {
        this.ensureComicBackground();
        this.ensureGlowTexture();

        this.add.image(512, 384, 'comic-bg');

        this.pageContainer = this.add.container(512, PAGE_Y);
        this.pageContainer.setAngle(PAGE_ROTATION);

        this.buildPage();
        this.buildTitle();
        this.buildGrid();
        this.buildConfirmButton();
    }

    // A speckled cyan/teal "comic cover sky" backdrop, procedurally generated
    // rather than a painted asset, so it always fills the canvas exactly.
    private ensureComicBackground (): void
    {
        if (this.textures.exists('comic-bg'))
        {
            return;
        }

        const w = 1024;
        const h = 768;
        const canvasTexture = this.textures.createCanvas('comic-bg', w, h);

        if (!canvasTexture)
        {
            return;
        }

        const ctx = canvasTexture.getContext();

        const base = ctx.createLinearGradient(0, 0, w, h);
        base.addColorStop(0, '#0f8fa8');
        base.addColorStop(0.5, '#0f6f96');
        base.addColorStop(1, '#123a6b');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);

        const blobs: Array<{ x: number, y: number, r: number, color: string, alpha: number }> = [
            { x: 180, y: 140, r: 260, color: '#3fd7d1', alpha: 0.35 },
            { x: 820, y: 620, r: 320, color: '#1f4fa0', alpha: 0.45 },
            { x: 860, y: 160, r: 220, color: '#7a3fbf', alpha: 0.25 },
            { x: 150, y: 640, r: 260, color: '#0a2a55', alpha: 0.4 },
            { x: 512, y: 384, r: 380, color: '#2fd0d8', alpha: 0.12 }
        ];

        blobs.forEach((blob) => {
            const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
            gradient.addColorStop(0, blob.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = blob.alpha;
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        });

        ctx.globalAlpha = 1;
        canvasTexture.refresh();
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
        divider.fillRect(-PAGE_W / 2 + 40, -190, PAGE_W - 80, 12);
        divider.fillStyle(0x1a0f08, 0.25);
        divider.fillRect(-PAGE_W / 2 + 40, -178, PAGE_W - 80, 3);

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

        const yellow = this.add.text(4, -252, 'CHOOSE YOUR HERO!', {
            ...style, color: '#f6c945'
        }).setOrigin(0.5).setAngle(-3);

        const blue = this.add.text(-2, -256, 'CHOOSE YOUR HERO!', {
            ...style, color: '#2f6fe0'
        }).setOrigin(0.5).setAngle(-3);

        const red = this.add.text(0, -254, 'CHOOSE YOUR HERO!', {
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

        const ROW_Y = [ -110, 135 ];
        const positions = new Map<string, { x: number, y: number }>();

        ROWS.forEach((row, rowIndex) => {

            const rowStartX = -((row.length - 1) * 200) / 2;

            row.forEach((key, colIndex) => {
                positions.set(key, { x: rowStartX + colIndex * 200, y: ROW_Y[rowIndex] });
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

    // A tilted red/navy "flag" banner, styled after the classic Barr soft
    // drinks logo, in place of the old carved-stone panel.
    private buildConfirmButton (): void
    {
        // Same slanted quad drawn twice: navy peeking out bottom-left as a
        // drop shadow, red on top — the layered-card look of the source logo.
        const flagPoints = [ -96, -22, 88, -36, 100, 24, -80, 36 ];

        const toPoints = (offsetX: number, offsetY: number): PhaserMath.Vector2[] => {

            const points: PhaserMath.Vector2[] = [];

            for (let i = 0; i < flagPoints.length; i += 2)
            {
                points.push(new PhaserMath.Vector2(flagPoints[i] + offsetX, flagPoints[i + 1] + offsetY));
            }

            return points;
        };

        const navy = this.add.graphics();
        navy.fillStyle(0x1a1a5e, 1);
        navy.fillPoints(toPoints(-11, 15), true);

        const red = this.add.graphics();

        const drawRed = (color: number) => {
            red.clear();
            red.fillStyle(color, 1);
            red.fillPoints(toPoints(0, 0), true);
            red.lineStyle(3, 0xffffff, 0.85);
            red.strokePoints(toPoints(0, 0), true);
        };

        drawRed(0xd9281f);

        const shadowLabel = this.add.text(3, 1, 'CONFIRM!', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontStyle: 'italic',
            fontSize: 28,
            color: '#7a1810',
            padding: { x: 8, y: 8 }
        }).setOrigin(0.5).setAngle(-6);

        this.confirmLabel = this.add.text(0, -2, 'CONFIRM!', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontStyle: 'italic',
            fontSize: 28,
            color: '#ffffff',
            padding: { x: 8, y: 8 }
        }).setOrigin(0.5).setAngle(-6);

        this.confirmButton = this.add.container(512, CONFIRM_Y, [ navy, red, shadowLabel, this.confirmLabel ]);

        this.confirmButton.setInteractive(
            new Geom.Rectangle(-92, -38, 184, 76),
            Geom.Rectangle.Contains
        );
        this.confirmButton.input!.cursor = 'pointer';
        this.confirmButton.setScale(0);
        this.confirmButton.setVisible(false);

        this.confirmButton.on('pointerover', () => {
            this.tweens.add({ targets: this.confirmButton, scale: 1.08, duration: 100 });
            drawRed(0xe8493f);
        });

        this.confirmButton.on('pointerout', () => {
            this.tweens.add({ targets: this.confirmButton, scale: 1, duration: 100 });
            drawRed(0xd9281f);
        });

        this.confirmButton.on('pointerdown', () => {

            if (!this.selectedKey)
            {
                return;
            }

            this.tweens.add({ targets: this.confirmButton, scale: 0.95, duration: 60, yoyo: true });

            const player = PLAYERS.find((p) => p.key === this.selectedKey);

            if (player)
            {
                setPlayer(this, player);
            }

            this.scene.start('Game');
        });
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
