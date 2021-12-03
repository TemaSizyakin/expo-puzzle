import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PlayButton from './PlayButton';
import Slide from './Slide';
import Slider from './Slider';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Colors from '../../res/Colors';
import { Puzzle } from '../../../App';
import LottieView from 'lottie-react-native';
import Lotties from '../../res/Lotties';
import { useAssets } from 'expo-asset';
import Images from '../../res/Images';

interface HomeScreenProps {
	slides: Array<Puzzle>;
	onPlayPress: (index: number) => void;
}

const MenuScreen = ({ slides, onPlayPress }: HomeScreenProps) => {
	const WINDOW = useContext(WindowSizeContext);

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

	const [isLoading, setIsLoading] = useState(true);
	const covers = slides.map(puzzle => Images[puzzle.id].cover);
	const [assetsLoaded] = useAssets(covers);
	useEffect(() => {
		if (assetsLoaded) {
			setIsLoading(false);
		}
	}, [assetsLoaded]);
	// useEffect(() => {
	// 	const prefetchPromises = slides.map(slide => Image.prefetch(CoverUrl(slide.id)));
	// 	Promise.all(prefetchPromises).then(results => {
	// 		console.log(results);
	// 		setIsLoading(false);
	// 	});
	// }, [slides]);

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
			{ scaleX: playButtonTransition.value === 0 ? 1 + Math.abs(gestureX.value / 10) / WINDOW.width : withSpring(1) },
			{ scaleY: playButtonTransition.value === 0 ? 1 - Math.abs(gestureX.value / 10) / WINDOW.width : withSpring(1) },
		],
	}));

	// Animated style of circular colored fill view after pressing the Play button
	const fill = useSharedValue(0);
	const fillColor = useSharedValue(Colors.red);
	const fillAnimatedStyle = useAnimatedStyle(() => ({
		backgroundColor: fillColor.value,
		transform: [{ scale: 8 * fill.value }],
	}));
	const onPlayButtonPress = () => {
		if (fill.value === 0) {
			fill.value = withTiming(1, { duration: 500 }, () => {
				runOnJS(onPlayPress)(index);
			});
			// fillColor.value = withDelay(200, withTiming(Colors.yellow));
			playButtonOpacity.value = withTiming(0);
		}
	};

	if (isLoading) {
		return (
			<View
				style={{
					...StyleSheet.absoluteFillObject,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: currentSlide.color,
				}}>
				<LottieView style={{ width: WINDOW.width / 2, height: WINDOW.width / 4 }} source={Lotties.loading} autoPlay />
			</View>
		);
	}

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
						top: 0.75 * WINDOW.height,
						left: (WINDOW.width - 0.25 * WINDOW.height) / 2,
						width: 0.25 * WINDOW.height,
						height: 0.25 * WINDOW.height,
						borderRadius: 0.25 * WINDOW.height,
					},
					fillAnimatedStyle,
				]}
			/>
			<Animated.View
				style={[
					{
						position: 'absolute',
						top: 0.75 * WINDOW.height,
						width: 0.25 * WINDOW.width,
						height: 0.25 * WINDOW.height,
						alignSelf: 'center',
						alignItems: 'center',
						justifyContent: 'center',
						// backgroundColor: '#fff',
					},
					playButtonAnimatedStyle,
				]}>
				<PlayButton size={0.25 * WINDOW.width} onPress={onPlayButtonPress} />
			</Animated.View>
		</View>
	);
};

export default MenuScreen;
