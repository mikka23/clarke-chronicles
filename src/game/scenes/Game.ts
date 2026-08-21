import { Scene } from 'phaser';
import { addScore, getPlayer, getScore } from '../systems/GameState';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(640, 360, 'background');
        this.background.setAlpha(0.5);

        const bgSource = this.textures.get('background').getSourceImage();
        this.background.setScale(Math.max(1280 / bgSource.width, 720 / bgSource.height));

        const player = getPlayer(this);

        this.msg_text = this.add.text(640, 360, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0.5);

        // HUD reads from GameState (the shared registry) so it stays correct across
        // scene transitions instead of tracking its own local copy.
        this.scoreText = this.add.text(24, 24, this.buildHudText(player?.name ?? 'Player', getScore(this)), {
            fontFamily: 'Arial', fontSize: 22, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4
        });

        if (player)
        {
            this.add.image(64, 96, player.texture).setScale(0.3).setOrigin(0.5, 0);
        }

        // registry.events lives on the Game instance, not the scene, so a listener
        // added here would outlive this scene and fire against a destroyed scoreText
        // on every future score change unless removed on shutdown.
        const onScoreChanged = () => {
            this.scoreText.setText(this.buildHudText(player?.name ?? 'Player', getScore(this)));
        };

        this.game.registry.events.on('changedata-score', onScoreChanged);
        this.events.once('shutdown', () => this.game.registry.events.off('changedata-score', onScoreChanged));

        this.input.once('pointerdown', () => {

            addScore(this, 10);

            this.scene.start('GameOver');

        });
    }

    private buildHudText (name: string, score: number): string
    {
        return `${name}    Score: ${score}`;
    }
}
