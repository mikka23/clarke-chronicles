import { Scene, GameObjects, Time } from 'phaser';
import { CREDITS_IMAGE_KEYS } from '../data/credits';
import { Button } from '../ui/Button';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const PHOTO_CENTER_Y = 400;
const PHOTO_MAX_WIDTH = 760;
const PHOTO_MAX_HEIGHT = 480;
const HOLD_DURATION = 3200;
const FADE_DURATION = 700;

// Final beat of the story: a slideshow of family photos crossfading over one
// another, set to the same music GameOver started - left playing rather than
// restarted, so the two screens read as one continuous closing sequence.
export class Credits extends Scene
{
    private photo: GameObjects.Image;
    private index = 0;
    private timer?: Time.TimerEvent;

    constructor ()
    {
        super('Credits');
    }

    create ()
    {
        this.index = 0;

        this.add.rectangle(CENTER_X, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0b0b1e, 1);

        this.add.text(CENTER_X, 40, 'THANK YOU FOR PLAYING', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 40,
            color: '#f6c945',
            stroke: '#1a0f08',
            strokeThickness: 6
        }).setOrigin(0.5);

        const frame = this.add.graphics();
        frame.lineStyle(6, 0xf3ecdd, 1);
        frame.strokeRect(
            CENTER_X - PHOTO_MAX_WIDTH / 2 - 8,
            PHOTO_CENTER_Y - PHOTO_MAX_HEIGHT / 2 - 8,
            PHOTO_MAX_WIDTH + 16,
            PHOTO_MAX_HEIGHT + 16
        );

        this.photo = this.add.image(CENTER_X, PHOTO_CENTER_Y, CREDITS_IMAGE_KEYS[this.index].key).setAlpha(0);
        this.fitPhoto(this.photo);

        this.tweens.add({ targets: this.photo, alpha: 1, duration: FADE_DURATION });

        this.scheduleNextPhoto();

        this.events.once('shutdown', () => this.timer?.remove());

        new Button(this, {
            x: CENTER_X,
            y: 685,
            label: 'MAIN MENU',
            confirmOnEnter: true,
            onClick: () => {
                this.sound.stopByKey('goalscoring-superstar-hero');
                this.scene.start('MainMenu');
            }
        });
    }

    private scheduleNextPhoto (): void
    {
        this.timer = this.time.delayedCall(HOLD_DURATION, () => this.showNextPhoto());
    }

    private showNextPhoto (): void
    {
        this.index = (this.index + 1) % CREDITS_IMAGE_KEYS.length;

        this.tweens.add({
            targets: this.photo,
            alpha: 0,
            duration: FADE_DURATION,
            onComplete: () => {

                this.photo.setTexture(CREDITS_IMAGE_KEYS[this.index].key);
                this.fitPhoto(this.photo);

                this.tweens.add({ targets: this.photo, alpha: 1, duration: FADE_DURATION });

                this.scheduleNextPhoto();
            }
        });
    }

    private fitPhoto (image: GameObjects.Image): void
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.min(PHOTO_MAX_WIDTH / source.width, PHOTO_MAX_HEIGHT / source.height);

        image.setScale(scale);
    }
}
