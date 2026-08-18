import { Scene } from 'phaser';
import { getPlayer, getScore } from '../systems/GameState';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;
    score_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameover_text = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        const player = getPlayer(this);
        const name = player?.name ?? 'Player';

        this.score_text = this.add.text(512, 460, `${name}'s final score: ${getScore(this)}`, {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        });
        this.score_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
