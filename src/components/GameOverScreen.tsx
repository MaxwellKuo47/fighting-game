// 結算畫面：勝者、依擊殺排序的戰績、返回大廳/離開。

import { getCharacter as rawGetCharacter } from '../game/characters.js';
import type { CharacterMeta, GameOverView } from '../types';

const getCharacter = rawGetCharacter as (id: number) => CharacterMeta;

interface GameOverScreenProps {
  view: GameOverView;
  onToLobby: () => void;
  onLeave: () => void;
}

export function GameOverScreen({ view, onToLobby, onLeave }: GameOverScreenProps) {
  const { winnerName, players, isHost } = view;
  const sorted = [...players].sort((a, b) => b.kills - a.kills);

  return (
    <section id="screen-gameover" className="screen active">
      <div className="panel">
        <h1>{winnerName ? `🏆 ${winnerName} 獲勝！` : '平手 — 無人存活'}</h1>
        <h3>本局戰績</h3>
        <div className="player-list">
          {sorted.map((p, i) => {
            const c = getCharacter(p.charId);
            return (
              <div className="player-row" key={i}>
                <span className="dot" style={{ background: c.color }}></span>
                <span className="pname">{p.name}</span>
                <span className="pchar">{c.name}</span>
                <span className="pkills">擊殺 {p.kills}</span>
              </div>
            );
          })}
        </div>
        <div className="over-actions">
          {isHost
            ? <button className="btn primary" onClick={onToLobby}>返回大廳</button>
            : <p className="dim">等待房主返回大廳…</p>}
          <button className="btn ghost" onClick={onLeave}>離開</button>
        </div>
      </div>
    </section>
  );
}
