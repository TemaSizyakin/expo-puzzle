import React, { useContext } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import Images from '../../res/Images';

export interface SlideProps {
	slide: {
		id: string,
		title: string,
		color: string,
	};
}

const Slide = ({ slide: { id, title, color } }: SlideProps) => {
	const window = useContext(WindowSizeContext);
	const titleHeight = window.width / 6;
	const imageSize = { width: 0.55 * window.width, height: (14 / 11) * 0.55 * window.width, transform: [{ scale: 1.18 }] };
	const imageTop = titleHeight + (0.75 * window.height - imageSize.height - titleHeight / 2) / 2;
	const titleTop = Math.max(0, imageTop / 2 - titleHeight / 2);
	return (
		<View style={[StyleSheet.absoluteFill, { alignItems: 'center', backgroundColor: color }]}>
			<View
				style={{
					position: 'absolute',
					top: titleTop,
					justifyContent: 'center',
					height: titleHeight,
				}}>
				<Text style={{ fontFamily: 'GandiaBold', fontSize: titleHeight / 2, color: 'white' }}>{title}</Text>
			</View>
			<View style={{ position: 'absolute', top: imageTop, justifyContent: 'center' }}>
				<Image source={Images[id].cover} style={imageSize} />
			</View>
		</View>
	);
};

export default Slide;
