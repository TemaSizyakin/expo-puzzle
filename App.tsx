import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import useWindowSize, { WindowSizeContext } from './src/hooks/useWindowSize';
import HomeScreen from './src/screens/home/HomeScreen';
import { useFonts } from 'expo-font';
import { useAssets } from 'expo-asset';
import Images from './src/res/Images';
import Fonts from './src/res/Fonts';
import Puzzles from './src/res/Puzzles';
import LoadingScreen from './src/screens/loading/LoadingScreen';
import GameScreen from './src/screens/game/GameScreen';

enum AppState {
	LOADING_HOME,
	LOADED_HOME,
	HOME,
	GAME,
	CLOSING_GAME,
}

export default function App() {
	const [appState, setAppState] = useState(AppState.LOADING_HOME);
	const [windowSize, onContainerLayout] = useWindowSize();
	const ui = Object.values(Images.UI);
	const covers = Puzzles.map(puzzle => Images[puzzle.id].cover);
	const [assetsLoaded] = useAssets([...ui, ...covers]);
	const [fontsLoaded] = useFonts(Fonts);
	const [puzzle, setPuzzle] = useState(0);

	// useEffect(() => {
	// 	if (fontsLoaded && !!assetsLoaded) {
	// 		setAppState(AppState.LOADED_HOME);
	// 		setTimeout(() => {
	// 			setAppState(AppState.HOME);
	// 		}, 1000);
	// 	}
	// }, [fontsLoaded, assetsLoaded]);
	useEffect(() => {
		setTimeout(() => {
			setAppState(AppState.LOADED_HOME);
			setTimeout(() => {
				setAppState(AppState.HOME);
			}, 1000);
		}, 1000);
	}, []);

	const onPlay = (index: number) => {
		setPuzzle(index);
		setAppState(AppState.GAME);
	};

	const onCloseGame = () => {
		setAppState(AppState.CLOSING_GAME);
		setTimeout(() => {
			setAppState(AppState.LOADED_HOME);
			setTimeout(() => {
				setAppState(AppState.HOME);
			}, 1000);
		}, 3000);
	};

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<View style={{ flex: 1 }} onLayout={onContainerLayout}>
				<StatusBar hidden />
				{(appState === AppState.LOADED_HOME || appState === AppState.HOME) && <HomeScreen slides={Puzzles} onPlay={onPlay} />}
				{(appState === AppState.GAME || appState === AppState.CLOSING_GAME) && (
					<GameScreen puzzle={Puzzles[puzzle]} onCloseGame={onCloseGame} />
				)}
				{(appState === AppState.LOADING_HOME || appState === AppState.LOADED_HOME || appState === AppState.CLOSING_GAME) && (
					<LoadingScreen startClosed={appState === AppState.LOADING_HOME} loaded={appState === AppState.LOADED_HOME} />
				)}
			</View>
		</WindowSizeContext.Provider>
	);
}
