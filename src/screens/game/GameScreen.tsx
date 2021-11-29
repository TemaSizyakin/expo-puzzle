import React, { useContext } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import Colors from '../../res/Colors';
import Images from '../../res/Images';
import { WindowSizeContext } from '../../hooks/useWindowSize';

interface GameScreenProps {
	puzzle: { id: string, size: { x: number, y: number } };
	onCloseGame: () => void;
}

const GameScreen = ({
	puzzle: {
		id,
		size: { x, y },
	},
	onCloseGame,
}: GameScreenProps) => {
	const window = useContext(WindowSizeContext);
	return (
		<View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: Colors.red }}>
			<Pressable onPress={onCloseGame}>
				<Image source={Images[id]['11']} style={{ alignSelf: 'center', width: window.width / 4, height: window.height / 4 }} />
			</Pressable>
		</View>
	);
};

export default GameScreen;
