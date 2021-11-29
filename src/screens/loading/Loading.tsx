import React, { useEffect } from 'react';
import { View, Image, ImageStyle, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Images from '../../res/Images';
const AnimatedImage = Animated.createAnimatedComponent(Image);

const Duration = 2000;

interface LoadingProps {
	size: number;
	opened: boolean;
}

const Loading = ({ size, opened }: LoadingProps) => {
	const imageSize = 0.8 * size;
	const pieceStyle: ImageStyle = { position: 'absolute', width: imageSize, height: imageSize };

	const rotate = useSharedValue(0);
	const translate = useSharedValue(0);
	useEffect(() => {
		if (opened) {
			rotate.value = rotate.value;
			translate.value = withTiming(3, { duration: Duration / 4 });
		} else {
			rotate.value = withRepeat(withTiming(360, { duration: Duration }), -1, true);
			translate.value = withRepeat(withTiming(0.25, { duration: Duration / 2 }), -1, true);
		}
	}, [opened, rotate, translate]);
	const animatedViewStyle = useAnimatedStyle(() => ({
		transform: [{ rotateZ: `${rotate.value}deg` }],
	}));
	const pieces = [0, 1, 2, 3];
	const animatedPieceStyles = pieces.map(i =>
		useAnimatedStyle(() => ({
			transform: [
				{ translateX: (i === 1 || i === 2 ? 1 : -1) * imageSize * (0.3 + translate.value) },
				{ translateY: (i === 2 || i === 3 ? 1 : -1) * imageSize * (0.3 + translate.value) },
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
