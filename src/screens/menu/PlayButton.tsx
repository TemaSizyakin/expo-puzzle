import React from 'react';
import { Image, Pressable } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Colors from '../../res/Colors';
import Images from '../../res/Images';

interface PlayButtonProps {
	size: number;
	onPress: Function;
}

const PlayButton = ({ size, onPress }: PlayButtonProps) => {
	const isPressed = useSharedValue(false);
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				scale: isPressed.value
					? withTiming(0.85, { easing: Easing.inOut(Easing.ease), duration: 200 })
					: withTiming(1, { easing: Easing.elastic(2), duration: 500 }),
			},
		],
	}));
	return (
		<Pressable
			onPressIn={() => {
				isPressed.value = true;
			}}
			onPressOut={() => {
				isPressed.value = false;
			}}
			onPress={() => {
				onPress();
			}}>
			<Animated.View
				style={[
					{
						width: size,
						height: size,
						backgroundColor: Colors.red,
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: size / 2,
					},
					animatedStyle,
				]}>
				<Image source={Images.UI.playIcon} style={{ width: 0.65 * size, height: 0.65 * size }} />
			</Animated.View>
		</Pressable>
	);
};

export default PlayButton;
