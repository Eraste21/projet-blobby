import { useState } from 'react';
import { GameCanvas } from './components/Gamecanvas';
import { EndMenu } from './components/menu/EndMenu';
import { LobbyMenu } from './components/menu/LobbyMenu';
import { MainMenu } from './components/menu/MainMenu';
import { PauseMenu } from './components/menu/PauseMenu';
import { RulesMenu } from './components/menu/RulesMenu';
import { SettingsMenu } from './components/menu/SettingsMenu';
import { ScoreMenu, type MatchHistoryEntry } from './components/menu/ScoreMenu';
import { socket } from './socket';

type Screen = 'main' | 'rules' | 'settings' | 'scores' | 'lobby' | 'playing' | 'paused' | 'ended';

function App() {
  const [screen, setScreen] = useState<Screen>('main');
  const [previousScreen, setPreviousScreen] = useState<Screen>('main');
  const [playerName, setPlayerName] = useState('Joueur');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<MatchHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('blobby-history') ?? '[]') as MatchHistoryEntry[];
    } catch {
      return [];
    }
  });
  const isGameMounted = screen === 'playing' || screen === 'paused';

  const backToMenu = () => {
    socket.disconnect();
    setResult('');
    setScreen('main');
  };

  const openScreen = (nextScreen: Screen) => {
    setPreviousScreen(screen);
    setScreen(nextScreen);
  };

  const saveMatchResult = (gameResult: string) => {
    const entry: MatchHistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      result: gameResult,
      playerName,
    };

    setHistory((currentHistory) => {
      const nextHistory = [entry, ...currentHistory].slice(0, 12);
      localStorage.setItem('blobby-history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('blobby-history');
    setHistory([]);
  };

  const replay = () => {
    socket.emit('game:restart');
    socket.disconnect();
    setResult('');
    setScreen('lobby');
  };

  if (screen === 'main') {
    return (
      <MainMenu
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onPlay={() => setScreen('lobby')}
        onRules={() => openScreen('rules')}
        onSettings={() => openScreen('settings')}
        onScores={() => openScreen('scores')}
      />
    );
  }

  if (screen === 'rules') {
    return <RulesMenu onBack={() => setScreen(previousScreen === 'paused' ? 'paused' : 'main')} />;
  }

  if (screen === 'scores') {
    return <ScoreMenu history={history} onClear={clearHistory} onBack={() => setScreen('main')} />;
  }

  if (screen === 'settings') {
    return (
      <SettingsMenu
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((value) => !value)}
        onBack={() => setScreen(previousScreen === 'paused' ? 'paused' : 'main')}
      />
    );
  }

  if (screen === 'lobby') {
    return <LobbyMenu playerName={playerName} onStart={() => setScreen('playing')} onBack={backToMenu} />;
  }

  if (screen === 'ended') {
    return <EndMenu result={result} onReplay={replay} onBackToMenu={backToMenu} />;
  }

  return (
    <>
      {isGameMounted && (
        <GameCanvas
          playerName={playerName}
          paused={screen === 'paused'}
          onPause={() => setScreen('paused')}
          onGameOver={(gameResult) => {
            setResult(gameResult);
            saveMatchResult(gameResult);
            setScreen('ended');
          }}
        />
      )}

      {screen === 'paused' && (
        <PauseMenu
          onResume={() => setScreen('playing')}
          onRestart={replay}
          onBackToMenu={backToMenu}
        />
      )}
    </>
  );
}

export default App;
