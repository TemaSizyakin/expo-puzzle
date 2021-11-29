import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PlayButton from './PlayButton';
import Slide from './Slide';
import Slider from './Slider';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Colors from '../../res/Colors';

interface HomeScreenProps {
	slides: Array<{ id: string, title: string, color: string }>;
	onPlay: (index: number) => void;
}

const MenuScreen = ({ slides, onPlay }: HomeScreenProps) => {
	const window = useContext(WindowSizeContext);

	const [index, setIndex] = useState(0);
	const currentSlide = slides[index];
	const prevSlide = index > 0 ? slides[index - 1] : slides[slides.length - 1];
	const nextSlide = index < slides.length - 1 ? slides[index + 1] : slides[0];
	const navigatePrev = () => {
		setIndex(index > 0 ? index - 1 : slides.length - 1);
	};
	const navigateNext = () => {
		setIndex(index < slides.length - 1 ? index + 1 : 0);
	};

	// Animated style of Play button with slight movements
	const gestureX = useSharedValue(0);
	const playButtonOpacity = useSharedValue(1);
	const playButtonTransition = useSharedValue(0);
	useEffect(() => {
		playButtonTransition.value = 1;
		playButtonTransition.value = withTiming(0, { duration: 1000 });
	}, [index, playButtonTransition]);
	const playButtonAnimatedStyle = useAnimatedStyle(() => ({
		opacity: playButtonOpacity.value,
		transform: [
			{ translateX: playButtonTransition.value === 0 ? gestureX.value / 10 : withSpring(0) },
			{ scaleX: playButtonTransition.value === 0 ? 1 + Math.abs(gestureX.value / 10) / window.width : withSpring(1) },
			{ scaleY: playButtonTransition.value === 0 ? 1 - Math.abs(gestureX.value / 10) / window.width : withSpring(1) },
		],
	}));

	// Animated style of circular colored fill view after pressing the Play button
	const fill = useSharedValue(0);
	const fillColor = useSharedValue(Colors.red);
	const fillAnimatedStyle = useAnimatedStyle(() => ({
		backgroundColor: fillColor.value,
		transform: [{ scale: 8 * fill.value }],
	}));
	const onPlayPress = () => {
		if (fill.value === 0) {
			fill.value = withTiming(1, { duration: 500 }, () => {
				runOnJS(onPlay)(index);
			});
			// fillColor.value = withDelay(200, withTiming(Colors.yellow));
			playButtonOpacity.value = withTiming(0);
		}
	};

	return (
		<View style={StyleSheet.absoluteFill}>
			<Slider
				key={index}
				index={index}
				prevSlide={prevSlide && <Slide slide={prevSlide} />}
				nextSlide={nextSlide && <Slide slide={nextSlide} />}
				navigatePrev={navigatePrev}
				navigateNext={navigateNext}
				gestureX={gestureX}>
				<Slide slide={currentSlide} />
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

export default MenuScreen;
