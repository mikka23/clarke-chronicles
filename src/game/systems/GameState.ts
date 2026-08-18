import { Game, Scene } from 'phaser';

const SCORE_KEY = 'score';
const PLAYER_KEY = 'player';

export interface PlayerInfo
{
    key: string;
    name: string;
    texture: string;
}

export function initGameState (game: Game)
{
    if (game.registry.get(SCORE_KEY) === undefined)
    {
        game.registry.set(SCORE_KEY, 0);
    }

    if (game.registry.get(PLAYER_KEY) === undefined)
    {
        game.registry.set(PLAYER_KEY, null);
    }
}

export function addScore (scene: Scene, points: number)
{
    const current = scene.game.registry.get(SCORE_KEY) ?? 0;
    scene.game.registry.set(SCORE_KEY, current + points);
}

export function getScore (scene: Scene): number
{
    return scene.game.registry.get(SCORE_KEY) ?? 0;
}

export function setPlayer (scene: Scene, player: PlayerInfo)
{
    scene.game.registry.set(PLAYER_KEY, player);
}

export function getPlayer (scene: Scene): PlayerInfo | null
{
    return scene.game.registry.get(PLAYER_KEY) ?? null;
}
