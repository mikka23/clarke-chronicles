import { Scene } from 'phaser';
import { POSITIVE_SOUND_FILES, NEGATIVE_SOUND_FILES } from '../data/scoreSounds';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        const background = this.add.image(640, 360, 'background');
        const source = this.textures.get('background').getSourceImage();
        background.setScale(Math.max(1280 / source.width, 720 / source.height));

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(640, 360, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(640-230, 360, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.audio('wow', 'sounds/wow.mp3');
        this.load.audio('bg-music', 'sounds/bg.mp3');
        this.load.audio('select', 'sounds/select.mp3');
        this.load.audio('click', 'sounds/click.mp3');

        POSITIVE_SOUND_FILES.forEach((file) => this.load.audio(`positive-${file}`, `sounds/positive/${file}.mp3`));
        NEGATIVE_SOUND_FILES.forEach((file) => this.load.audio(`negative-${file}`, `sounds/negative/${file}.mp3`));

        this.load.image('char-dominic', 'characters/dom.png');
        this.load.image('char-michael', 'characters/mc.png');
        this.load.image('char-ben', 'characters/ben.png');
        this.load.image('char-mum', 'characters/mum.png');
        this.load.image('char-dad', 'characters/dad.png');
        this.load.image('garden', 'garden.jpg');
        this.load.image('home', 'home.jpg');
        this.load.image('ben-golf-cartoon', 'ben-golf-cartoon.jpg');
        this.load.image('ben-golf-real', 'ben-golf.jpg');
        this.load.image('logo', 'logo.svg');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Wait for the custom title fonts to be ready so MainMenu doesn't flash a fallback font.
        document.fonts.load('96px Yesteryear')
            .then(() => document.fonts.load('24px "Special Elite"'))
            .then(() => document.fonts.load('64px Bangers'))
            .finally(() => {

            this.scene.start('MainMenu');

        });
    }
}
