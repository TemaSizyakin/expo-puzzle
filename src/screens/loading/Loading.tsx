import React, { useEffect } from 'react';
import { View, Image, ImageStyle, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Images from '../../res/Images';
const AnimatedImage = Animated.createAnimatedComponent(Image);

interface LoadingProps {
	size: number;
	isOpened: boolean;
	duration?: number;
}

const Loading = ({ size, isOpened, duration = 2000 }: LoadingProps) => {
	const imageSize = 0.8 * size;
	const pieceStyle: ImageStyle = { position: 'absolute', width: imageSize, height: imageSize };

	const opened = useSharedValue(isOpened ? 1 : 0);
	useEffect(() => {
		opened.value = withTiming(isOpened ? 1 : 0, { duration: duration / 4 });
	}, [isOpened, opened, duration]);
	const rotate = useSharedValue(0);
	const translate = useSharedValue(0);
	useEffect(() => {
		rotate.value = withRepeat(withTiming(360, { duration }), -1, true);
		translate.value = withRepeat(withTiming(0.25, { duration: duration / 2 }), -1, true);
	}, [rotate, translate, duration]);
	const animatedViewStyle = useAnimatedStyle(() => ({
		transform: [{ rotateZ: `${rotate.value}deg` }],
	}));
	const pieces = [0, 1, 2, 3];
	const animatedPieceStyles = pieces.map(i =>
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useAnimatedStyle(() => ({
			transform: [
				{ translateX: (i === 1 || i === 2 ? 1 : -1) * imageSize * (0.3 + translate.value + 3 * opened.value) },
				{ translateY: (i === 2 || i === 3 ? 1 : -1) * imageSize * (0.3 + translate.value + 3 * opened.value) },
				{ rotateZ: `${(i === 0 || i === 2 ? 1 : -2) * rotate.value + (i === 0 || i === 2 ? 90 : 0)}deg` },
			],
		})),
	);

	return (
		<View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
			<Animated.View style={[{ width: imageSize, height: imageSize }, animatedViewStyle]}>
				{pieces.map(i => (
					<AnimatedImage
						key={`piece${i}`}
						source={Images.UI.loadingPiece}
						style={[pieceStyle, animatedPieceStyles[i]]}
						resizeMode="cover"
					/>
				))}
			</Animated.View>
		</View>
	);
};

export default Loading;
