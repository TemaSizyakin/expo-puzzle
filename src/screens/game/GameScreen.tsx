import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import Colors from '../../res/Colors';
import Images from '../../res/Images';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import { useState } from 'react';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedGestureHandler, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Piece from './Piece';
import { PanGestureHandler } from 'react-native-gesture-handler';

interface GameScreenProps {
	puzzle: { id: string, size: { x: number, y: number } };
	onCloseGame: () => void;
}

type Rect = {
	x: number,
	y: number,
	width: number,
	height: number,
};
const initRect: Rect = { x: 0, y: 0, width: 0, height: 0 };

const GameScreen = ({ puzzle, onCloseGame }: GameScreenProps) => {
	// const [isLoading, setIsLoading] = useState(true);

	const WINDOW = useContext(WindowSizeContext);
	const [SIZE, setSIZE] = useState(0);
	const [SCROLL, setSCROLL] = useState<Rect>(initRect);
	const [BOARD, setBOARD] = useState<Rect>(initRect);
	useEffect(() => {
		const square = Math.min(WINDOW.height / (puzzle.size.y + 1.67 + 1.2), WINDOW.width / puzzle.size.x);
		setSIZE(square);
		setSCROLL({ x: 0, y: WINDOW.height - 1.67 * square, width: WINDOW.width, height: 1.67 * square });
		setBOARD({
			x: (WINDOW.width - square * puzzle.size.x) / 2,
			y: 0.6 * square,
			width: square * puzzle.size.x,
			height: square * puzzle.size.y,
		});
	}, [WINDOW, puzzle]);
	const scrollToAbsolute = (x: number, y: number) => {
		'worklet';
		return { x: x + WINDOW.width / 2 - 0.5 * SIZE, y: y + SCROLL.y + (SCROLL.height - SIZE) / 2 };
	};
	const boardToAbsolute = (x: number, y: number) => {
		'worklet';
		return { x: x * SIZE + BOARD.x, y: y * SIZE + BOARD.y };
	};
	const absoluteToBoard = (x: number, y: number) => {
		'worklet';
		return { x: (x - BOARD.x) / SIZE, y: (y - BOARD.y) / SIZE };
	};
	const [pieces, setPieces] = useState<Array<{ index: string, boardX: number, boardY: number, scrollX: number, image: number }>>([]);
	const [piecesInScroll, setPiecesInScroll] = useState(1);
	const scroll = useSharedValue(-Math.trunc((puzzle.size.x * puzzle.size.y) / 2));
	useEffect(() => {
		scroll.value = withDelay(500, withTiming(Math.floor((puzzle.size.x * puzzle.size.y) / 2), { duration: 1000 }));
	}, [scroll, puzzle]);

	useEffect(() => {
		const loadedPieces = [];
		let k = 0;
		for (let j = 0; j < puzzle.size.y; j++) {
			for (let i = 0; i < puzzle.size.x; i++) {
				const index = j + 1 + '' + (i + 1);
				// const image = `https://heroku-puzzle.herokuapp.com/images/${puzzle.id}/${index}.png`;
				const image = Images[puzzle.id][index];
				loadedPieces.push({ index, boardX: i, boardY: j, scrollX: k, image });
				k++;
			}
		}
		// const prefetchPromises = loadedPieces.map(piece => Image.prefetch(piece.image));
		// Promise.all(prefetchPromises).then(results => {
		// 	console.log(results);
		// 	setIsLoading(false);
		// });
		setPieces(loadedPieces);
		setPiecesInScroll(loadedPieces.length);
	}, [puzzle]);

	useEffect(() => {
		if (piecesInScroll === 0) {
			scroll.value = 0;
		} else if (scroll.value > piecesInScroll - 1) {
			scroll.value = withTiming(piecesInScroll - 1);
		}
	}, [piecesInScroll, scroll]);

	// let piecesInScroll = 0;
	// for (let i = 0; i < pieces.length; i++) {
	// 	if (pieces[i].scrollX >= 0) {
	// 		pieces[i].scrollX = piecesInScroll;
	// 		piecesInScroll++;
	// 	}
	// }
	// if (piecesInScroll === 0) {
	// 	scroll.value = 0;
	// } else if (scroll.value > piecesInScroll - 1) {
	// 	scroll.value = withTiming(piecesInScroll - 1);
	// }
	// console.log('Pieces in scroll:', piecesInScroll, scroll.value);

	const onGestureLeftScroll = useAnimatedGestureHandler({
		onStart: (_, context: { startX: number }) => {
			context.startX = WINDOW.width / 2 - scroll.value * SIZE;
		},
		onActive: ({ translationX }, context: { startX: number }) => {
			scroll.value = (WINDOW.width / 2 - context.startX - translationX) / SIZE;
			if (piecesInScroll === 0) {
				scroll.value = 0;
			} else if (scroll.value < -0.45) {
				scroll.value = -0.45;
			} else if (scroll.value > piecesInScroll - 0.55) {
				scroll.value = piecesInScroll - 0.55;
			}
			// console.log('Scroll value:', Math.trunc(scroll.value * 100) / 100, 'Pieces on Scroll:', piecesInScroll);
		},
		onEnd: ({ velocityX }) => {
			const dest = Math.max(-0.45, Math.min(piecesInScroll - 0.55, scroll.value - velocityX / 500));
			scroll.value = withSpring(Math.round(dest)); //withTiming(Math.round(scroll.value - velocityX / 500), { duration: 200 });
		},
	});

	// if (isLoading) {
	// 	return (
	// 		<View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.red }}>
	// 			<LottieView style={{ width: window.width / 2, height: window.width / 4 }} source={Images.lottieLoading} autoPlay />
	// 		</View>
	// 	);
	// }

	return (
		<View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: Colors.red }}>
			<Pressable onPress={onCloseGame}>
				<View
					style={{
						position: 'absolute',
						left: BOARD.x,
						top: BOARD.y,
						width: BOARD.width,
						height: BOARD.height,
						backgroundColor: '#fff4',
					}}
				/>
			</Pressable>
			<View
				style={{
					position: 'absolute',
					left: SCROLL.x,
					top: SCROLL.y,
					width: SCROLL.width,
					height: SCROLL.height,
					backgroundColor: '#fff4',
				}}
			/>
			<View>
				{pieces.map(piece => (
					<Piece
						key={'piece' + piece.index}
						piece={piece}
						size={SIZE}
						scroll={scroll}
						scrollToAbsolute={scrollToAbsolute}
						boardToAbsolute={boardToAbsolute}
						absoluteToBoard={absoluteToBoard}
					/>
				))}
			</View>
			<PanGestureHandler onGestureEvent={onGestureLeftScroll}>
				<Animated.View
					style={{
						position: 'absolute',
						width: WINDOW.width, //(WINDOW.width - SCROLL.height) / 2,
						height: SCROLL.height,
						bottom: 0,
						left: 0,
						backgroundColor: '#00000011',
					}}
				/>
			</PanGestureHandler>
		</View>
	);
};

export default GameScreen;
