import { Scene } from 'phaser';
import { POSITIVE_SOUND_FILES, NEGATIVE_SOUND_FILES } from '../data/scoreSounds';
import { CREDITS_IMAGE_KEYS } from '../data/credits';

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
        this.load.image('asda', 'asda.jpg');
        this.load.image('butlins', 'butlins.jpg');
        this.load.image('butlins-dad-cartoon', 'butlins-dad-cartoon.jpg');
        this.load.image('butlins-dad', 'butlins-dad.jpg');
        this.load.image('bumperboats', 'bumperboats.jpg');
        this.load.image('arabian-derby', 'arabian-derby.jpg');
        this.load.image('grey-mares-tail', 'grey-mares-tail.jpg');
        this.load.image('winny-and-iveys', 'winny-and-iveys.jpg');
        this.load.image('winney-iveys-2', 'winney-iveys-2.jpg');
        this.load.image('new-forest', 'new-forest.jpg');
        this.load.image('mull', 'mull.jpg');
        this.load.image('skye', 'skye.jpg');
        this.load.image('spain', 'spain.jpg');
        this.load.image('france', 'france.jpg');
        this.load.image('cars', 'cars.jpg');
        this.load.image('car-tam', 'car-tam.jpg');
        this.load.image('curry', 'curry.jpg');
        this.load.image('curry-bill', 'curry-bill.jpg');
        this.load.image('floss2', 'floss2.JPG');
        this.load.image('amber1', 'amber1.jpg');
        this.load.image('amber2', 'amber2.jpg');
        this.load.image('paul-cartoon', 'paul-cartoon.jpg');
        this.load.image('paul', 'paul.jpg');
        this.load.image('plum', 'plum.png');
        this.load.image('cousins', 'cousins.jpg');
        this.load.image('patch', 'patch.jpg');
        this.load.image('pip', 'pip.jpg');
        this.load.image('magic', 'magic.jpg');
        this.load.image('pudy', 'pudy.JPG');
        this.load.image('mitzi', 'mitzi.jpg');
        this.load.image('alice', 'alice.JPG');
        this.load.image('puschka', 'puschka.JPG');
        this.load.image('animal-ben', 'ben.jpg');
        this.load.image('suzuki', 'suzuki.jpg');
        this.load.video('butlins-toilet-paper', 'butlins-toilet-paper.mp4');
        this.load.video('omelette', 'omelette.mp4');
        this.load.video('floss', 'floss.mp4');
        this.load.image('logo', 'logo.svg');

        this.load.audio('arabian-derby-race', 'sounds/racing-of-the-arabian-derby.mp3');
        this.load.audio('last-train-for-saint-fernando', 'sounds/last-train-for-saint-fernando.mp3');
        this.load.audio('leave-the-gun-take-the-cannoli', 'sounds/leave-the-gun-take-the-cannoli.mp3');
        this.load.audio('goalscoring-superstar-hero', 'sounds/1-goalscoring-superstar-hero.mp3');

        this.load.image('food-bikers', 'food/bikers.webp');
        this.load.image('food-brannigans', 'food/brannigans.webp');
        this.load.image('food-chipsticks', 'food/chipsticks.jpg');
        this.load.image('food-discos', 'food/discos.webp');
        this.load.image('food-salt-and-shake', 'food/salt-and-shake.png');
        this.load.image('food-nik-naks', 'food/nik-naks.webp');
        this.load.image('food-choc-dips', 'food/choc-dips.webp');
        this.load.image('food-hobnobs', 'food/hobnobs.webp');
        this.load.image('food-mars', 'food/mars.webp');
        this.load.image('food-fruit', 'food/fruit.png');
        this.load.image('food-fruit-salads', 'food/fruit-salas.webp');
        this.load.image('food-chocolate-digestives', 'food/digestives.webp');
        this.load.image('food-coke', 'food/coke.webp');
        this.load.image('food-cola-cubes', 'food/cola-cubes.webp');
        this.load.image('food-irn-bru', 'food/irn-bru.webp');
        this.load.image('food-space-raiders', 'food/space-raiders.webp');
        this.load.image('food-vegetables', 'food/vegetables.png');
        this.load.image('food-wham', 'food/wham.webp');

        this.load.image('cake1', 'cake1.jpg');
        this.load.image('cake2', 'cake2.jpg');
        this.load.image('cake3', 'cake3.jpg');
        this.load.image('cake4', 'cake4.jpg');
        this.load.image('cake5', 'cake-5.png');
        this.load.image('cake6', 'cake6.jpg');
        this.load.image('cake7', 'cake7.jpg');

        CREDITS_IMAGE_KEYS.forEach(({ key, file }) => this.load.image(key, `credits/${file}`));
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

            this.scene.start(import.meta.env.DEV ? 'DebugMenu' : 'MainMenu');

        });
    }
}
