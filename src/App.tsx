// 頂層元件：訂閱 controller 事件、依遊戲階段切換畫面。
// React 只負責 menu / lobby / gameover 與 game 容器；遊戲迴圈與 three.js 渲染在 controller。

import { useEffect, useState } from 'react';
import { getController } from './game/controller';
import { MenuScreen } from './components/MenuScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import type { AppPhase, GameOverView, LobbyView } from './types';

const EMPTY_LOBBY: LobbyView = { players: [], selfId: null, isHost: false, roomCode: '' };

export function App() {
  const controller = getController();
  const [phase, setPhase] = useState<AppPhase>('menu');
  const [lobby, setLobby] = useState<LobbyView>(EMPTY_LOBBY);
  const [menuStatus, setMenuStatus] = useState<{ msg: string; isError: boolean }>({ msg: '', isError: false });
  const [lobbyStatus, setLobbyStatus] = useState('');
  const [gameover, setGameover] = useState<GameOverView | null>(null);
  const [selectedChar, setSelectedChar] = useState(0);

  useEffect(() => {
    const offs = [
      controller.on('phase', setPhase),
      controller.on('lobby', setLobby),
      controller.on('menuStatus', (msg, isError) => setMenuStatus({ msg, isError })),
      controller.on('lobbyStatus', setLobbyStatus),
      controller.on('gameover', setGameover),
    ];
    return () => offs.forEach((off) => off());
  }, [controller]);

  function handleSelectChar(charId: number) {
    setSelectedChar(charId);
    controller.selectChar(charId);
  }

  switch (phase) {
    case 'menu':
      return (
        <MenuScreen
          status={menuStatus}
          onCreate={(name) => controller.createRoom(name)}
          onJoin={(name, code) => controller.joinRoom(name, code)}
        />
      );
    case 'lobby':
      return (
        <LobbyScreen
          lobby={lobby}
          status={lobbyStatus}
          selectedChar={selectedChar}
          onSelectChar={handleSelectChar}
          onStart={() => controller.startGame()}
          onLeave={() => controller.leave()}
        />
      );
    case 'game':
      return <GameScreen controller={controller} />;
    case 'gameover':
      return gameover ? (
        <GameOverScreen
          view={gameover}
          onToLobby={() => controller.returnToLobby()}
          onLeave={() => controller.leave()}
        />
      ) : null;
    default:
      return null;
  }
}
