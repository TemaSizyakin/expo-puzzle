import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../res/Colors';
import Shutters from './Shutters';
import Loading from './Loading';
import { WindowSizeContext } from '../../hooks/useWindowSize';

interface LoadingScreenProps {
	startClosed: boolean;
	loaded: boolean;
}

const LoadingScreen = ({ startClosed, loaded }: LoadingScreenProps) => {
	const window = useContext(WindowSizeContext);
	const [opened, setOpened] = useState(!startClosed);
	useEffect(() => {
		setOpened(loaded);
	}, [loaded]);
	return (
		<View style={StyleSheet.absoluteFill}>
			<Shutters opened={opened} backgroundColor={Colors.royalblue} />
			<Loading opened={opened} size={Math.min(window.width, window.height) / 3} />
		</View>
	);
};

export default LoadingScreen;
