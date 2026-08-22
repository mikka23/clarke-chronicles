import { Scene, GameObjects, Sound } from 'phaser';
import { Button } from '../ui/Button';
import { getScore } from '../systems/GameState';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const CONTINUE_Y = 660;

const FADE_IN_DURATION = 1200;
// This is a transitional scene, not a timed cutscene - the score card
// follows shortly after everything else appears rather than waiting for
// the race commentary to finish playing.
const REVEAL_START_DELAY = 600;

const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';
const TITLE_Y = 110;
const SCORE_Y = CENTER_Y - 10;
const VERDICT_Y = SCORE_Y + 90;

// Staggered reveal: title, then the score itself, then the verdict line,
// then the continue button - each beat waits for the previous to land.
const TITLE_TO_SCORE_DELAY = 500;
const SCORE_TO_VERDICT_DELAY = 550;
const VERDICT_TO_BUTTON_DELAY = 450;

export class ArabianDerby extends Scene
{
    constructor ()
    {
        super('ArabianDerby');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x000000);

        const background = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'arabian-derby'))
            .setAlpha(0);

        this.tweens.add({
            targets: background,
            alpha: 1,
            duration: FADE_IN_DURATION,
            ease: 'Sine.InOut'
        });

        // Duck the menu music for the race commentary, then hand it back to
        // the CONTINUE button rather than restoring it the moment the clip
        // ends, so it doesn't creep back in under the reveal beat.
        const bgMusic = this.sound.get('bg-music') as Sound.WebAudioSound | Sound.HTML5AudioSound | null;

        if (bgMusic)
        {
            bgMusic.mute = true;
        }

        this.events.once('shutdown', () => {

            if (bgMusic)
            {
                bgMusic.mute = false;
            }
        });

        const race = this.sound.add('arabian-derby-race');
        race.play();

        this.events.once('shutdown', () => race.stop());

        this.time.delayedCall(REVEAL_START_DELAY, () => this.showScoreReveal());
    }

    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }

    // Dims the background a touch so the score readout reads clearly, then
    // pops in the title, score, verdict and continue button one after
    // another rather than dumping them all onscreen at once.
    private showScoreReveal (): void
    {
        const dim = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x02121f, 0)
            .setDepth(1);

        this.tweens.add({ targets: dim, fillAlpha: 0.4, duration: 400 });

        const title = this.add.text(CENTER_X, TITLE_Y, "LET'S CHECK THE SCORES", {
            fontFamily: TITLE_FONT,
            fontSize: 44,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 6,
            align: 'center',
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5).setAlpha(0).setScale(0.6).setDepth(2);

        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            y: title.y + 20,
            duration: 450,
            ease: 'Back.Out',
            onComplete: () => this.time.delayedCall(TITLE_TO_SCORE_DELAY, () => this.revealScore())
        });
    }

    private revealScore (): void
    {
        const score = getScore(this);

        const scoreText = this.add.text(CENTER_X, SCORE_Y, `${score}`, {
            fontFamily: TITLE_FONT,
            fontSize: 96,
            color: '#ffd76e',
            stroke: '#1a0f08',
            strokeThickness: 8,
            padding: { x: 16, y: 16 }
        }).setOrigin(0.5).setAlpha(0).setScale(0.3).setDepth(2);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.Out',
            onComplete: () => this.time.delayedCall(SCORE_TO_VERDICT_DELAY, () => this.revealVerdict(score))
        });
    }

    private revealVerdict (score: number): void
    {
        const isPositive = score >= 0;

        const verdict = this.add.text(CENTER_X, VERDICT_Y, isPositive ? 'NOT BAD' : 'WHAT ARE YOU THINKING?', {
            fontFamily: TITLE_FONT,
            fontSize: 34,
            color: isPositive ? '#8fe89a' : '#e8402c',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5).setAlpha(0).setScale(0.6).setDepth(2);

        this.tweens.add({
            targets: verdict,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.Out',
            onComplete: () => this.time.delayedCall(VERDICT_TO_BUTTON_DELAY, () => this.showContinue())
        });
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Reception')
        }).setDepth(2);

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
