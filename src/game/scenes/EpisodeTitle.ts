import { Scene, GameObjects } from 'phaser';
import { InfoPanel } from '../ui/InfoPanel';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

const RULES_TEXT = "You'll be asked a run of questions to pin down the time "
    + "and place of this memory. Answers that are close score points; answers "
    + "that are way off cost you points. There's no fact-checking involved — "
    + "the \"right\" answer is whatever's actually remembered, not what really happened.";

export class EpisodeTitle extends Scene
{
    background: GameObjects.Image;

    constructor ()
    {
        super('EpisodeTitle');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x081420);

        this.background = this.fitToCanvas(this.add.image(CENTER_X, CENTER_Y, 'home'));
        this.background.setAlpha(0);

        this.playIntro();
    }

    // Rules panel pops up once the background has settled, and moves on to
    // the game only once the player has dismissed it.
    private showRules (): void
    {
        const panel = new InfoPanel(this, {
            y: CENTER_Y,
            width: 880,
            title: 'THE RULES',
            body: RULES_TEXT,
            dismissLabel: "LET'S GO!",
            audioKey: 'rules-narration',
            onDismiss: () => this.scene.start('Scene1')
        });

        panel.show();
    }

    // Background fades up first and holds on screen alone for a beat before
    // the rules panel appears, so the player gets a look at the scene.
    private playIntro (): void
    {
        this.tweens.add({
            targets: this.background,
            alpha: 1,
            duration: 600,
            onComplete: () => this.time.delayedCall(1200, () => this.showRules())
        });
    }

    // Home photo differs in resolution/aspect ratio from the canvas, so
    // scale it to cover edge-to-edge rather than letterboxing.
    private fitToCanvas (image: GameObjects.Image): GameObjects.Image
    {
        const source = this.textures.get(image.texture.key).getSourceImage();
        const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);

        return image.setScale(scale);
    }
}
