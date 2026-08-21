import { Scene, GameObjects } from 'phaser';
import { POSITIVE_SOUND_KEYS, NEGATIVE_SOUND_KEYS } from '../data/scoreSounds';

const FONT = 'Bangers, "Arial Black", sans-serif';

function pickRandom (sounds: string[]): string | undefined
{
    if (sounds.length === 0)
    {
        return undefined;
    }

    return sounds[Math.floor(Math.random() * sounds.length)];
}

export interface ScoreToastConfig
{
    x?: number;
    y?: number;
    onComplete?: () => void;
}

// Brief "+N" / "-N" text that pops in, holds, then fades out — paired with a
// random positive/negative sound based on the sign of the score change.
// Replaces the old modal popup so answering a question doesn't require an
// extra dismiss click.
export function showScoreToast (scene: Scene, points: number, config: ScoreToastConfig = {}): void
{
    const sign = points >= 0 ? '+' : '';
    const color = points >= 0 ? '#2fbf4f' : '#e8402c';
    const soundKey = pickRandom(points >= 0 ? POSITIVE_SOUND_KEYS : NEGATIVE_SOUND_KEYS);

    if (soundKey && scene.cache.audio.exists(soundKey))
    {
        scene.sound.play(soundKey);
    }

    const text: GameObjects.Text = scene.add.text(config.x ?? 640, config.y ?? 360, `${sign}${points}`, {
        fontFamily: FONT,
        fontSize: 64,
        color,
        stroke: '#1a0f08',
        strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(1000);

    scene.tweens.add({
        targets: text,
        alpha: 1,
        scale: 1,
        duration: 300,
        ease: 'Back.Out',
        onComplete: () => {

            scene.tweens.add({
                targets: text,
                alpha: 0,
                y: text.y - 40,
                duration: 350,
                delay: 650,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    text.destroy();
                    config.onComplete?.();
                }
            });
        }
    });
}
