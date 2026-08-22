import { Scene, GameObjects } from 'phaser';
import { Button } from '../ui/Button';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const BUTTON_Y = 620;

// A beat between Reception (toilet paper) and the main game hub: the cartoon
// version of Dad at Butlins gets clicked away to reveal the real photo,
// reusing the same glitch/flash/dissolve reveal beat as Scene1's golf reveal.
export class ButlinsDad extends Scene
{
    private backgroundImage: GameObjects.Image;

    constructor ()
    {
        super('ButlinsDad');
    }

    create ()
    {
        this.backgroundImage = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'butlins-dad-cartoon'));

        this.showReveal();
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    private showReveal (): void
    {
        const revealButton = new Button(this, {
            x: CENTER_X,
            y: BUTTON_Y,
            label: 'REVEAL REALITY',
            width: 260,
            onClick: () => {

                revealButton.destroy();
                this.sound.play('last-train-for-saint-fernando');
                this.playRevealTransition();
            }
        });
    }

    // Glitches the cartoon out in a few quick flickers, flashes white, then
    // dissolves into the real photo underneath - same beat as Scene1's reveal.
    private playRevealTransition (): void
    {
        const cartoonImage = this.backgroundImage;

        const realImage = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'butlins-dad'))
            .setAlpha(0)
            .setDepth(-1);

        const flash = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0)
            .setDepth(10);

        this.tweens.add({
            targets: cartoonImage,
            alpha: 0.35,
            duration: 70,
            yoyo: true,
            repeat: 4,
            onComplete: () => {

                this.tweens.add({ targets: flash, alpha: 0.7, duration: 130, yoyo: true });

                this.tweens.add({ targets: cartoonImage, alpha: 0, duration: 700, ease: 'Sine.InOut' });

                this.tweens.add({
                    targets: realImage,
                    alpha: 1,
                    duration: 700,
                    ease: 'Sine.InOut',
                    onComplete: () => {

                        cartoonImage.destroy();
                        flash.destroy();
                        this.backgroundImage = realImage;

                        this.showContinue();
                    }
                });
            }
        });
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: BUTTON_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.showBumperBoats(button)
        });

        this.animateIn(button);
    }

    // Extra beat: swap in the bumper boats photo, keep the continue button
    // in place, and let the next click move on to the main game hub.
    private showBumperBoats (button: Button): void
    {
        const previousImage = this.backgroundImage;

        const bumperBoatsImage = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'bumperboats'))
            .setAlpha(0)
            .setDepth(-1);

        this.backgroundImage = bumperBoatsImage;

        this.tweens.add({
            targets: bumperBoatsImage,
            alpha: 1,
            duration: 400,
            ease: 'Sine.InOut',
            onComplete: () => previousImage.destroy()
        });

        button.setOnClick(() => this.scene.start('GreyMaresTail'));
    }

    private animateIn (button: Button): void
    {
        button.setAlpha(0);
        button.setScale(0.6);

        this.tweens.add({
            targets: button,
            alpha: 1,
            scale: 1,
            duration: 350,
            ease: 'Back.Out'
        });
    }
}
