import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    prompt: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

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

        this.input.once('pointerdown', () => {

            this.sound.play('wow');
            this.sound.play('bg-music', { loop: true, volume: 0.5 });

            this.scene.start('CharacterSelect');

        });
    }
}
