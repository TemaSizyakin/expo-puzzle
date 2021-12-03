import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import useWindowSize, { WindowSizeContext } from './src/hooks/useWindowSize';
import MenuScreen from './src/screens/menu/MenuScreen';
import { useFonts } from 'expo-font';
import { useAssets } from 'expo-asset';
import Images from './src/res/Images';
import Fonts from './src/res/Fonts';
import LoadingScreen from './src/screens/loading/LoadingScreen';
import GameScreen from './src/screens/game/GameScreen';
import { BackHandler } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import ErrorScreen from './src/screens/error/ErrorScreen';
import Colors from './src/res/Colors';
import { PuzzlesUrl } from './src/res/Urls';

export type Puzzle = { id: string, title: string, color: string, size: { x: number, y: number } };

enum Screen {
	NONE,
	ERROR,
	MENU,
	GAME,
}

export default function App() {
	const [screen, setScreen] = useState(Screen.NONE);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
	const [loadingColor, setLoadingColor] = useState<string>(Colors.royalblue);
	const [loadingError, setLoadingError] = useState<string>();
	const [needRefresh, setNeedRefresh] = useState(true);
	const [windowSize, onContainerLayout] = useWindowSize();
	useEffect(() => {
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).then();
	}, []);
	const [assetsLoaded] = useAssets([...Object.values(Images.UI), ...Object.values(Images.covers)]);
	const [fontsLoaded] = useFonts(Fonts);
	const [puzzles, setPuzzles] = useState<Array<Puzzle>>();
	const [selectedPuzzle, setSelectedPuzzle] = useState(0);
	useEffect(() => {
		if (fontsLoaded && !!assetsLoaded) {
			if (needRefresh) {
				setNeedRefresh(false);
				const getPuzzlesAsync = async () => {
					try {
						const response = await fetch(PuzzlesUrl);
						const json = await response.json();
						return Promise.resolve(json);
					} catch (e: unknown) {
						if (typeof e === 'string') {
							setLoadingError(e);
						} else if (e instanceof Error) {
							setLoadingError(e.message);
						}
						return Promise.reject();
					}
				};
				getPuzzlesAsync()
					.then(data => {
						setPuzzles(data);
						setScreen(Screen.MENU);
						setIsLoaded(true);
					})
					.catch(() => {
						setScreen(Screen.ERROR);
						setIsLoaded(true);
					})
					.finally(() => {
						setTimeout(() => {
							setIsLoading(false);
						}, 1000);
					});
			}
		}
	}, [needRefresh, fontsLoaded, assetsLoaded]);

	const onPlayPress = (index: number) => {
		setSelectedPuzzle(index);
		setScreen(Screen.GAME);
	};

	const onClosePress = () => {
		setLoadingColor(Colors.red);
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

	const onRefreshPress = () => {
		if (!isLoading) {
			setIsLoaded(false);
			setIsLoading(true);
			setNeedRefresh(true);
		}
	};

	if (Platform.OS === 'android') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			const backAction = () => {
				if (screen === Screen.GAME && !isLoading) {
					onClosePress();
				}
				return true;
			};
			BackHandler.addEventListener('hardwareBackPress', backAction);
			return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
		}, [screen, isLoading]);
	}

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<View style={{ flex: 1 }} onLayout={onContainerLayout}>
				<StatusBar hidden />
				{screen === Screen.ERROR && <ErrorScreen error={loadingError} onRefreshPress={onRefreshPress} />}
				{screen === Screen.MENU && puzzles && <MenuScreen slides={puzzles} onPlayPress={onPlayPress} />}
				{screen === Screen.GAME && puzzles && <GameScreen puzzle={puzzles[selectedPuzzle]} onClosePress={onClosePress} />}
				{/*{screen === Screen.MENU && <GameScreen puzzle={puzzles[selectedPuzzle]} onClosePress={() => {}} />}*/}
				{isLoading && <LoadingScreen startClosed={screen === Screen.NONE} isLoaded={isLoaded} color={loadingColor} />}
			</View>
		</WindowSizeContext.Provider>
	);
}
