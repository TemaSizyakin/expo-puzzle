import { Image, Platform } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const DURATION = 250;
const DRAG_SCALE = 1.15;

export type PieceType = {
	id: string,
	boardX: number,
	boardY: number,
	scrollX: number,
	image: string,
	zIndex: number,
	solved: boolean,
};

interface PieceProps {
	piece: PieceType;
	size: number;
	scroll: Animated.SharedValue<number>;
	scrollToAbsolute: (x: number, y: number) => { x: number, y: number };
	boardToAbsolute: (x: number, y: number) => { x: number, y: number };
	absoluteToBoard: (x: number, y: number) => { x: number, y: number };
	updatePiece: (id: string, x: number, y: number) => void;
}

const Piece = ({ piece, size, scroll, scrollToAbsolute, boardToAbsolute, absoluteToBoard, updatePiece }: PieceProps) => {
	const translateX = useSharedValue(10 * size);
	const translateY = useSharedValue(0);
	const isAnimated = useSharedValue(false);
	const pieceScroll = useSharedValue(piece.scrollX);
	const dragged = useSharedValue(false);
	const zIndex = useSharedValue(piece.zIndex);

	const animate = useCallback(() => {
		isAnimated.value = true;
		setTimeout(() => {
			isAnimated.value = false;
		}, DURATION);
	}, [isAnimated]);

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
		zIndex.value = piece.zIndex;
	});

	const animatedStyle = useAnimatedStyle(() => {
		// If Dragged or on Board
		if (dragged.value || pieceScroll.value < 0) {
			return {
				transform: [
					{ translateX: translateX.value },
					{ translateY: translateY.value },
					{ scale: dragged.value ? withTiming(DRAG_SCALE, { duration: DURATION / 3 }) : 1 },
				],
				zIndex: zIndex.value,
			};
		} else {
			if (!isAnimated.value) {
				const absolute = scrollToAbsolute((-scroll.value + piece.scrollX) * 1.25 * size, 0);
				translateX.value = absolute.x;
				translateY.value = absolute.y;
			}
			const distance = scroll.value - pieceScroll.value;
			const absDistance = Math.abs(distance);
			const scale = absDistance >= 1 ? 0.6 : 1 - 0.4 * absDistance;
			const rotate = distance < -1 ? '45deg' : distance > 1 ? '-45deg' : -45 * distance + 'deg';
			return {
				transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }, { rotate }],
				zIndex: piece.zIndex,
			};
		}
	});

	const onGestureEvent = useAnimatedGestureHandler({
		onStart: (_, context: { startX: number, startY: number }) => {
			dragged.value = true;
			zIndex.value = 1000;
			context.startX = translateX.value;
			context.startY = translateY.value;
		},
		onActive: ({ translationX, translationY }, context) => {
			translateX.value = context.startX + translationX * (Platform.OS === 'ios' ? DRAG_SCALE : 1);
			translateY.value = context.startY + translationY * (Platform.OS === 'ios' ? DRAG_SCALE : 1);
		},
		onEnd: () => {
			pieceScroll.value = -1;
			const board = absoluteToBoard(translateX.value, translateY.value);
			runOnJS(updatePiece)(piece.id, board.x, board.y);
		},
		onCancel: () => {},
		onFinish: () => {
			dragged.value = false;
		},
	});

	return (
		<PanGestureHandler onGestureEvent={onGestureEvent} enabled={!piece.solved}>
			<Animated.View style={[{ position: 'absolute', width: size, height: size }, animatedStyle]} pointerEvents={'box-only'}>
				<Image
					source={{ uri: piece.image }}
					style={{
						position: 'absolute',
						width: size,
						height: size,
						transform: [{ scale: 1.67 }],
					}}
				/>
			</Animated.View>
		</PanGestureHandler>
	);
};

export default Piece;
