import { Image, View } from 'react-native';
import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const DURATION = 250;

interface PieceProps {
	piece: { index: string, boardX: number, boardY: number, scrollX: number, image: number };
	size: number;
	scroll: Animated.SharedValue<number>;
	scrollToAbsolute: (x: number, y: number) => { x: number, y: number };
	boardToAbsolute: (x: number, y: number) => { x: number, y: number };
	absoluteToBoard: (x: number, y: number) => { x: number, y: number };
}

const Piece = ({ piece, size, scroll, scrollToAbsolute, boardToAbsolute, absoluteToBoard }: PieceProps) => {
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const isAnimated = useSharedValue(false);
	const pieceScroll = useSharedValue(piece.scrollX);
	const dragged = useSharedValue(false);

	// TODO useMemo
	const animate = () => {
		isAnimated.value = true;
		setTimeout(() => {
			isAnimated.value = false;
		}, DURATION);
	};
	useEffect(() => {
		const wasOnScroll = pieceScroll.value >= 0;
		const isOnScroll = piece.scrollX >= 0;
		if (!isOnScroll) {
			const absolute = boardToAbsolute(piece.boardX, piece.boardY);
			translateX.value = withTiming(absolute.x, { duration: DURATION / 2 });
			translateY.value = withTiming(absolute.y, { duration: DURATION / 2 });
			animate();
		}
		if (isOnScroll) {
			if (wasOnScroll && piece.scrollX < scroll.value) {
				// No animation
			} else {
				if (wasOnScroll) {
					pieceScroll.value = withTiming(piece.scrollX, { duration: DURATION });
				} else {
					pieceScroll.value = piece.scrollX;
				}
				const absolute = scrollToAbsolute((-Math.round(scroll.value) + piece.scrollX) * 1.25 * size, 0);
				translateX.value = withTiming(absolute.x, { duration: DURATION });
				translateY.value = withTiming(absolute.y, { duration: DURATION });
				animate();
			}
		}
	});

	const animatedStyle = useAnimatedStyle(() => {
		if (dragged.value || pieceScroll.value < 0) {
			return {
				transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
			};
		} else {
			if (!isAnimated.value) {
				const absolute = scrollToAbsolute((-scroll.value + piece.scrollX) * 1.25 * size, 0);
				translateX.value = absolute.x;
				translateY.value = absolute.y;
			}
			const distance = scroll.value - pieceScroll.value;
			const absDistance = Math.abs(distance);
			const scale = absDistance >= 1 ? 0.66 : 1 - 0.34 * absDistance;
			const rotate = distance < -1 ? '45deg' : distance > 1 ? '-45deg' : -45 * distance + 'deg';
			const opacity = absDistance >= 4 ? 0 : 1 - 0.25 * absDistance;
			return {
				transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }, { rotate }],
				opacity,
			};
		}
	});

	return (
		<Animated.View style={[{ position: 'absolute', width: size, height: size }, animatedStyle]} pointerEvents={'box-only'}>
			<Image
				// source={{ uri: piece.image }}
				source={piece.image}
				style={{
					position: 'absolute',
					width: size,
					height: size,
					transform: [{ scale: 1.67 }],
				}}
			/>
		</Animated.View>
	);
};

export default Piece;
