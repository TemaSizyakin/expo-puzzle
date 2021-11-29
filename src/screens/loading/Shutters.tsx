import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { WindowSizeContext } from '../../hooks/useWindowSize';

interface ShuttersProps {
	opened: boolean;
	backgroundColor: string;
	duration?: number;
}

const Shutters = ({ opened, backgroundColor, duration = 600 }: ShuttersProps) => {
	const window = useContext(WindowSizeContext);
	const radius = Math.min(window.width, window.height) / 4;
	const topLeftAnimatedStyle = useAnimatedStyle(() => ({
		borderBottomRightRadius: withTiming(opened ? radius : 0, { duration: duration / 2 }),
		transform: [
			{ translateX: withTiming(opened ? -window.width / 2 : 0, { duration }) },
			{ translateY: withTiming(opened ? -window.height / 2 : 0, { duration }) },
		],
	}));
	const topRightAnimatedStyle = useAnimatedStyle(() => ({
		borderBottomLeftRadius: withTiming(opened ? radius : 0, { duration: duration / 2 }),
		transform: [
			{ translateX: withTiming(opened ? window.width / 2 : 0, { duration }) },
			{ translateY: withTiming(opened ? -window.height / 2 : 0, { duration }) },
		],
	}));
	const bottomLeftAnimatedStyle = useAnimatedStyle(() => ({
		borderTopRightRadius: withTiming(opened ? radius : 0, { duration: duration / 2 }),
		transform: [
			{ translateX: withTiming(opened ? -window.width / 2 : 0, { duration }) },
			{ translateY: withTiming(opened ? window.height / 2 : 0, { duration }) },
		],
	}));
	const bottomRightAnimatedStyle = useAnimatedStyle(() => ({
		borderTopLeftRadius: withTiming(opened ? radius : 0, { duration: duration / 2 }),
		transform: [
			{ translateX: withTiming(opened ? window.width / 2 : 0, { duration }) },
			{ translateY: withTiming(opened ? window.height / 2 : 0, { duration }) },
		],
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
