import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Shutters from './Shutters';
import Spinner from './Spinner';
import { WindowSizeContext } from '../../hooks/useWindowSize';

interface LoadingScreenProps {
	startClosed: boolean;
	isLoaded: boolean;
	color: string;
}

const LoadingScreen = ({ startClosed, isLoaded, color }: LoadingScreenProps) => {
	const window = useContext(WindowSizeContext);
	const [isOpened, setIsOpened] = useState(!startClosed);
	useEffect(() => {
		setIsOpened(isLoaded);
	}, [isLoaded]);
	return (
		<View style={StyleSheet.absoluteFill}>
			<Shutters isOpened={isOpened} backgroundColor={color} />
			<Spinner isOpened={isOpened} size={Math.min(window.width, window.height) / 3} />
		</View>
	);
};

export default LoadingScreen;
