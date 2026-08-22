import { Scene, GameObjects, Geom } from 'phaser';

export interface ToggleTileConfig
{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label: string;
    fontSize?: number;
    onClick?: () => void;
}

const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';
const CORNER_RADIUS = 12;
const COLOR_RED = 0xd9281f;
const COLOR_RED_HOVER = 0xe8493f;
const COLOR_SELECTED_BORDER = 0xffd76e;
const COLOR_BORDER = 0xffffff;
const BORDER_WIDTH = 3;
const BORDER_WIDTH_SELECTED = 6;

// Same red flag look as Button, but toggles a persistent "picked" gold
// border instead of firing once - used for multi-select answer grids where
// picks are provisional until a separate CONFIRM button locks them in.
export class ToggleTile extends GameObjects.Container
{
    private config: ToggleTileConfig;
    private face: GameObjects.Graphics;
    private tileWidth: number;
    private tileHeight: number;
    private selected: boolean = false;

    constructor (scene: Scene, config: ToggleTileConfig)
    {
        super(scene, config.x ?? 0, config.y ?? 0);

        this.config = config;
        this.tileWidth = config.width ?? 200;
        this.tileHeight = config.height ?? 80;

        this.build();

        scene.add.existing(this);
    }

    setSelected (selected: boolean): this
    {
        this.selected = selected;

        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.add({ targets: this, scale: selected ? 1.06 : 1, duration: 120, ease: 'Back.Out' });
        this.drawFace();

        return this;
    }

    setEnabled (enabled: boolean): this
    {
        this.scene.tweens.killTweensOf(this);

        if (enabled)
        {
            this.setInteractive();
        }
        else
        {
            this.disableInteractive();
            this.scene.tweens.add({ targets: this, scale: this.selected ? 1.06 : 1, duration: 100 });
        }

        this.scene.tweens.add({ targets: this, alpha: enabled ? 1 : 0.4, duration: 150 });

        return this;
    }

    private drawFace (): void
    {
        const borderColor = this.selected ? COLOR_SELECTED_BORDER : COLOR_BORDER;
        const borderWidth = this.selected ? BORDER_WIDTH_SELECTED : BORDER_WIDTH;

        this.face.clear();
        this.face.fillStyle(COLOR_RED, 1);
        this.face.fillRoundedRect(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight, CORNER_RADIUS);
        this.face.lineStyle(borderWidth, borderColor, 1);
        this.face.strokeRoundedRect(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight, CORNER_RADIUS);
    }

    private build (): void
    {
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x1a1a5e, 1);
        shadow.fillRoundedRect(-this.tileWidth / 2 - 6, -this.tileHeight / 2 + 8, this.tileWidth, this.tileHeight, CORNER_RADIUS);

        this.face = this.scene.add.graphics();
        this.drawFace();

        const label = this.scene.add.text(0, 0, this.config.label, {
            fontFamily: TITLE_FONT,
            fontStyle: 'italic',
            fontSize: this.config.fontSize ?? 22,
            color: '#ffffff',
            stroke: '#7a1810',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: this.tileWidth - 20 },
            padding: { x: 4, y: 4 }
        }).setOrigin(0.5);

        this.add([ shadow, this.face, label ]);

        this.setInteractive(
            new Geom.Rectangle(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight),
            Geom.Rectangle.Contains
        );
        this.input!.cursor = 'pointer';

        this.on('pointerover', () => {
            if (this.selected) return;
            this.scene.tweens.add({ targets: this, scale: 1.05, duration: 100 });
            this.face.clear();
            this.face.fillStyle(COLOR_RED_HOVER, 1);
            this.face.fillRoundedRect(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight, CORNER_RADIUS);
            this.face.lineStyle(BORDER_WIDTH, COLOR_BORDER, 1);
            this.face.strokeRoundedRect(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight, CORNER_RADIUS);
        });

        this.on('pointerout', () => {
            if (this.selected) return;
            this.scene.tweens.add({ targets: this, scale: 1, duration: 100 });
            this.drawFace();
        });

        this.on('pointerdown', () => {

            this.scene.tweens.add({ targets: this, scale: (this.selected ? 1.06 : 1) - 0.05, duration: 60, yoyo: true });

            if (this.scene.cache.audio.exists('select'))
            {
                this.scene.sound.play('select');
            }

            this.config.onClick?.();
        });
    }
}
