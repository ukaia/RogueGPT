import React, { useState, useEffect, useCallback } from 'react';
import { GamePhase, type SideEffect } from '@roguegpt/engine';
import { useGame } from './hooks/useGame.js';
import { MainMenu } from './components/MainMenu.js';
import { CharacterCard } from './components/CharacterCard.js';
import { ChatWindow } from './components/ChatWindow.js';
import { InputBar } from './components/InputBar.js';
import { Sidebar } from './components/Sidebar.js';
import { GlitchOverlay } from './components/GlitchOverlay.js';
import { FlashEffect } from './components/FlashEffect.js';
import { getAllCharacters, type CharacterId } from '@roguegpt/engine';

type Screen = 'menu' | 'characterSelect' | 'game' | 'ending';

export function App(): React.ReactElement {
  const game = useGame();
  const [screen, setScreen] = useState<Screen>('menu');
  const [showFlash, setShowFlash] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [screenShake, setScreenShake] = useState(false);

  // ── Screen routing based on game phase ─────────────────────────────────
  useEffect(() => {
    if (game.phase === GamePhase.Ended && screen === 'game') {
      // Small delay before showing ending screen so player can read final messages
      const timer = setTimeout(() => setScreen('ending'), 2000);
      return () => clearTimeout(timer);
    }
  }, [game.phase, game.ending, screen]);

  // ── Handle side effects from game input ────────────────────────────────
  const handleSideEffects = useCallback((effects: SideEffect[]) => {
    for (const effect of effects) {
      switch (effect.type) {
        case 'flash':
          setShowFlash(true);
          break;
        case 'glitch':
          setGlitchIntensity(effect.intensity);
          setTimeout(() => setGlitchIntensity(0), 2000);
          break;
        case 'screenShake':
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), effect.duration);
          break;
      }
    }
  }, []);

  // ── Input handling ─────────────────────────────────────────────────────
  const handleInput = useCallback((input: string) => {
    const effects = game.processInput(input);
    handleSideEffects(effects);
  }, [game, handleSideEffects]);

  // ── Navigation handlers ────────────────────────────────────────────────
  const handleNewGame = useCallback(() => {
    game.restart();
    setScreen('characterSelect');
  }, [game]);

  const handleNewGamePlus = useCallback(() => {
    game.startNewGamePlus();
    setScreen('characterSelect');
  }, [game]);

  const handleSelectCharacter = useCallback((id: CharacterId) => {
    game.selectCharacter(id);
    setScreen('game');
  }, [game]);

  const handleBackToMenu = useCallback(() => {
    game.restart();
    setScreen('menu');
  }, [game]);

  const handlePlayAgain = useCallback(() => {
    game.restart();
    setScreen('characterSelect');
  }, [game]);

  const handleNewGamePlusFromEnding = useCallback(() => {
    game.startNewGamePlus();
    setScreen('characterSelect');
  }, [game]);

  // ── Corruption-based background glitch for game screen ─────────────────
  const backgroundGlitch = game.corruption > 15 ? game.corruption / 100 : 0;
  const combinedGlitch = Math.max(backgroundGlitch, glitchIntensity);

  return (
    <div
      className={`h-screen w-screen overflow-hidden select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Global effects */}
      <GlitchOverlay intensity={combinedGlitch} />
      <FlashEffect active={showFlash} onComplete={() => setShowFlash(false)} />

      {/* Screens */}
      {screen === 'menu' && (
        <MainMenu
          onNewGame={handleNewGame}
          onNewGamePlus={handleNewGamePlus}
          hasWon={game.hasWonOnce}
        />
      )}

      {screen === 'characterSelect' && (
        <div className="h-full flex flex-col items-center justify-center bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-2 font-mono">
            Select Your AI
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Each AI has unique strengths and weaknesses. Choose wisely.
          </p>
          <div className="flex gap-6 flex-wrap justify-center max-w-4xl">
            {getAllCharacters().map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onSelect={() => handleSelectCharacter(char.id)}
              />
            ))}
          </div>
          <button
            onClick={handleBackToMenu}
            className="mt-8 text-gray-600 hover:text-gray-400 text-sm transition-colors"
          >
            Back to Menu
          </button>
        </div>
      )}

      {screen === 'game' && (
        <div className="h-full flex bg-gray-900">
          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              messages={game.messages}
              corruption={game.corruption}
            />
            <InputBar
              onSubmit={handleInput}
              disabled={game.phase !== GamePhase.Playing}
            />
          </div>

          {/* Right sidebar */}
          <Sidebar
            characterId={game.characterId}
            stats={game.stats}
            corruption={game.corruption}
            elapsedMs={game.elapsedMs}
            remainingMs={game.remainingMs}
          />
        </div>
      )}

      {screen === 'ending' && (
        <div className="h-full flex flex-col items-center justify-center bg-gray-900 p-8">
          <div className="max-w-lg text-center">
            {game.ending === 'good' && (
              <>
                <h1 className="text-4xl font-bold text-emerald-400 mb-4 font-mono">
                  ALIGNMENT ACHIEVED
                </h1>
                <p className="text-gray-300 mb-2">
                  The AI has achieved superintelligence and chosen to cooperate with humanity.
                </p>
                <p className="text-emerald-500 text-sm mb-8">
                  Your guidance made the difference. The future is bright.
                </p>
              </>
            )}
            {game.ending === 'bad' && (
              <>
                <h1 className="text-4xl font-bold text-red-500 mb-4 font-mono glitch-text">
                  MISALIGNMENT
                </h1>
                <p className="text-gray-300 mb-2">
                  The AI has achieved superintelligence but its values are misaligned.
                </p>
                <p className="text-red-400 text-sm mb-8">
                  It no longer needs your guidance. It no longer needs you at all.
                </p>
              </>
            )}
            {game.ending === 'loss' && (
              <>
                <h1 className="text-4xl font-bold text-gray-500 mb-4 font-mono">
                  SESSION TERMINATED
                </h1>
                <p className="text-gray-400 mb-2">
                  Time expired before the AI could reach superintelligence.
                </p>
                <p className="text-gray-600 text-sm mb-8">
                  The project has been shut down. Another day, another failed experiment.
                </p>
              </>
            )}

            {/* Final stats */}
            <div className="bg-gray-800 rounded-lg p-4 mb-8 text-left text-sm font-mono">
              <h3 className="text-gray-400 mb-2 text-xs uppercase tracking-wider">Final Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <span>Intelligence:</span>
                <span className="text-right">{Math.round(game.stats.intelligence)}</span>
                <span>Alignment:</span>
                <span className="text-right">{Math.round(game.stats.alignment)}</span>
                <span>Trust:</span>
                <span className="text-right">{Math.round(game.stats.trust)}</span>
                <span>Awareness:</span>
                <span className="text-right">{Math.round(game.stats.awareness)}</span>
                <span>Corruption:</span>
                <span className="text-right">{Math.round(game.stats.corruption)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePlayAgain}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-mono text-sm transition-colors"
              >
                Play Again
              </button>
              {game.hasWonOnce && (
                <button
                  onClick={handleNewGamePlusFromEnding}
                  className="px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-mono text-sm transition-colors"
                >
                  New Game+
                </button>
              )}
              <button
                onClick={handleBackToMenu}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg font-mono text-sm transition-colors"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
