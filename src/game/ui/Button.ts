import { Scene, GameObjects, Geom } from 'phaser';

export interface ButtonConfig
{
    x?: number;
    y?: number;
    label: string;
    width?: number;
    height?: number;
    fontSize?: number;
    // Key of the sfx to play on pointerdown. Guarded against a missing cache
    // entry, defaults to the shared UI click sound.
    clickSound?: string;
    onClick?: () => void;
    // Overrides the default red face/hover/label colours - used sparingly,
    // e.g. for a choice grid sat over low-contrast art where red-on-red (or
    // red-on-video) is hard to read.
    fillColor?: number;
    hoverColor?: number;
    labelColor?: string;
    labelStroke?: string;
    // Off for glyph-only buttons (carousel arrows, etc) - italicising a
    // symbol like "<" or ">" skews it off-centre inside its box instead of
    // reading as a clean arrow.
    italic?: boolean;
    // Lets pressing Enter/Return activate this button, same as a click.
    // Only appropriate when this is the sole actionable control on screen
    // (a "continue"/dismiss beat) - a choice grid of several buttons has no
    // single one Enter should mean.
    confirmOnEnter?: boolean;
}

const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';
const CORNER_RADIUS = 14;
const SHADOW_OFFSET_X = -6;
const SHADOW_OFFSET_Y = 8;

// Gap between the label and the button's edge. Buttons size themselves to
// fit their label plus this padding, rather than a caller picking an overall
// width/height - that's what made the same padding look different from one
// button to the next depending on how long each one's label happened to be.
const PADDING_X = 24;
const PADDING_Y = 6;
const MIN_WIDTH = 120;
const MIN_HEIGHT = 48;

const COLOR_RED = 0xd9281f;
const COLOR_RED_HOVER = 0xe8493f;
const COLOR_NAVY = 0x1a1a5e;

// Shared clickable rounded-rect button used for every primary action across
// scenes (CONFIRM!, SUBMIT!, GOT IT!, ...), so they all share one look,
// hover/press feel and one click sound instead of each scene re-implementing
// it. Deliberately unslanted/unrotated - a tilted "flag" shape used to be the
// look, but it made buttons with different widths read as inconsistent since
// stretching the tilted quad changed its apparent angle.
export class Button extends GameObjects.Container
{
    private config: ButtonConfig;
    private face: GameObjects.Graphics;
    private hitWidth: number;
    private hitHeight: number;
    private onEnterKey?: () => void;

    constructor (scene: Scene, config: ButtonConfig)
    {
        super(scene, config.x ?? 0, config.y ?? 0);

        this.config = config;

        this.build();

        scene.add.existing(this);
    }

    // Repoints the click handler without rebuilding the button - used when a
    // single button needs to advance through more than one beat in sequence.
    setOnClick (onClick: () => void): this
    {
        this.config.onClick = onClick;

        return this;
    }

    // Enables/disables interaction and fades the button to read as inactive,
    // e.g. a submit button before any choice has been made.
    setEnabled (enabled: boolean): this
    {
        this.scene.tweens.killTweensOf(this);

        if (enabled)
        {
            this.setInteractive();
        }
        else
        {
            // Disabling interactivity suppresses pointerout, so a button
            // disabled mid-hover would otherwise stay scaled up and
            // hover-colored underneath its faded alpha. Reset that state here.
            this.disableInteractive();
            this.scene.tweens.add({ targets: this, scale: 1, duration: 100 });
            this.drawFace(this.config.fillColor ?? COLOR_RED);
        }

        this.scene.tweens.add({ targets: this, alpha: enabled ? 1 : 0.4, duration: 150 });

        return this;
    }

    private drawFace (color: number): void
    {
        this.face.clear();
        this.face.fillStyle(color, 1);
        this.face.fillRoundedRect(-this.hitWidth / 2, -this.hitHeight / 2, this.hitWidth, this.hitHeight, CORNER_RADIUS);
        this.face.lineStyle(3, 0xffffff, 0.85);
        this.face.strokeRoundedRect(-this.hitWidth / 2, -this.hitHeight / 2, this.hitWidth, this.hitHeight, CORNER_RADIUS);
    }

    private build (): void
    {
        const fontSize = this.config.fontSize ?? 28;

        // Measure the label first so the box can be sized to it - an
        // explicit width/height (e.g. a grid of same-size choice buttons)
        // still wins outright, wrapping the label to fit within it.
        const label = this.scene.add.text(0, 0, this.config.label, {
            fontFamily: TITLE_FONT,
            fontStyle: this.config.italic === false ? 'normal' : 'italic',
            fontSize,
            color: this.config.labelColor ?? '#ffffff',
            stroke: this.config.labelStroke ?? '#7a1810',
            strokeThickness: 4,
            align: 'center',
            wordWrap: this.config.width ? { width: this.config.width - PADDING_X * 2 } : undefined,
            padding: { x: 4, y: 4 }
        }).setOrigin(0.5);

        this.hitWidth = this.config.width ?? Math.max(MIN_WIDTH, label.width + PADDING_X * 2);
        this.hitHeight = this.config.height ?? Math.max(MIN_HEIGHT, label.height + PADDING_Y * 2);

        const shadow = this.scene.add.graphics();
        shadow.fillStyle(COLOR_NAVY, 1);
        shadow.fillRoundedRect(
            -this.hitWidth / 2 + SHADOW_OFFSET_X,
            -this.hitHeight / 2 + SHADOW_OFFSET_Y,
            this.hitWidth,
            this.hitHeight,
            CORNER_RADIUS
        );

        this.face = this.scene.add.graphics();
        this.drawFace(this.config.fillColor ?? COLOR_RED);

        this.add([ shadow, this.face, label ]);

        this.setInteractive(
            new Geom.Rectangle(-this.hitWidth / 2, -this.hitHeight / 2, this.hitWidth, this.hitHeight),
            Geom.Rectangle.Contains
        );
        this.input!.cursor = 'pointer';

        this.on('pointerover', () => {
            this.scene.tweens.add({ targets: this, scale: 1.08, duration: 100 });
            this.drawFace(this.config.hoverColor ?? COLOR_RED_HOVER);
        });

        this.on('pointerout', () => {
            this.scene.tweens.add({ targets: this, scale: 1, duration: 100 });
            this.drawFace(this.config.fillColor ?? COLOR_RED);
        });

        this.on('pointerdown', () => this.activate());

        if (this.config.confirmOnEnter)
        {
            this.onEnterKey = () => this.activate();
            this.scene.input.keyboard?.on('keydown-ENTER', this.onEnterKey);

            this.once('destroy', () => {
                this.scene.input.keyboard?.off('keydown-ENTER', this.onEnterKey);
            });
        }
    }

    // Shared by the pointerdown click and the optional Enter-key shortcut,
    // so both trigger the same press feedback/sound/callback exactly once.
    private activate (): void
    {
        if (!this.input?.enabled)
        {
            return;
        }

        this.scene.tweens.add({ targets: this, scale: 0.95, duration: 60, yoyo: true });

        const soundKey = this.config.clickSound ?? 'click';

        if (this.scene.cache.audio.exists(soundKey))
        {
            this.scene.sound.play(soundKey);
        }

        this.config.onClick?.();
    }
}
