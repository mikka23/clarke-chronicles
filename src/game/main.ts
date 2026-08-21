import { Boot } from './scenes/Boot';
import { CharacterSelect } from './scenes/CharacterSelect';
import { EpisodeTitle } from './scenes/EpisodeTitle';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Scene1 } from './scenes/Scene1';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        CharacterSelect,
        EpisodeTitle,
        Scene1,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    const game = new Game({ ...config, parent });

    if (import.meta.env.DEV) {
        (window as any).game = game;
    }

    return game;

}

export default StartGame;
