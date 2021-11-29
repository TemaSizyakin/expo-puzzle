import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import useWindowSize, { WindowSizeContext } from './src/hooks/useWindowSize';
import MenuScreen from './src/screens/menu/MenuScreen';
import { useFonts } from 'expo-font';
import { useAssets } from 'expo-asset';
import Images from './src/res/Images';
import Fonts from './src/res/Fonts';
import Puzzles from './src/res/Puzzles';
import LoadingScreen from './src/screens/loading/LoadingScreen';
import GameScreen from './src/screens/game/GameScreen';

enum Screen {
	NONE,
	MENU,
	GAME,
}

export default function App() {
	const [screen, setScreen] = useState(Screen.NONE);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
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
			setScreen(Screen.MENU);
			setIsLoaded(true);
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
		}, 1000);
	}, []);

	const onPlay = (index: number) => {
		setPuzzle(index);
		setScreen(Screen.GAME);
	};

	const onCloseGame = () => {
		setIsLoaded(false);
		setIsLoading(true);
		setTimeout(() => {
			setScreen(Screen.MENU);
			setIsLoaded(true);
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
		}, 1000);
	};

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<View style={{ flex: 1 }} onLayout={onContainerLayout}>
				<StatusBar hidden />
				{screen === Screen.MENU && <MenuScreen slides={Puzzles} onPlay={onPlay} />}
				{screen === Screen.GAME && <GameScreen puzzle={Puzzles[puzzle]} onCloseGame={onCloseGame} />}
				{isLoading && <LoadingScreen startClosed={screen === Screen.NONE} isLoaded={isLoaded} />}
			</View>
		</WindowSizeContext.Provider>
	);
}
