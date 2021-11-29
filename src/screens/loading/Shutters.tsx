import React, { useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { WindowSizeContext } from '../../hooks/useWindowSize';

interface ShuttersProps {
	isOpened: boolean;
	backgroundColor: string;
	duration?: number;
}

const Shutters = ({ isOpened, backgroundColor, duration = 600 }: ShuttersProps) => {
	const window = useContext(WindowSizeContext);
	const borderRadius = Math.min(window.width, window.height) / 4;

	const opened = useSharedValue(isOpened ? 1 : 0);
	useEffect(() => {
		opened.value = withTiming(isOpened ? 1 : 0, { duration });
	}, [isOpened, opened, duration]);

	const topLeftAnimatedStyle = useAnimatedStyle(() => ({
		borderBottomRightRadius: 2 * borderRadius * opened.value,
		transform: [{ translateX: (-window.width / 2) * opened.value }, { translateY: (-window.height / 2) * opened.value }],
	}));
	const topRightAnimatedStyle = useAnimatedStyle(() => ({
		borderBottomLeftRadius: 2 * borderRadius * opened.value,
		transform: [{ translateX: (window.width / 2) * opened.value }, { translateY: (-window.height / 2) * opened.value }],
	}));
	const bottomLeftAnimatedStyle = useAnimatedStyle(() => ({
		borderTopRightRadius: 2 * borderRadius * opened.value,
		transform: [{ translateX: (-window.width / 2) * opened.value }, { translateY: (window.height / 2) * opened.value }],
	}));
	const bottomRightAnimatedStyle = useAnimatedStyle(() => ({
		borderTopLeftRadius: 2 * borderRadius * opened.value,
		transform: [{ translateX: (window.width / 2) * opened.value }, { translateY: (window.height / 2) * opened.value }],
	}));

	return (
		<View style={StyleSheet.absoluteFill}>
			<View style={{ flex: 0.5, flexDirection: 'row' }}>
				<Animated.View style={[{ flex: 0.5, backgroundColor }, topLeftAnimatedStyle]} />
				<Animated.View style={[{ flex: 0.5, backgroundColor }, topRightAnimatedStyle]} />
			</View>
			<View style={{ flex: 0.5, flexDirection: 'row' }}>
				<Animated.View style={[{ flex: 0.5, backgroundColor }, bottomLeftAnimatedStyle]} />
				<Animated.View style={[{ flex: 0.5, backgroundColor }, bottomRightAnimatedStyle]} />
			</View>
		</View>
	);
};

export default Shutters;
