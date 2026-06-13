// 遊戲畫面：提供 #game-stage 容器與 canvas，掛載時把 canvas 交給 controller、卸載時收回。
// 遊戲迴圈與 three.js 渲染皆在 controller（命令式），React 只負責容器生命週期。

import { useEffect, useRef } from 'react';
import type { GameController } from '../types';

interface GameScreenProps {
  controller: GameController;
}

export function GameScreen({ controller }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    controller.attachCanvas(canvas);
    return () => controller.detachCanvas();
  }, [controller]);

  return (
    <section id="screen-game" className="screen active">
      <div id="game-stage">
        <canvas id="game-canvas" ref={canvasRef}></canvas>
      </div>
    </section>
  );
}
