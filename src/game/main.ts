import { Amber1 } from './scenes/Amber1';
import { Amber2 } from './scenes/Amber2';
import { Animals } from './scenes/Animals';
import { ArabianDerby } from './scenes/ArabianDerby';
import { Boot } from './scenes/Boot';
import { ButlinsDad } from './scenes/ButlinsDad';
import { Cakes } from './scenes/Cakes';
import { CharacterSelect } from './scenes/CharacterSelect';
import { CousinRace } from './scenes/CousinRace';
import { Credits } from './scenes/Credits';
import { DebugMenu } from './scenes/DebugMenu';
import { EpisodeTitle } from './scenes/EpisodeTitle';
import { GameOver } from './scenes/GameOver';
import { FindTheCar } from './scenes/FindTheCar';
import { Floss } from './scenes/Floss';
import { Floss2 } from './scenes/Floss2';
import { France } from './scenes/France';
import { GreyMaresTail } from './scenes/GreyMaresTail';
import { Jamils } from './scenes/Jamils';
import { MainMenu } from './scenes/MainMenu';
import { Mull } from './scenes/Mull';
import { NewForest } from './scenes/NewForest';
import { Omelette } from './scenes/Omelette';
import { PaulCartoon } from './scenes/PaulCartoon';
import { Plum } from './scenes/Plum';
import { Reception } from './scenes/Reception';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Skye } from './scenes/Skye';
import { Spain } from './scenes/Spain';
import { WinnyAndIveys } from './scenes/WinnyAndIveys';
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
    dom: {
        createContainer: true
    },
    scene: [
        Boot,
        Preloader,
        DebugMenu,
        MainMenu,
        CharacterSelect,
        EpisodeTitle,
        Scene1,
        Scene2,
        Scene3,
        ArabianDerby,
        Reception,
        ButlinsDad,
        GreyMaresTail,
        WinnyAndIveys,
        NewForest,
        Mull,
        Skye,
        Spain,
        France,
        FindTheCar,
        Jamils,
        Omelette,
        Cakes,
        Floss,
        Floss2,
        Amber1,
        Amber2,
        Animals,
        PaulCartoon,
        CousinRace,
        Plum,
        GameOver,
        Credits
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
