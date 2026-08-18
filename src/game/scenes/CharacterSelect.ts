import { Scene, GameObjects, Geom } from 'phaser';
import { setPlayer } from '../systems/GameState';

interface PlayerOption
{
    key: string;
    name: string;
    texture: string;
}

const PLAYERS: PlayerOption[] = [
    { key: 'michael', name: 'Michael', texture: 'char-michael' },
    { key: 'ben', name: 'Ben', texture: 'char-ben' },
    { key: 'dominic', name: 'Dominic', texture: 'char-dominic' },
    { key: 'mum', name: 'Mum', texture: 'char-mum' },
    { key: 'dad', name: 'Dad', texture: 'char-dad' }
];

const CARD_SIZE = 160;
const GLOW_SIZE = CARD_SIZE * 2;

interface PortraitPair
{
    grey: GameObjects.Image;
    color: GameObjects.Image;
}

export class CharacterSelect extends Scene
{
    selectedKey: string | null = null;
    glows: Map<string, GameObjects.Image> = new Map();
    portraits: Map<string, PortraitPair> = new Map();
    confirmButton: GameObjects.Container;
    confirmLabel: GameObjects.Text;

    constructor ()
    {
        super('CharacterSelect');
    }

    create ()
    {
        // Radial gradient glow used behind the (transparent) portraits, since an
        // outline box looks wrong against a PNG's cutout silhouette.
        if (!this.textures.exists('char-glow'))
        {
            const canvasTexture = this.textures.createCanvas('char-glow', GLOW_SIZE, GLOW_SIZE);

            if (canvasTexture)
            {
                const ctx = canvasTexture.getContext();
                const gradient = ctx.createRadialGradient(
                    GLOW_SIZE / 2, GLOW_SIZE / 2, 0,
                    GLOW_SIZE / 2, GLOW_SIZE / 2, GLOW_SIZE / 2
                );
                gradient.addColorStop(0, 'rgba(255, 215, 110, 0.9)');
                gradient.addColorStop(0.6, 'rgba(255, 215, 110, 0.35)');
                gradient.addColorStop(1, 'rgba(255, 215, 110, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE);
                canvasTexture.refresh();
            }
        }

        const bg = this.add.image(512, 384, 'garden');
        bg.setScale(Math.max(1024 / bg.width, 768 / bg.height));

        const ROWS: string[][] = [
            ['mum', 'dad'],
            ['ben', 'michael', 'dominic']
        ];

        // Small per-character nudges so the grid doesn't look too rigid.
        const OFFSETS: Record<string, { x: number, y: number }> = {
            mum: { x: -25, y: -25 },
            dad: { x: 25, y: -25 },
            ben: { x: -30, y: 0 },
            dominic: { x: 30, y: 0 }
        };

        const positions = new Map<string, { x: number, y: number }>();

        ROWS.forEach((row, rowIndex) => {

            const rowStartX = 512 - ((row.length - 1) * 200) / 2;
            const y = 160 + rowIndex * 180;

            row.forEach((key, colIndex) => {
                const offset = OFFSETS[key] ?? { x: 0, y: 0 };
                positions.set(key, { x: rowStartX + colIndex * 200 + offset.x, y: y + offset.y });
            });
        });

        PLAYERS.forEach((player) => {

            const { x, y } = positions.get(player.key)!;

            const glow = this.add.image(x, y, 'char-glow')
                .setOrigin(0.5)
                .setAlpha(0);

            this.glows.set(player.key, glow);

            // Fit each portrait inside the card without stretching, so images
            // of different native resolutions/aspect ratios all read as the same size.
            const source = this.textures.get(player.texture).getSourceImage();
            const baseScale = Math.min(CARD_SIZE / source.width, CARD_SIZE / source.height);

            const greyKey = this.ensureGreyTexture(player.texture);

            // Colour portrait sits beneath the grey one, revealed via alpha crossfade on selection.
            const colorPortrait = this.add.image(x, y, player.texture)
                .setOrigin(0.5)
                .setScale(baseScale)
                .setAlpha(0);

            const greyPortrait = this.add.image(x, y, greyKey)
                .setOrigin(0.5)
                .setScale(baseScale);

            this.portraits.set(player.key, { grey: greyPortrait, color: colorPortrait });

            this.add.text(x, y + CARD_SIZE / 2 + 24, player.name.toUpperCase(), {
                fontFamily: '"Special Elite", Georgia, serif',
                fontStyle: 'bold',
                fontSize: 22,
                color: '#e4d4b0',
                stroke: '#1a0f08',
                strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5);

            // Fixed-size hit area, independent of the portraits' hover scale tween, so
            // growing the image under the cursor can't itself trigger over/out flicker.
            const hitZone = this.add.zone(x, y, CARD_SIZE, CARD_SIZE)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            hitZone.on('pointerover', () => {
                this.tweens.add({ targets: colorPortrait, alpha: 1, duration: 120 });
                this.tweens.add({ targets: greyPortrait, alpha: 0, duration: 120 });

                if (this.selectedKey !== player.key)
                {
                    this.tweens.add({ targets: [greyPortrait, colorPortrait], scaleX: baseScale * 1.05, scaleY: baseScale * 1.05, duration: 120 });
                    this.tweens.add({ targets: glow, alpha: 0.5, duration: 120 });
                }
            });

            hitZone.on('pointerout', () => {
                if (this.selectedKey !== player.key)
                {
                    this.tweens.add({ targets: colorPortrait, alpha: 0, duration: 120 });
                    this.tweens.add({ targets: greyPortrait, alpha: 1, duration: 120 });
                    this.tweens.add({ targets: [greyPortrait, colorPortrait], scaleX: baseScale, scaleY: baseScale, duration: 120 });
                    this.tweens.add({ targets: glow, alpha: 0, duration: 120 });
                }
            });

            hitZone.on('pointerdown', () => {
                this.selectPlayer(player.key);
            });
        });

        // Age of Empires-style button: a carved stone/wood panel with a chunky
        // bevelled frame (parchment-lit top-left, shadowed bottom-right) and
        // engraved lettering.
        const BTN_W = 260;
        const BTN_H = 70;
        const FRAME = 6;
        const RADIUS = 10;
        const RADIUS_INNER = 6;

        const stoneKey = this.ensureStoneTexture('confirm-stone', BTN_W - FRAME * 2, BTN_H - FRAME * 2, RADIUS_INNER);

        // Two rounded rects sharing the same top-left origin: the dark one is
        // full-size so it only peeks out along the right/bottom edges, the
        // lighter one is shrunk by FRAME so it only shows along top/left —
        // giving a proper raised bevel instead of centre-anchored strips.
        const bevel = this.add.graphics();
        bevel.fillStyle(0x1a0f08, 1);
        bevel.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, RADIUS);
        bevel.fillStyle(0xc9a76a, 1);
        bevel.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W - FRAME, BTN_H - FRAME, RADIUS);

        const face = this.add.image(0, 0, stoneKey);

        this.confirmLabel = this.add.text(0, 0, 'CONFIRM', {
            fontFamily: '"Special Elite", Georgia, serif',
            fontStyle: 'bold',
            fontSize: 26,
            color: '#e8d3a0',
            stroke: '#1a0f08',
            strokeThickness: 4,
            letterSpacing: 3
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 0, true, true);

        this.confirmButton = this.add.container(512, 690, [
            bevel, face, this.confirmLabel
        ]);

        this.confirmButton.setInteractive(
            new Geom.Rectangle(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H),
            Geom.Rectangle.Contains
        );
        this.confirmButton.input!.cursor = 'pointer';
        this.confirmButton.setScale(0);
        this.confirmButton.setVisible(false);

        this.confirmButton.on('pointerover', () => {
            this.tweens.add({ targets: this.confirmButton, scale: 1.05, duration: 100 });
            face.setTint(0xffdca0);
            this.confirmLabel.setColor('#fff0c8');
        });

        this.confirmButton.on('pointerout', () => {
            this.tweens.add({ targets: this.confirmButton, scale: 1, duration: 100 });
            face.clearTint();
            this.confirmLabel.setColor('#e8d3a0');
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

    // Procedural speckled stone/parchment fill for the confirm button, in
    // place of a hand-painted texture asset.
    private ensureStoneTexture (key: string, width: number, height: number, radius: number): string
    {
        if (this.textures.exists(key))
        {
            return key;
        }

        const canvasTexture = this.textures.createCanvas(key, width, height);

        if (!canvasTexture)
        {
            return key;
        }

        const ctx = canvasTexture.getContext();

        // Clip to a rounded rect so the noise fill picks up the same corner
        // radius as the bevel frame it sits inside.
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.arcTo(width, 0, width, height, radius);
        ctx.arcTo(width, height, 0, height, radius);
        ctx.arcTo(0, height, 0, 0, radius);
        ctx.arcTo(0, 0, width, 0, radius);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = '#8a6f4e';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < (width * height) / 3; i++)
        {
            const shade = 100 + Math.floor(Math.random() * 90);
            ctx.fillStyle = `rgba(${shade}, ${Math.floor(shade * 0.82)}, ${Math.floor(shade * 0.58)}, 0.5)`;
            ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        }

        canvasTexture.refresh();

        return key;
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

        this.glows.forEach((glow, playerKey) => {

            const isSelected = playerKey === key;

            this.tweens.killTweensOf(glow);
            glow.setScale(1);

            if (isSelected)
            {
                this.tweens.add({ targets: glow, alpha: 1, duration: 150 });
                this.tweens.add({
                    targets: glow,
                    scale: 1.1,
                    duration: 150,
                    yoyo: true
                });
            }
            else
            {
                this.tweens.add({ targets: glow, alpha: 0, duration: 150 });
            }
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
