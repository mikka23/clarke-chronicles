import { Scene, GameObjects } from 'phaser';
import { Button } from '../ui/Button';
import { addScore } from '../systems/GameState';
import { showScoreToast } from '../ui/ScoreToast';
import { showInventoryToast } from '../ui/InventoryToast';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;
const PROMPT_Y = GAME_HEIGHT - 190;
const BUTTON_Y = GAME_HEIGHT - 90;
const CONTINUE_Y = 660;

const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';

const TOILET_PAPER_POINTS = 2;
// How far ahead of the video ending to award the pickup, so it lands as a
// beat within the cutscene rather than after it's already finished.
const AWARD_BEFORE_END_MS = 1000;

// A cutscene stop between Arabian Derby and the next beat: the toilet-paper
// video sits paused on its first frame like a poster image until the player
// clicks through, then it plays for real.
export class Reception extends Scene
{
    private video: GameObjects.Video;
    private toiletPaperAwarded: boolean = false;

    constructor ()
    {
        super('Reception');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x000000);

        this.video = this.add.video(CENTER_X, CENTER_Y, 'butlins-toilet-paper');

        this.video.on('created', (_video: GameObjects.Video, width: number, height: number) => {

            const scale = Math.max(GAME_WIDTH / width, GAME_HEIGHT / height);
            this.video.setScale(scale);
        });

        // Browsers won't render a paused video's frame unless it has actually
        // played, and won't autoplay unmuted without a user gesture - so play
        // muted just long enough to grab the first frame, then freeze on it.
        this.video.setMute(true);
        this.video.play(false);
        this.video.once('play', () => this.video.pause());

        this.buildPrompt();
    }

    private buildPrompt (): void
    {
        const prompt = this.add.text(CENTER_X, PROMPT_Y,
            'You need to evacuate some of those hobnobs, but the bathroom is lacking toilet paper.', {
            fontFamily: TITLE_FONT,
            fontSize: 34,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 900 },
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5).setDepth(2);

        const askButton = new Button(this, {
            x: CENTER_X,
            y: BUTTON_Y,
            label: 'ASK AT RECEPTION',
            onClick: () => this.playVideo([ prompt, askButton ])
        }).setDepth(2);
    }

    private playVideo (promptObjects: GameObjects.GameObject[]): void
    {
        promptObjects.forEach((object) => (object as GameObjects.GameObject & { destroy: () => void }).destroy());

        // The first-frame trick already called play() once, so Phaser's
        // play() is a no-op the second time round (it only calls through to
        // the native video on the first invocation) - resume() is what
        // actually un-pauses the underlying <video> element.
        this.video.setMute(false);
        this.video.resume();

        const durationMs = (this.video.video?.duration ?? 0) * 1000;
        const awardDelay = Math.max(0, durationMs - AWARD_BEFORE_END_MS);

        this.time.delayedCall(awardDelay, () => this.awardToiletPaper());

        this.video.once('complete', () => this.showContinue());
    }

    // Fires just before the video ends: the usual score-toast pop, but muted
    // since the video's own audio is playing, plus a bottom-right inventory
    // notification for the toilet paper picked up at reception.
    private awardToiletPaper (): void
    {
        if (this.toiletPaperAwarded)
        {
            return;
        }

        this.toiletPaperAwarded = true;

        addScore(this, TOILET_PAPER_POINTS);

        showScoreToast(this, TOILET_PAPER_POINTS, { playSound: false });

        showInventoryToast(this, {
            label: 'Toilet Paper Sheets',
            amount: TOILET_PAPER_POINTS
        });
    }

    private showContinue (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: CONTINUE_Y,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('ButlinsDad')
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
