import { Scene, GameObjects, Input, Textures } from 'phaser';

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 768;
const PORTAL_RADIUS = 130;
const TRANSITION_DURATION = 900;
const HOLD_BEFORE_SELECT = 2000;
const PORTAL_MASK_KEY = 'portal-mask-canvas';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    cartoonWorld: GameObjects.Image;
    portalCanvas: Textures.CanvasTexture;
    title: GameObjects.Text;
    prompt: GameObjects.Text;
    transitioning = false;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.transitioning = false;

        // Real photo is the default reality; the cartoon world is only
        // revealed by the click transition.
        this.background = this.fitToCanvas(this.add.image(512, 384, 'background'));
        this.cartoonWorld = this.fitToCanvas(this.add.image(512, 384, 'background-cartoon'));

        this.ensurePortalCanvas();
        this.ensureWaveTexture();

        this.cartoonWorld.enableFilters();
        this.cartoonWorld.filters!.internal.addMask(PORTAL_MASK_KEY, false);

        this.title = this.add.text(512, 253, 'Clarke Chronicles', {
            fontFamily: 'Yesteryear, "Times New Roman", serif',
            fontSize: 96,
            color: '#e4d4b0',
            stroke: '#1a0f08',
            strokeThickness: 12,
            shadow: {
                offsetX: 3,
                offsetY: 5,
                color: '#000000',
                blur: 8,
                fill: true
            },
            align: 'center'
        }).setOrigin(0.5).setLetterSpacing(3);

        this.prompt = this.add.text(512, 325, 'CLICK TO BEGIN', {
            fontFamily: '"Special Elite", Georgia, serif',
            fontStyle: 'bold',
            fontSize: 24,
            color: '#c9a24b',
            stroke: '#1a0f08',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.prompt,
            alpha: 0.3,
            duration: 900,
            yoyo: true,
            repeat: -1
        });

        this.input.once('pointerdown', (pointer: Input.Pointer) => {

            this.transitioning = true;

            this.sound.play('wow');

            this.beginPortalTransition(pointer);
        });
    }

    // A portal opens from the click point and swallows the whole screen,
    // with a wavy ripple standing in for the real world dissolving into the
    // digital one, then holds before handing off to CharacterSelect.
    private beginPortalTransition (pointer: Input.Pointer): void
    {
        const local = this.toCartoonWorldLocal(pointer);

        this.tweens.killTweensOf(this.prompt);
        this.tweens.add({
            targets: this.prompt,
            alpha: 0,
            duration: 150
        });

        const wave = this.cameras.main.filters.internal.addDisplacement('portal-wave', 0, 0);

        this.tweens.add({
            targets: wave,
            x: 0.05,
            y: 0.04,
            duration: TRANSITION_DURATION / 2,
            ease: 'Sine.easeInOut',
            yoyo: true
        });

        // Grow past the far corner of the cartoon image, whichever corner
        // the click point ends up closest to, so the reveal always fills it.
        const maxRadius = Math.max(this.cartoonWorld.displayWidth, this.cartoonWorld.displayHeight) * 1.5;
        const growth = { radius: PORTAL_RADIUS };

        this.tweens.add({
            targets: growth,
            radius: maxRadius,
            duration: TRANSITION_DURATION,
            ease: 'Cubic.easeIn',
            onUpdate: () => this.drawPortal(local.x, local.y, growth.radius),
            onComplete: () => {

                this.cameras.main.filters.internal.clear();
                this.sound.play('bg-music', { loop: true, volume: 0.5 });

                this.time.delayedCall(HOLD_BEFORE_SELECT, () => {
                    this.scene.start('CharacterSelect');
                });
            }
        });
    }

    // Both source photos differ in resolution and aspect ratio, so scale
    // each independently to cover the canvas edge-to-edge at the same
    // effective zoom, rather than letting the higher-res one look "closer in".
    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    // Converts a pointer's screen position into pixel coordinates local to
    // cartoonWorld's own top-left corner, matching the mask canvas's own
    // space (the internal filter's UV is relative to the object's bounds,
    // not the main camera, so the mask must be drawn in that same local frame).
    private toCartoonWorldLocal (pointer: Input.Pointer): { x: number, y: number }
    {
        const topLeftX = this.cartoonWorld.x - this.cartoonWorld.displayWidth / 2;
        const topLeftY = this.cartoonWorld.y - this.cartoonWorld.displayHeight / 2;

        return { x: pointer.x - topLeftX, y: pointer.y - topLeftY };
    }

    // A canvas exactly the size of cartoonWorld's own display bounds, redrawn
    // on demand with a soft-edged circle — opaque through the middle,
    // feathering to transparent at the rim — used as the reveal mask.
    private ensurePortalCanvas (): void
    {
        if (this.textures.exists(PORTAL_MASK_KEY))
        {
            this.textures.remove(PORTAL_MASK_KEY);
        }

        const width = Math.ceil(this.cartoonWorld.displayWidth);
        const height = Math.ceil(this.cartoonWorld.displayHeight);
        const canvasTexture = this.textures.createCanvas(PORTAL_MASK_KEY, width, height);

        if (!canvasTexture)
        {
            return;
        }

        this.portalCanvas = canvasTexture;
    }

    private drawPortal (cx: number, cy: number, radius: number): void
    {
        const ctx = this.portalCanvas.getContext();
        const { width, height } = this.portalCanvas;

        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        this.portalCanvas.refresh();
    }

    // Displacement map for the transition ripple: per-pixel sine offsets
    // encoded into the red/green channels (128 = no displacement).
    private ensureWaveTexture (): void
    {
        if (this.textures.exists('portal-wave'))
        {
            return;
        }

        const w = 256;
        const h = 192;
        const canvasTexture = this.textures.createCanvas('portal-wave', w, h);

        if (!canvasTexture)
        {
            return;
        }

        const ctx = canvasTexture.getContext();
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let y = 0; y < h; y++)
        {
            for (let x = 0; x < w; x++)
            {
                const i = (y * w + x) * 4;

                data[i] = 128 + 90 * Math.sin(x / 14) * Math.cos(y / 22);
                data[i + 1] = 128 + 90 * Math.sin(y / 16) * Math.cos(x / 20);
                data[i + 2] = 128;
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        canvasTexture.refresh();
    }
}
