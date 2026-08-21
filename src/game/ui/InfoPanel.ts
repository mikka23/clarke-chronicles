import { Scene, GameObjects } from 'phaser';
import { Button } from './Button';

export interface InfoPanelConfig
{
    x?: number;
    y?: number;
    width?: number;
    title?: string;
    body: string;
    dismissLabel?: string;
    // Key of a narration/SFX clip to play when the panel appears. Guarded
    // against a missing cache entry since narration audio isn't recorded yet.
    audioKey?: string;
    onDismiss?: () => void;
}

const PANEL_PADDING = 28;
const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';
const BODY_FONT = '"Special Elite", Georgia, serif';

// A reusable parchment-style caption box — comic-page background, Bangers
// title, typewriter body copy, and a flag-style dismiss button — for any
// scene that needs to explain something to the player (rules, hints,
// story asides). Pops in/out with the same Back.Out feel used elsewhere.
export class InfoPanel extends GameObjects.Container
{
    private config: InfoPanelConfig;
    private panelWidth: number;
    private panelHeight: number;
    private dismissButton: Button;

    constructor (scene: Scene, config: InfoPanelConfig)
    {
        super(scene, config.x ?? 640, config.y ?? 360);

        this.config = config;
        this.panelWidth = config.width ?? 640;

        this.build();

        scene.add.existing(this);

        this.setScale(0.4);
        this.setAlpha(0);
    }

    // Scales/fades the panel in and optionally plays its narration/SFX cue.
    show (): void
    {
        this.scene.tweens.add({
            targets: this,
            scale: 1,
            alpha: 1,
            duration: 380,
            ease: 'Back.Out'
        });

        const audioKey = this.config.audioKey;

        if (audioKey && this.scene.cache.audio.exists(audioKey))
        {
            this.scene.sound.play(audioKey);
        }
    }

    // Scales/fades the panel out, then calls back once it's gone.
    hide (onComplete?: () => void): void
    {
        this.scene.tweens.add({
            targets: this,
            scale: 0.4,
            alpha: 0,
            duration: 220,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.destroy();
                onComplete?.();
            }
        });
    }

    private build (): void
    {
        const bodyWrapWidth = this.panelWidth - PANEL_PADDING * 2;

        const title = this.config.title ? this.buildTitle(bodyWrapWidth) : null;

        if (title)
        {
            this.add(title);
        }

        const body = this.buildBody(bodyWrapWidth);

        const titleHeight = title ? title.height + 16 : 0;
        const buttonHeight = 70;
        this.panelHeight = PANEL_PADDING * 2 + titleHeight + body.height + buttonHeight;

        const background = this.buildBackground();
        this.addAt(background, 0);

        if (title)
        {
            title.setPosition(0, -this.panelHeight / 2 + PANEL_PADDING + title.height / 2);
        }

        body.setPosition(0, -this.panelHeight / 2 + PANEL_PADDING + titleHeight + body.height / 2);

        this.dismissButton = this.buildDismissButton();
        this.dismissButton.setPosition(0, this.panelHeight / 2 - buttonHeight / 2 + 6);
        this.add(this.dismissButton);
    }

    private buildBackground (): GameObjects.Graphics
    {
        const w = this.panelWidth;
        const h = this.panelHeight;

        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x02121f, 0.45);
        graphics.fillRoundedRect(-w / 2 + 8, -h / 2 + 10, w, h, 18);

        graphics.fillStyle(0xf3ecdd, 1);
        graphics.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
        graphics.lineStyle(3, 0x1a0f08, 0.35);
        graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);

        return graphics;
    }

    private buildTitle (wrapWidth: number): GameObjects.Text
    {
        return this.scene.add.text(0, 0, this.config.title!, {
            fontFamily: TITLE_FONT,
            fontSize: 34,
            color: '#e8402c',
            stroke: '#1a0f08',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: wrapWidth }
        }).setOrigin(0.5);
    }

    private buildBody (wrapWidth: number): GameObjects.Text
    {
        const body = this.scene.add.text(0, 0, this.config.body, {
            fontFamily: BODY_FONT,
            fontSize: 20,
            color: '#3a2c1a',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: wrapWidth }
        }).setOrigin(0.5);

        this.add(body);

        return body;
    }

    // Same shared flag-button look used across every scene, so every
    // dismissible panel feels like part of the same UI family.
    private buildDismissButton (): Button
    {
        return new Button(this.scene, {
            label: this.config.dismissLabel ?? 'GOT IT!',
            width: 176,
            height: 52,
            fontSize: 24,
            angle: -2,
            onClick: () => this.hide(() => this.config.onDismiss?.())
        });
    }
}
