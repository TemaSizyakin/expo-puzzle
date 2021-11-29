import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../res/Colors';
import Shutters from './Shutters';
import Loading from './Loading';
import { WindowSizeContext } from '../../hooks/useWindowSize';

interface LoadingScreenProps {
	startClosed: boolean;
	isLoaded: boolean;
}

const LoadingScreen = ({ startClosed, isLoaded }: LoadingScreenProps) => {
	const window = useContext(WindowSizeContext);
	const [isOpened, setIsOpened] = useState(!startClosed);
	useEffect(() => {
		setIsOpened(isLoaded);
	}, [isLoaded]);
	return (
		<View style={StyleSheet.absoluteFill}>
			<Shutters isOpened={isOpened} backgroundColor={Colors.royalblue} />
			<Loading isOpened={isOpened} size={Math.min(window.width, window.height) / 3} />
		</View>
	);
};

export default LoadingScreen;
