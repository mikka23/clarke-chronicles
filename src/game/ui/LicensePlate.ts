import { Scene, GameObjects, Geom } from 'phaser';

export interface LicensePlateConfig
{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text: string;
    onClick?: () => void;
}

const PLATE_FONT = '"Arial Black", Arial, sans-serif';
const CORNER_RADIUS = 8;
const COLOR_YELLOW = 0xf5d90a;
const COLOR_YELLOW_HOVER = 0xffe94d;
const COLOR_BLACK = 0x1a1a1a;
const COLOR_SELECTED_BORDER = 0x1a1a5e;
const BORDER_WIDTH = 4;
const BORDER_WIDTH_SELECTED = 7;

// UK-style number plate button - yellow face, black border/text - used for
// the "find the car" round where the player picks plates out of a lineup
// instead of the usual red flag Button. Supports a toggled "selected" look
// (navy border) that survives hover, since picks here aren't final until
// confirmed.
export class LicensePlate extends GameObjects.Container
{
    private config: LicensePlateConfig;
    private face: GameObjects.Graphics;
    private plateWidth: number;
    private plateHeight: number;
    private selected: boolean = false;

    constructor (scene: Scene, config: LicensePlateConfig)
    {
        super(scene, config.x ?? 0, config.y ?? 0);

        this.config = config;
        this.plateWidth = config.width ?? 220;
        this.plateHeight = config.height ?? 70;

        this.build();

        scene.add.existing(this);
    }

    // Toggles the persistent "picked, awaiting confirm" look. Unlike hover,
    // this stays put once the pointer moves away.
    setSelected (selected: boolean): this
    {
        this.selected = selected;

        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.add({ targets: this, scale: selected ? 1.06 : 1, duration: 120 });
        this.drawFace(COLOR_YELLOW);

        return this;
    }

    // Disables interaction and dims the plate, e.g. once the round has
    // locked in and the remaining plates are no longer pickable.
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
            this.drawFace(COLOR_YELLOW);
        }

        this.scene.tweens.add({ targets: this, alpha: enabled ? 1 : 0.4, duration: 150 });

        return this;
    }

    private drawFace (fillColor: number): void
    {
        const borderColor = this.selected ? COLOR_SELECTED_BORDER : COLOR_BLACK;
        const borderWidth = this.selected ? BORDER_WIDTH_SELECTED : BORDER_WIDTH;

        this.face.clear();
        this.face.fillStyle(fillColor, 1);
        this.face.fillRoundedRect(-this.plateWidth / 2, -this.plateHeight / 2, this.plateWidth, this.plateHeight, CORNER_RADIUS);
        this.face.lineStyle(borderWidth, borderColor, 1);
        this.face.strokeRoundedRect(-this.plateWidth / 2, -this.plateHeight / 2, this.plateWidth, this.plateHeight, CORNER_RADIUS);
    }

    private build (): void
    {
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(COLOR_BLACK, 0.35);
        shadow.fillRoundedRect(-this.plateWidth / 2 - 4, -this.plateHeight / 2 + 6, this.plateWidth, this.plateHeight, CORNER_RADIUS);

        this.face = this.scene.add.graphics();
        this.drawFace(COLOR_YELLOW);

        const label = this.scene.add.text(0, 0, this.config.text, {
            fontFamily: PLATE_FONT,
            fontSize: 28,
            color: '#1a1a1a',
            padding: { x: 4, y: 4 }
        }).setOrigin(0.5);

        this.add([ shadow, this.face, label ]);

        this.setInteractive(
            new Geom.Rectangle(-this.plateWidth / 2, -this.plateHeight / 2, this.plateWidth, this.plateHeight),
            Geom.Rectangle.Contains
        );
        this.input!.cursor = 'pointer';

        this.on('pointerover', () => {
            if (this.selected) return;

            this.scene.tweens.add({ targets: this, scale: 1.08, duration: 100 });
            this.drawFace(COLOR_YELLOW_HOVER);
        });

        this.on('pointerout', () => {
            if (this.selected) return;

            this.scene.tweens.add({ targets: this, scale: 1, duration: 100 });
            this.drawFace(COLOR_YELLOW);
        });

        this.on('pointerdown', () => {

            this.scene.tweens.add({ targets: this, scale: (this.selected ? 1.06 : 1) - 0.05, duration: 60, yoyo: true });

            if (this.scene.cache.audio.exists('click'))
            {
                this.scene.sound.play('click');
            }

            this.config.onClick?.();
        });
    }
}
