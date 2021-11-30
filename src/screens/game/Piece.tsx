import { Image, View } from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';

interface PieceProps {
	piece: { index: string, boardX: number, boardY: number, scrollX: number, image: number };
	size: number;
	scroll: Animated.SharedValue<number>;
}

const Piece = ({ piece, size, scroll }: PieceProps) => {
	return (
		<View>
			<Image
				// source={{ uri: piece.image }}
				source={piece.image}
				style={{
					position: 'absolute',
					left: piece.scrollX * size,
					top: 0,
					width: size,
					height: size,
					transform: [{ scale: 1.67 }],
				}}
			/>
		</View>
	);
};

export default Piece;
