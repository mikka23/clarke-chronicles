import { Scene, GameObjects } from 'phaser';

const TITLE_FONT = 'Bangers, "Arial Black", sans-serif';
const BODY_FONT = '"Special Elite", Georgia, serif';

const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 78;
const MARGIN = 24;
const HOLD_DURATION = 1600;

export interface InventoryToastConfig
{
    label: string;
    amount: number;
    x?: number;
    y?: number;
    onComplete?: () => void;
}

// Bottom-right "+N Item" card for inventory pickups - slides in from off the
// right edge, holds, then slides back out. Kept visually distinct from the
// center-screen score toast so a pickup doesn't read as a score change.
export function showInventoryToast (scene: Scene, config: InventoryToastConfig): void
{
    const targetX = config.x ?? scene.scale.width - PANEL_WIDTH / 2 - MARGIN;
    const y = config.y ?? scene.scale.height - PANEL_HEIGHT / 2 - MARGIN;
    const startX = scene.scale.width + PANEL_WIDTH / 2 + 20;

    const container: GameObjects.Container = scene.add.container(startX, y).setDepth(1000);

    const background = scene.add.graphics();
    background.fillStyle(0x02121f, 0.45);
    background.fillRoundedRect(-PANEL_WIDTH / 2 + 6, -PANEL_HEIGHT / 2 + 8, PANEL_WIDTH, PANEL_HEIGHT, 16);
    background.fillStyle(0xf3ecdd, 1);
    background.fillRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 16);
    background.lineStyle(3, 0x1a0f08, 0.35);
    background.strokeRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 16);

    const amountText = scene.add.text(-PANEL_WIDTH / 2 + 24, 0, `+${config.amount}`, {
        fontFamily: TITLE_FONT,
        fontSize: 30,
        color: '#2fbf4f',
        stroke: '#1a0f08',
        strokeThickness: 5,
        padding: { x: 8, y: 8 }
    }).setOrigin(0, 0.5);

    const labelText = scene.add.text(-PANEL_WIDTH / 2 + 96, 0, config.label, {
        fontFamily: BODY_FONT,
        fontSize: 18,
        color: '#3a2c1a',
        lineSpacing: 4,
        wordWrap: { width: PANEL_WIDTH - 116 },
        padding: { x: 6, y: 6 }
    }).setOrigin(0, 0.5);

    container.add([ background, amountText, labelText ]);

    scene.tweens.add({
        targets: container,
        x: targetX,
        duration: 420,
        ease: 'Back.Out',
        onComplete: () => {

            scene.tweens.add({
                targets: container,
                x: startX,
                duration: 350,
                delay: HOLD_DURATION,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    container.destroy();
                    config.onComplete?.();
                }
            });
        }
    });
}
