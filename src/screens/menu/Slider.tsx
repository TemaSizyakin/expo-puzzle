import React, { ReactElement, useContext, useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SlideProps } from './Slide';
import Wave, { Side } from './Wave';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import snapPoint from '../../utils/snapPoint';

interface SliderProps {
	index: number;
	children: ReactElement<SlideProps>;
	prevSlide?: ReactElement<SlideProps>;
	nextSlide?: ReactElement<SlideProps>;
	navigatePrev: () => void;
	navigateNext: () => void;
	gestureX: Animated.SharedValue<number>;
}

type AnimatedContext = {
	offsetX: number,
	offsetY: number,
};

const Slider = ({ index, children: currentSlide, prevSlide, nextSlide, navigatePrev, navigateNext, gestureX }: SliderProps) => {
	const window = useContext(WindowSizeContext);
	const handleWidth = window.width / 6;
	const handleY = 0.75 * window.height;
	const buttonSize = 0.85 * handleWidth;
	const activeSide = useSharedValue(Side.NONE);
	const leftX = useSharedValue(0);
	const leftY = useSharedValue(handleY);
	const rightX = useSharedValue(0);
	const rightY = useSharedValue(handleY);
	const isTransitioningLeft = useSharedValue(false);
	const isTransitioningRight = useSharedValue(false);
	const zIndexLeft = useSharedValue(0);
	useAnimatedReaction(
		() => {
			if (leftX.value > window.width / 2) {
				return leftX.value - window.width / 2;
			} else if (rightX.value > window.width / 2) {
				return -(rightX.value - window.width / 2);
			} else {
				return 0;
			}
		},
		data => {
			gestureX.value = data;
		},
	);
	const onGestureEvent = useAnimatedGestureHandler({
		onStart: ({ x, y }, context: AnimatedContext) => {
			if (x < handleWidth) {
				activeSide.value = Side.LEFT;
				zIndexLeft.value = 100;
				context.offsetX = leftX.value - x;
				context.offsetY = leftY.value - y;
			} else if (x > window.width - handleWidth) {
				activeSide.value = Side.RIGHT;
				zIndexLeft.value = 0;
				context.offsetX = window.width - rightX.value - x;
				context.offsetY = rightY.value - y;
			} else {
				activeSide.value = Side.NONE;
			}
		},
		onActive: ({ x, y }, context) => {
			if (activeSide.value === Side.LEFT) {
				// leftX.value = Math.max(x, marginWidth);
				leftX.value = context.offsetX + x;
				leftY.value = context.offsetY + y;
			} else if (activeSide.value === Side.RIGHT) {
				// rightX.value = Math.max(window.width - x, marginWidth);
				rightX.value = -context.offsetX + window.width - x;
				rightY.value = context.offsetY + y;
			}
		},
		onEnd: ({ x, velocityX, velocityY }) => {
			if (activeSide.value === Side.LEFT) {
				const snapPoints = [handleWidth, window.width];
				const dest = snapPoint(x, velocityX, snapPoints);
				isTransitioningLeft.value = dest === window.width;
				leftX.value = withSpring(
					dest,
					{
						velocity: velocityX,
						overshootClamping: isTransitioningLeft.value,
						restSpeedThreshold: isTransitioningLeft.value ? 100 : 0.01,
						restDisplacementThreshold: isTransitioningLeft.value ? 100 : 0.01,
					},
					() => {
						if (isTransitioningLeft.value) {
							runOnJS(navigatePrev)();
						}
					},
				);
				leftY.value = withSpring(handleY, { velocity: velocityY });
				activeSide.value = Side.NONE;
			} else if (activeSide.value === Side.RIGHT) {
				const snapPoints = [window.width - handleWidth, 0];
				const dest = snapPoint(x, velocityX, snapPoints);
				isTransitioningRight.value = dest === 0;
				rightX.value = withSpring(
					window.width - dest,
					{
						velocity: -velocityX,
						overshootClamping: isTransitioningRight.value,
						restSpeedThreshold: isTransitioningRight.value ? 100 : 0.01,
						restDisplacementThreshold: isTransitioningRight.value ? 100 : 0.01,
					},
					() => {
						if (isTransitioningRight.value) {
							runOnJS(navigateNext)();
						}
					},
				);
				rightY.value = withSpring(handleY, { velocity: velocityY });
				activeSide.value = Side.NONE;
			}
		},
	});
	useEffect(() => {
		leftX.value = 0;
		rightX.value = 0;
		leftX.value = withSpring(handleWidth);
		rightX.value = withSpring(handleWidth);
	}, [index, leftX, rightX, handleWidth]);

	const onPrevTap = () => {
		activeSide.value = Side.LEFT;
		zIndexLeft.value = 100;
		leftX.value = withTiming(window.width, { duration: 500 }, () => {
			runOnJS(navigatePrev)();
		});
	};

	const onNextTap = () => {
		activeSide.value = Side.RIGHT;
		zIndexLeft.value = 0;
		rightX.value = withTiming(window.width, { duration: 500 }, () => {
			runOnJS(navigateNext)();
		});
	};

	const leftSideStyle = useAnimatedStyle(() => ({
		zIndex: zIndexLeft.value,
	}));

	const animatedPrevButtonStyle = useAnimatedStyle(() => {
		return {
			top: leftY.value - buttonSize / 2,
			left: leftX.value - (handleWidth + buttonSize) / 2,
			zIndex: zIndexLeft.value + 1,
			opacity: Math.max(0, 1 - (3 * (leftX.value - handleWidth)) / window.width),
		};
	});

	const animatedNextButtonStyle = useAnimatedStyle(() => {
		return {
			top: rightY.value - buttonSize / 2,
			// left: window.width - rightX.value + (handleWidth-buttonSize)/2,
			right: rightX.value - (handleWidth + buttonSize) / 2,
			zIndexLeft: zIndexLeft.value - 1,
			zIndex: 11,
			opacity: Math.max(0, 1 - (3 * (rightX.value - handleWidth)) / window.width),
		};
	});

	return (
		<PanGestureHandler onGestureEvent={onGestureEvent}>
			<Animated.View style={StyleSheet.absoluteFill}>
				{currentSlide}
				{prevSlide && (
					<Animated.View style={[StyleSheet.absoluteFill, leftSideStyle]} pointerEvents="none">
						<Wave side={Side.LEFT} x={leftX} y={leftY}>
							{prevSlide}
						</Wave>
					</Animated.View>
				)}
				{nextSlide && (
					<View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
						<Wave side={Side.RIGHT} x={rightX} y={rightY}>
							{nextSlide}
						</Wave>
					</View>
				)}
				<Animated.View
					style={[
						{
							position: 'absolute',
							width: buttonSize,
							height: buttonSize,
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: buttonSize / 2,
							// borderWidth: 2,
							// borderColor: 'white',
							// backgroundColor: '#0002',
						},
						animatedPrevButtonStyle,
					]}>
					<Pressable onPress={onPrevTap}>
						<Image
							source={require('../../../assets/images/arrow.png')}
							style={{ width: 0.9 * buttonSize, height: 0.9 * buttonSize }}
						/>
					</Pressable>
				</Animated.View>
				<Animated.View
					style={[
						{
							position: 'absolute',
							width: buttonSize,
							height: buttonSize,
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: buttonSize / 2,
							// borderWidth: 2,
							// borderColor: 'white',
							// backgroundColor: '#0002',
						},
						animatedNextButtonStyle,
					]}>
					<Pressable onPress={onNextTap}>
						<Image
							source={require('../../../assets/images/arrow.png')}
							style={{ width: 0.9 * buttonSize, height: 0.9 * buttonSize, transform: [{ scaleX: -1 }] }}
						/>
					</Pressable>
				</Animated.View>
			</Animated.View>
		</PanGestureHandler>
	);
};

export default Slider;
