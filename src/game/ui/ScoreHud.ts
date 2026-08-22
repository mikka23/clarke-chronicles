import { Scene, GameObjects } from 'phaser';
import { getScore } from '../systems/GameState';

const FONT = 'Bangers, "Arial Black", sans-serif';
const X = 28;
const Y = 24;

// Small persistent "SCORE 120" readout pinned to the top-left corner,
// present from the first question onwards so the running total is always
// visible. Listens to the shared score registry so it stays in sync however
// the score changes.
export class ScoreHud extends GameObjects.Container
{
    private valueText: GameObjects.Text;

    constructor (scene: Scene)
    {
        super(scene, X, Y);

        const label = scene.add.text(0, 0, 'SCORE', {
            fontFamily: FONT,
            fontSize: 18,
            color: '#f3ecdd',
            stroke: '#1a0f08',
            strokeThickness: 4,
            padding: { x: 10, y: 10 }
        }).setOrigin(0, 0);

        this.valueText = scene.add.text(0, 20, `${getScore(scene)}`, {
            fontFamily: FONT,
            fontSize: 32,
            color: '#ffd76e',
            stroke: '#1a0f08',
            strokeThickness: 5,
            padding: { x: 12, y: 12 }
        }).setOrigin(0, 0);

        this.add([ label, this.valueText ]);
        this.setDepth(1000);

        scene.add.existing(this);

        // changedata-<key> events are emitted as (parent, value, previousValue) —
        // no key argument, since the key is baked into the event name itself.
        const onScoreChanged = (_parent: unknown, value: number) => {
            this.valueText.setText(`${value}`);
        };

        scene.game.registry.events.on('changedata-score', onScoreChanged);
        scene.events.once('shutdown', () => scene.game.registry.events.off('changedata-score', onScoreChanged));
    }

    // World-space point just to the right of the score value, used to anchor
    // the +/- toast so it reads as feeding directly into the running total
    // rather than popping up in the middle of the screen.
    getToastAnchor (): { x: number; y: number }
    {
        return {
            x: this.x + this.valueText.x + this.valueText.width + 34,
            y: this.y + this.valueText.y + this.valueText.height / 2
        };
    }
}
