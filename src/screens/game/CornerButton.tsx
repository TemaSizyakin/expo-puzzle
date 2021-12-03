import React, { useContext, useEffect } from 'react';
import { Pressable } from 'react-native';
import Colors from '../../res/Colors';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

interface CornerButtonProps {
	isLeft: boolean;
	iconFA: 'arrow-left' | 'question';
	onPress: () => void;
	isVisible: boolean;
}

const CornerButton = ({ isLeft, iconFA, onPress, isVisible }: CornerButtonProps) => {
	const WINDOW = useContext(WindowSizeContext);
	const SIZE = WINDOW.width / 4;

	const isPressed = useSharedValue(1); // 0..1
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: isPressed.value * -0.5 * SIZE }, { translateX: isPressed.value * (isLeft ? -0.5 : 0.5) * SIZE }],
	}));
	useEffect(() => {
		isPressed.value = withDelay(400, withTiming(isVisible ? 0 : 1));
	}, [isVisible, isPressed]);

	return (
		<Animated.View
			style={[
				{
					position: 'absolute',
					left: isLeft ? -SIZE / 2 : undefined,
					right: isLeft ? undefined : -SIZE / 2,
					top: -SIZE / 2,
					width: SIZE,
					height: SIZE,
					alignItems: 'center',
					justifyContent: 'center',
					borderBottomRightRadius: isLeft ? SIZE / 2 : 0,
					borderBottomLeftRadius: isLeft ? 0 : SIZE / 2,
					backgroundColor: Colors.red,
				},
				animatedStyle,
			]}>
			<Pressable
				style={{ top: 0.2 * SIZE, left: isLeft ? 0.2 * SIZE : undefined, right: isLeft ? undefined : 0.2 * SIZE }}
				hitSlop={0.25 * SIZE}
				onPress={() => {
					if (isPressed.value === 0) {
						// console.log('Pressed ' + iconFA);
						isPressed.value = withTiming(1, { duration: 200 });
						onPress();
					}
				}}>
				<FontAwesome name={iconFA} size={SIZE / 4} color="white" />
			</Pressable>
		</Animated.View>
	);
};

export default CornerButton;
