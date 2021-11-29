import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PlayButton from './PlayButton';
import Slide from './Slide';
import Slider from './Slider';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Colors from '../../res/Colors';

interface HomeScreenProps {
	slides: Array<{ id: string, title: string, color: string, size: { x: number, y: number } }>;
	onPlay: (puzzle: number) => void;
}

const HomeScreen = ({ slides, onPlay }: HomeScreenProps) => {
	const window = useContext(WindowSizeContext);
	const [index, setIndex] = useState(0);
	const prev = index > 0 ? slides[index - 1] : slides[slides.length - 1];
	const next = index < slides.length - 1 ? slides[index + 1] : slides[0];
	const navigatePrev = () => {
		setIndex(index > 0 ? index - 1 : slides.length - 1);
	};
	const navigateNext = () => {
		setIndex(index < slides.length - 1 ? index + 1 : 0);
	};
	const gestureX = useSharedValue(0);
	const playOpacity = useSharedValue(1);
	const playTransition = useSharedValue(0);
	const playButtonAnimatedStyle = useAnimatedStyle(() => ({
		opacity: playOpacity.value,
		transform: [
			{ translateX: playTransition.value > 0 ? withSpring(0) : gestureX.value / 10 },
			{ scaleX: playTransition.value > 0 ? withSpring(1) : 1 + Math.abs(gestureX.value / 10) / window.width },
			{ scaleY: playTransition.value > 0 ? withSpring(1) : 1 - Math.abs(gestureX.value / 10) / window.width },
		],
	}));
	useEffect(() => {
		playTransition.value = 1;
		playTransition.value = withTiming(0, { duration: 1000 });
	}, [index]);

	const fill = useSharedValue(0);
	const fillColor = useSharedValue(Colors.red);
	const onPlayPress = () => {
		if (fill.value === 0) {
			fill.value = withTiming(8, { duration: 500 }, () => {
				runOnJS(onPlay)(index);
			});
			// fillColor.value = withDelay(200, withTiming(Colors.yellow));
			playOpacity.value = withTiming(0);
		}
	};
	const fillAnimatedStyle = useAnimatedStyle(() => ({
		backgroundColor: fillColor.value,
		transform: [{ scale: fill.value }],
	}));
	return (
		<View style={StyleSheet.absoluteFill}>
			<Slider
				key={index}
				index={index}
				prev={prev && <Slide slide={prev} />}
				next={next && <Slide slide={next} />}
				navigatePrev={navigatePrev}
				navigateNext={navigateNext}
				gestureX={gestureX}>
				<Slide slide={slides[index]} />
			</Slider>
			<Animated.View
				style={[
					{
						position: 'absolute',
						top: 0.75 * window.height,
						left: (window.width - 0.25 * window.height) / 2,
						width: 0.25 * window.height,
						height: 0.25 * window.height,
						borderRadius: 0.25 * window.height,
					},
					fillAnimatedStyle,
				]}
			/>
			<Animated.View
				style={[
					{
						position: 'absolute',
						top: 0.75 * window.height,
						width: 0.25 * window.width,
						height: 0.25 * window.height,
						alignSelf: 'center',
						alignItems: 'center',
						justifyContent: 'center',
						// backgroundColor: '#fff',
					},
					playButtonAnimatedStyle,
				]}>
				<PlayButton size={0.25 * window.width} onPress={onPlayPress} />
			</Animated.View>
		</View>
	);
};

export default HomeScreen;
