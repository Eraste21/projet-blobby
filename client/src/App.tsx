import { useEffect, useState } from 'react';
import { GameCanvas } from './components/Gamecanvas';
import { EndMenu } from './components/menu/EndMenu';
import { LobbyMenu } from './components/menu/LobbyMenu';
import { MainMenu } from './components/menu/MainMenu';
import { PageTransition } from './components/menu/PageTransition';
import { PauseMenu } from './components/menu/PauseMenu';
import { RulesMenu } from './components/menu/RulesMenu';
import { SettingsMenu, type ThemeMode } from './components/menu/SettingsMenu';
import { ScoreMenu, type MatchHistoryEntry } from './components/menu/ScoreMenu';
import { routeToScreen, screenToRoute, useCurrentRoute, useNavigate, type Screen } from './router/useNavigate';
import { socket } from './socket';
import { getSoundEnabled, setSoundEnabled as applySoundEnabled } from './utils/sound';

function App() {
  const route = useCurrentRoute();
  const navigate = useNavigate();
  const screen = routeToScreen(route);
  const [previousScreen, setPreviousScreen] = useState<Screen>('main');
  const [playerName, setPlayerName] = useState('Joueur');
  const [soundEnabled, setSoundEnabledState] = useState(() => getSoundEnabled());
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('blobby-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [result, setResult] = useState('');
  const [joinError, setJoinError] = useState('');
  const [history, setHistory] = useState<MatchHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('blobby-history') ?? '[]') as MatchHistoryEntry[];
    } catch {
      return [];
    }
  });
  const isGameMounted = screen === 'playing' || screen === 'paused';


  useEffect(() => {
    applySoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    document.body.classList.toggle('blobby-light', themeMode === 'light');
    document.body.classList.toggle('blobby-dark', themeMode === 'dark');
    localStorage.setItem('blobby-theme', themeMode);
  }, [themeMode]);

  const goToScreen = (nextScreen: Screen, options?: { replace?: boolean }) => {
    navigate(screenToRoute(nextScreen), options);
  };

  const backToMenu = () => {
    socket.disconnect();
    setResult('');
    setJoinError('');
    goToScreen('main');
  };

  const openScreen = (nextScreen: Screen) => {
    setPreviousScreen(screen);
    goToScreen(nextScreen);
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
    goToScreen('lobby');
  };

  if (screen === 'main') {
    return (
      <PageTransition name="main">
        <MainMenu
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          onPlay={() => {
            setJoinError('');
            goToScreen('lobby');
          }}
          onRules={() => openScreen('rules')}
          onSettings={() => openScreen('settings')}
          onScores={() => openScreen('scores')}
        />
      </PageTransition>
    );
  }

  if (screen === 'rules') {
    return (
      <PageTransition name="rules">
        <RulesMenu onBack={() => goToScreen(previousScreen === 'paused' ? 'paused' : 'main')} />
      </PageTransition>
    );
  }

  if (screen === 'scores') {
    return (
      <PageTransition name="scores">
        <ScoreMenu history={history} onClear={clearHistory} onBack={() => goToScreen('main')} />
      </PageTransition>
    );
  }

  if (screen === 'settings') {
    return (
      <PageTransition name="settings">
        <SettingsMenu
          soundEnabled={soundEnabled}
          themeMode={themeMode}
          onToggleSound={() => setSoundEnabledState((value) => !value)}
          onToggleTheme={() => setThemeMode((value) => (value === 'dark' ? 'light' : 'dark'))}
          onBack={() => goToScreen(previousScreen === 'paused' ? 'paused' : 'main')}
        />
      </PageTransition>
    );
  }

  if (screen === 'lobby') {
    return (
      <PageTransition name="lobby">
        <LobbyMenu
          playerName={playerName}
          errorMessage={joinError}
          onStart={() => {
            setJoinError('');
            goToScreen('playing');
          }}
          onBack={backToMenu}
        />
      </PageTransition>
    );
  }

  if (screen === 'ended') {
    return (
      <PageTransition name="ended">
        <EndMenu result={result} onReplay={replay} onBackToMenu={backToMenu} />
      </PageTransition>
    );
  }

  return (
    <>
      {isGameMounted && (
        <GameCanvas
          playerName={playerName}
          paused={screen === 'paused'}
          onPause={() => openScreen('paused')}
          onJoinRejected={(message) => {
            socket.disconnect();
            setJoinError(message);
            goToScreen('lobby', { replace: true });
          }}
          onGameOver={(gameResult) => {
            setResult(gameResult);
            saveMatchResult(gameResult);
            goToScreen('ended', { replace: true });
          }}
        />
      )}

      {screen === 'paused' && (
        <PageTransition name="paused">
          <PauseMenu
            onResume={() => goToScreen('playing')}
            onRestart={replay}
            onBackToMenu={backToMenu}
          />
        </PageTransition>
      )}
    </>
  );
}

export default App;
