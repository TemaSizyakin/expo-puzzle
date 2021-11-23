import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useWindowSize, { WindowSizeContext } from './src/hooks/useWindowSize';

export default function App() {
	const [windowSize, onContainerLayout] = useWindowSize();

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<View style={styles.container} onLayout={onContainerLayout}>
				<StatusBar hidden />
				<Text>{windowSize.width + 'x' + windowSize.height}</Text>
			</View>
		</WindowSizeContext.Provider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
