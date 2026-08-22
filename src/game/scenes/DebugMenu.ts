import { Scene } from 'phaser';
import { setPlayer, getPlayer } from '../systems/GameState';
import { Button } from '../ui/Button';

interface SkipLink
{
    key: string;
    label: string;
}

// Every scene in the story, in play order, minus Boot/Preloader/DebugMenu
// themselves. Kept here rather than derived from main.ts's scene list so the
// labels can read as friendly names instead of raw scene keys.
const SKIP_LINKS: SkipLink[] = [
    { key: 'MainMenu', label: 'Main Menu' },
    { key: 'CharacterSelect', label: 'Character Select' },
    { key: 'EpisodeTitle', label: 'Episode Title' },
    { key: 'Scene1', label: 'Scene 1' },
    { key: 'Scene2', label: 'Scene 2 (Quiz)' },
    { key: 'Scene3', label: 'Scene 3' },
    { key: 'ArabianDerby', label: 'Arabian Derby' },
    { key: 'Reception', label: 'Reception' },
    { key: 'ButlinsDad', label: 'Butlins Dad' },
    { key: 'GreyMaresTail', label: "Grey Mare's Tail" },
    { key: 'WinnyAndIveys', label: "Winny & Ivey's" },
    { key: 'NewForest', label: 'New Forest' },
    { key: 'Mull', label: 'Mull' },
    { key: 'Spain', label: 'Spain' },
    { key: 'France', label: 'France' },
    { key: 'FindTheCar', label: 'Find The Car' },
    { key: 'Jamils', label: "Jamil's" },
    { key: 'Omelette', label: 'Omelette' },
    { key: 'Cakes', label: 'Cakes' },
    { key: 'Animals', label: 'Animals' },
    { key: 'PaulCartoon', label: 'Paul Cartoon' },
    { key: 'CousinRace', label: 'Cousin Race' },
    { key: 'Plum', label: 'Who Is This?' },
    { key: 'GameOver', label: 'Final Score' },
    { key: 'Credits', label: 'Credits' }
];

const GAME_WIDTH = 1280;
const CENTER_X = GAME_WIDTH / 2;

const GRID_TOP = 160;
const GRID_COLS = 4;
const COL_SPACING = 290;
const ROW_SPACING = 74;
const BUTTON_WIDTH = 260;
const BUTTON_HEIGHT = 54;

// Dev-only jump menu shown straight after Preloader (see Preloader.ts) so the
// game doesn't have to be replayed from the start every time while iterating
// on a later section. Never reachable in a production build.
export class DebugMenu extends Scene
{
    constructor ()
    {
        super('DebugMenu');
    }

    create ()
    {
        // Most later scenes assume a player has already been chosen; picking
        // a default here means jumping straight to e.g. GameOver doesn't crash.
        if (!getPlayer(this))
        {
            setPlayer(this, { key: 'michael', name: 'Michael', texture: 'char-michael' });
        }

        this.cameras.main.setBackgroundColor('#12122b');

        this.add.text(CENTER_X, 60, 'DEBUG: SKIP TO SCENE', {
            fontFamily: 'Bangers, "Arial Black", sans-serif',
            fontSize: 44,
            color: '#f6c945',
            stroke: '#1a0f08',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(CENTER_X, 105, 'Dev build only — jumps straight into a scene, skipping everything before it.', {
            fontFamily: '"Special Elite", monospace',
            fontSize: 16,
            color: '#c9c9d8'
        }).setOrigin(0.5);

        const startX = CENTER_X - ((GRID_COLS - 1) * COL_SPACING) / 2;

        SKIP_LINKS.forEach((link, index) => {

            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);

            new Button(this, {
                x: startX + col * COL_SPACING,
                y: GRID_TOP + row * ROW_SPACING,
                label: link.label,
                width: BUTTON_WIDTH,
                height: BUTTON_HEIGHT,
                fontSize: 20,
                onClick: () => this.scene.start(link.key)
            });
        });
    }
}
