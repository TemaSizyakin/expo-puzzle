import MaskedView from '@react-native-community/masked-view';
import React, { ReactElement, useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';
import { SlideProps } from './Slide';
import { WindowSizeContext } from '../../hooks/useWindowSize';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export enum Side {
	LEFT,
	RIGHT,
	NONE,
}

interface WaveProps {
	side: Side;
	children: ReactElement<SlideProps>;
	x: Animated.SharedValue<number>;
	y: Animated.SharedValue<number>;
}

const Wave = ({ side, children, x, y }: WaveProps) => {
	const window = useContext(WindowSizeContext);
	// { x, y } contains coordinates of gesture and the tip of the wave
	// x1 calculates the coordinate of wavefront
	const x1 = useDerivedValue(() => {
		return x.value < window.width / 3 ? 0 : 1.5 * x.value - 0.5 * window.width;
	});
	// Drawing an animated path using the cubic Bezier curves with relative coordinates (c)
	const animatedProps = useAnimatedProps(() => {
		const dX = x.value < window.width / 3 ? x.value / 2 : (window.width / 2 - x.value / 2) / 2;
		const dY = 0.75 * x.value;
		const C = dY * 0.552;

		return {
			d: [
				'M 0 0',
				`H ${x1.value}`,
				`V ${y.value - 2 * dY}`,
				`c 0 ${C} ${dX} ${dY} ${dX} ${dY}`,
				`c 0 0 ${dX} ${dY - C} ${dX} ${dY}`,
				`c 0 ${C} ${-dX} ${dY} ${-dX} ${dY}`,
				`c 0 0 ${-dX} ${dY - C} ${-dX} ${dY}`,
				`V ${window.height}`,
				'H 0',
				'Z',
			].join(' '),
		};
	});
	const maskElement = (
		<Svg style={[StyleSheet.absoluteFill, { transform: [{ rotateY: side === Side.RIGHT ? '180deg' : '0deg' }] }]}>
			<AnimatedPath animatedProps={animatedProps} fill={children.props.slide.color} />
		</Svg>
	);

	// Using the Svg wave path as a mask for a slide
	if (Platform.OS !== 'android') {
		return (
			<MaskedView style={StyleSheet.absoluteFill} maskElement={maskElement}>
				{children}
			</MaskedView>
		);
	}

	// As Android did not have hardware acceleration for masking, the fix is to move new Slide with the wave instead of masking it
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const androidStyle = useAnimatedStyle(() => {
		return { transform: [{ translateX: side === Side.RIGHT ? window.width - x1.value : -window.width + x1.value }] };
	});
	return (
		<View style={StyleSheet.absoluteFill}>
			{maskElement}
			<Animated.View style={[StyleSheet.absoluteFill, androidStyle]}>{children}</Animated.View>
		</View>
	);
};

export default Wave;
