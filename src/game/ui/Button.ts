import { Scene, GameObjects, Geom, Math as PhaserMath } from 'phaser';

export interface ButtonConfig
{
    x?: number;
    y?: number;
    label: string;
    width?: number;
    height?: number;
    fontSize?: number;
    angle?: number;
    // Key of the sfx to play on pointerdown. Guarded against a missing cache
    // entry, defaults to the shared UI click sound.
    clickSound?: string;
    onClick?: () => void;
}

const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';

// A tilted red/navy "flag" quad, styled after the classic Barr soft drinks
// logo. Drawn twice at native size and scaled per-instance so every button
// keeps the same silhouette regardless of its width/height.
const FLAG_POINTS = [ -96, -22, 88, -36, 100, 24, -80, 36 ];
const FLAG_W = 184;
const FLAG_H = 76;

const COLOR_RED = 0xd9281f;
const COLOR_RED_HOVER = 0xe8493f;
const COLOR_NAVY = 0x1a1a5e;

// Shared clickable "flag" button used for every primary action across
// scenes (CONFIRM!, SUBMIT!, GOT IT!, ...), so they all share one hover/press
// feel and one click sound instead of each scene re-implementing it.
export class Button extends GameObjects.Container
{
    private config: ButtonConfig;
    private face: GameObjects.Graphics;
    private hitWidth: number;
    private hitHeight: number;

    constructor (scene: Scene, config: ButtonConfig)
    {
        super(scene, config.x ?? 0, config.y ?? 0);

        this.config = config;
        this.hitWidth = config.width ?? FLAG_W;
        this.hitHeight = config.height ?? FLAG_H;

        this.build();

        scene.add.existing(this);
    }

    // Enables/disables interaction and fades the button to read as inactive,
    // e.g. a submit button before any choice has been made.
    setEnabled (enabled: boolean): this
    {
        if (enabled)
        {
            this.setInteractive();
        }
        else
        {
            this.disableInteractive();
        }

        this.scene.tweens.add({ targets: this, alpha: enabled ? 1 : 0.4, duration: 150 });

        return this;
    }

    private flagPoints (offsetX: number, offsetY: number): PhaserMath.Vector2[]
    {
        const scaleX = this.hitWidth / FLAG_W;
        const scaleY = this.hitHeight / FLAG_H;
        const points: PhaserMath.Vector2[] = [];

        for (let i = 0; i < FLAG_POINTS.length; i += 2)
        {
            points.push(new PhaserMath.Vector2(
                FLAG_POINTS[i] * scaleX + offsetX,
                FLAG_POINTS[i + 1] * scaleY + offsetY
            ));
        }

        return points;
    }

    private drawFace (color: number): void
    {
        this.face.clear();
        this.face.fillStyle(color, 1);
        this.face.fillPoints(this.flagPoints(0, 0), true);
        this.face.lineStyle(3, 0xffffff, 0.85);
        this.face.strokePoints(this.flagPoints(0, 0), true);
    }

    private build (): void
    {
        const angle = this.config.angle ?? -6;
        const fontSize = this.config.fontSize ?? 28;

        const shadow = this.scene.add.graphics();
        shadow.fillStyle(COLOR_NAVY, 1);
        shadow.fillPoints(this.flagPoints(-11, 15), true);

        this.face = this.scene.add.graphics();
        this.drawFace(COLOR_RED);

        const shadowLabel = this.scene.add.text(3, 1, this.config.label, {
            fontFamily: TITLE_FONT,
            fontStyle: 'italic',
            fontSize,
            color: '#7a1810',
            padding: { x: 8, y: 8 }
        }).setOrigin(0.5).setAngle(angle);

        const label = this.scene.add.text(0, -2, this.config.label, {
            fontFamily: TITLE_FONT,
            fontStyle: 'italic',
            fontSize,
            color: '#ffffff',
            padding: { x: 8, y: 8 }
        }).setOrigin(0.5).setAngle(angle);

        this.add([ shadow, this.face, shadowLabel, label ]);

        this.setInteractive(
            new Geom.Rectangle(-this.hitWidth / 2, -this.hitHeight / 2, this.hitWidth, this.hitHeight),
            Geom.Rectangle.Contains
        );
        this.input!.cursor = 'pointer';

        this.on('pointerover', () => {
            this.scene.tweens.add({ targets: this, scale: 1.08, duration: 100 });
            this.drawFace(COLOR_RED_HOVER);
        });

        this.on('pointerout', () => {
            this.scene.tweens.add({ targets: this, scale: 1, duration: 100 });
            this.drawFace(COLOR_RED);
        });

        this.on('pointerdown', () => {

            this.scene.tweens.add({ targets: this, scale: 0.95, duration: 60, yoyo: true });

            const soundKey = this.config.clickSound ?? 'click';

            if (this.scene.cache.audio.exists(soundKey))
            {
                this.scene.sound.play(soundKey);
            }

            this.config.onClick?.();
        });
    }
}
