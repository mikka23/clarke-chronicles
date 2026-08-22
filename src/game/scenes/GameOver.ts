import { Scene, GameObjects, Math as PhaserMath } from 'phaser';
import { getPlayer, getScore } from '../systems/GameState';
import { submitScore, fetchTopScores } from '../systems/Leaderboard';
import { Button } from '../ui/Button';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

// Closing beat of the whole story: fades up from black, reveals the chosen
// character's final score with a flourish, starts the credits music, then
// hands off to the Credits scene once the button is pressed.
export class GameOver extends Scene
{
    private curtain: GameObjects.Rectangle;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor('#0b0b1e');

        const player = getPlayer(this);
        const score = getScore(this);

        if (player)
        {
            submitScore(player.name, player.key, score);
        }

        this.buildStarfield();
        this.buildLeaderboard();

        if (player)
        {
            const portrait = this.add.image(CENTER_X, 190, player.texture)
                .setAlpha(0)
                .setScale(0);

            this.tweens.add({
                targets: portrait,
                alpha: 1,
                scale: 0.45,
                duration: 600,
                ease: 'Back.Out',
                delay: 300
            });
        }

        const title = this.add.text(CENTER_X, 380, 'THE END', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 84,
            color: '#f6c945',
            stroke: '#1a0f08',
            strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.Out',
            delay: 600
        });

        const name = player?.name ?? 'Player';

        const nameText = this.add.text(CENTER_X, 500, `${name}'s final score`, {
            fontFamily: '"Special Elite", Georgia, serif',
            fontSize: 26,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: nameText, alpha: 1, duration: 500, delay: 1000 });

        const scoreCounter = { value: 0 };

        const scoreText = this.add.text(CENTER_X, 560, '0', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 64,
            color: '#ffd76e',
            stroke: '#1a0f08',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            duration: 300,
            delay: 1100,
            onComplete: () => {

                this.tweens.add({
                    targets: scoreCounter,
                    value: score,
                    duration: 900,
                    ease: 'Cubic.easeOut',
                    onUpdate: () => scoreText.setText(`${Math.round(scoreCounter.value)}`)
                });
            }
        });

        this.sound.stopByKey('bg-music');
        this.sound.play('goalscoring-superstar-hero', { loop: true, volume: 0.6 });

        this.buildContinueButton();

        // Fade in from black so the "THE END" reveal reads as a deliberate
        // curtain-up rather than a jump cut from whatever scene came before.
        this.curtain = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1).setDepth(2000);

        this.tweens.add({
            targets: this.curtain,
            alpha: 0,
            duration: 700,
            onComplete: () => this.curtain.destroy()
        });
    }

    private buildContinueButton (): void
    {
        const button = new Button(this, {
            x: CENTER_X,
            y: 660,
            label: 'CONTINUE',
            confirmOnEnter: true,
            onClick: () => this.scene.start('Credits')
        });

        button.setAlpha(0);
        button.setScale(0.6);

        this.tweens.add({
            targets: button,
            alpha: 1,
            scale: 1,
            duration: 350,
            ease: 'Back.Out',
            delay: 2000
        });
    }

    private buildLeaderboard (): void
    {
        const heading = this.add.text(1120, 100, 'TOP SCORES', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 24,
            color: '#f6c945'
        }).setOrigin(0.5).setAlpha(0);

        const list = this.add.text(1120, 130, 'Loading...', {
            fontFamily: '"Special Elite", Georgia, serif',
            fontSize: 16,
            color: '#f3ecdd',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5, 0).setAlpha(0);

        this.tweens.add({ targets: [heading, list], alpha: 1, duration: 500, delay: 1400 });

        fetchTopScores().then((entries) => {

            if (!this.scene.isActive())
            {
                return;
            }

            if (entries.length === 0)
            {
                list.setText('No scores yet');
                return;
            }

            list.setText(entries.map((entry, i) => `${i + 1}. ${entry.name} - ${entry.score}`).join('\n'));
        });
    }

    // A scattering of small twinkling dots behind the text, so the closing
    // screen doesn't read as a flat colour fill.
    private buildStarfield (): void
    {
        for (let i = 0; i < 60; i++)
        {
            const star = this.add.circle(
                PhaserMath.Between(0, GAME_WIDTH),
                PhaserMath.Between(0, GAME_HEIGHT),
                PhaserMath.Between(1, 2),
                0xffffff,
                PhaserMath.FloatBetween(0.2, 0.8)
            );

            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: PhaserMath.Between(800, 2000),
                yoyo: true,
                repeat: -1,
                delay: PhaserMath.Between(0, 1000)
            });
        }
    }
}
