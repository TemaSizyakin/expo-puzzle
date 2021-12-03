import React, { useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import Colors from '../../res/Colors';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Piece, { PieceType } from './Piece';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Lotties from '../../res/Lotties';
import { PieceUrl } from '../../res/Urls';

type Rect = {
	x: number,
	y: number,
	width: number,
	height: number,
};
const initRect: Rect = { x: 0, y: 0, width: 0, height: 0 };

interface GameScreenProps {
	puzzle: { id: string, size: { x: number, y: number }, color: string };
	onClosePress: () => void;
}

const GameScreen = ({ puzzle, onClosePress }: GameScreenProps) => {
	const [isLoading, setIsLoading] = useState(true);

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
	const [pieces, setPieces] = useState<Array<PieceType>>([]);
	const [piecesInScroll, setPiecesInScroll] = useState(1);
	const scroll = useSharedValue(-Math.trunc((puzzle.size.x * puzzle.size.y) / 2));
	useEffect(() => {
		scroll.value = withTiming(Math.floor((puzzle.size.x * puzzle.size.y) / 2), { duration: 1000 });
	}, [scroll, puzzle]);
	const topZIndex = useRef(10);

	useEffect(() => {
		const loadedPieces: Array<PieceType> = [];
		for (let j = 0; j < puzzle.size.y; j++) {
			for (let i = 0; i < puzzle.size.x; i++) {
				const id = j + 1 + '' + (i + 1);
				const image = PieceUrl(puzzle.id, id);
				// const image = Images[puzzle.id][id];
				loadedPieces.push({ id, boardX: i, boardY: j, scrollX: 0, image, zIndex: 0, solved: false });
			}
		}
		for (let m = loadedPieces.length - 1; m > 0; m--) {
			const n = Math.floor(Math.random() * m);
			const temp = loadedPieces[m];
			loadedPieces[m] = loadedPieces[n];
			loadedPieces[n] = temp;
		}
		for (let l = 0; l < loadedPieces.length; l++) {
			loadedPieces[l].scrollX = l;
		}
		const prefetchPromises = loadedPieces.map(piece => Image.prefetch(piece.image));
		Promise.all(prefetchPromises).then(results => {
			// console.log(results);
			setIsLoading(false);
		});
		// setIsLoading(false);
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

	const [gameOver, setGameOver] = useState(false);
	useEffect(() => {
		if (pieces.length > 0 && !gameOver) {
			let puzzleComplete = true;
			for (let i = 0; i < pieces.length; i++) {
				// if (pieces[i].id === 11 && !pieces[i].done) {
				if (!pieces[i].solved) {
					puzzleComplete = false;
					break;
				}
			}
			if (puzzleComplete) {
				setGameOver(true);
			}
		}
	}, [pieces, gameOver]);

	// noinspection DuplicatedCode
	const onGestureLeftScroll = useAnimatedGestureHandler({
		onStart: (_, context: { startX: number, moved: boolean }) => {
			context.moved = false;
			context.startX = WINDOW.width / 2 - scroll.value * SIZE;
		},
		onActive: ({ translationX }, context: { startX: number, moved: boolean }) => {
			context.moved = true;
			scroll.value = (WINDOW.width / 2 - context.startX - translationX) / SIZE;
			if (piecesInScroll === 0) {
				scroll.value = 0;
			} else if (scroll.value < -0.45) {
				scroll.value = -0.45;
			} else if (scroll.value > piecesInScroll - 0.55) {
				scroll.value = piecesInScroll - 0.55;
			}
		},
		onEnd: ({ velocityX }) => {
			const dest = Math.max(-0.45, Math.min(piecesInScroll - 0.55, scroll.value - velocityX / WINDOW.width));
			scroll.value = withSpring(Math.round(dest)); //withTiming(Math.round(dest), { duration: 200 });
		},
		onFinish: (_, context: { startX: number, moved: boolean }) => {
			if (!context.moved) {
				const roundedScroll = Math.round(scroll.value);
				if (roundedScroll > 0) {
					scroll.value = withTiming(roundedScroll - 1);
				}
			}
		},
	});

	// noinspection DuplicatedCode
	const onGestureRightScroll = useAnimatedGestureHandler({
		onStart: (_, context: { startX: number, moved: boolean }) => {
			context.moved = false;
			context.startX = WINDOW.width / 2 - scroll.value * SIZE;
		},
		onActive: ({ translationX }, context: { startX: number, moved: boolean }) => {
			context.moved = true;
			scroll.value = (WINDOW.width / 2 - context.startX - translationX) / SIZE;
			if (piecesInScroll === 0) {
				scroll.value = 0;
			} else if (scroll.value < -0.45) {
				scroll.value = -0.45;
			} else if (scroll.value > piecesInScroll - 0.55) {
				scroll.value = piecesInScroll - 0.55;
			}
		},
		onEnd: ({ velocityX }) => {
			const dest = Math.max(-0.45, Math.min(piecesInScroll - 0.55, scroll.value - velocityX / WINDOW.width));
			scroll.value = withSpring(Math.round(dest)); //withTiming(Math.round(dest), { duration: 200 });
		},
		onFinish: (_, context: { startX: number, moved: boolean }) => {
			if (!context.moved) {
				const roundedScroll = Math.round(scroll.value);
				if (roundedScroll < piecesInScroll - 1) {
					scroll.value = withTiming(roundedScroll + 1);
				}
			}
		},
	});

	const updatePiece = (id: string, boardX: number, boardY: number) => {
		let updatedPieceIndex = 0;
		let isOnBoard = true;
		const updatedPieces = pieces.map((piece, index: number) => {
			if (id === piece.id) {
				updatedPieceIndex = index;
				let zIndex = 10;
				let solved = false;
				let scrollX = -1;
				const intId = parseInt(piece.id, 10);
				const targetX = (intId % 10) - 1;
				const targetY = (intId - (intId % 10)) / 10 - 1;
				if (boardX < -0.5 || boardX > puzzle.size.x - 0.5 || boardY < -0.5 || boardY > puzzle.size.y - 0.5) {
					boardX = 0;
					boardY = 0;
					scrollX = 1;
					zIndex = 0;
					isOnBoard = false;
				} else if (Math.abs(boardX - targetX) < 0.25 && Math.abs(boardY - targetY) < 0.25) {
					boardX = targetX;
					boardY = targetY;
					solved = true;
				} else {
					zIndex = ++topZIndex.current;
				}
				return { id, boardX, boardY, scrollX, image: piece.image, zIndex, solved };
			}
			return piece;
		});
		if (isOnBoard) {
			updatedPieces.push(updatedPieces.splice(updatedPieceIndex, 1)[0]);
		} else {
			const current = Math.round(scroll.value);
			updatedPieces.splice(current, 0, updatedPieces.splice(updatedPieceIndex, 1)[0]);
		}
		let inScroll = 0;
		for (let i = 0; i < updatedPieces.length; i++) {
			if (updatedPieces[i].scrollX >= 0) {
				updatedPieces[i].scrollX = inScroll;
				inScroll++;
			}
		}
		setPieces(updatedPieces);
		setPiecesInScroll(inScroll);
	};

	const backgroundAnimatedColor = useAnimatedStyle(() => ({
		opacity: withTiming(isLoading ? 0 : 1, { duration: 500 }),
	}));

	const backButtonPressed = useSharedValue(false);
	const animatedBackButtonStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backButtonPressed.value ? 0.9 : 1 }],
	}));

	if (isLoading) {
		return (
			<View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.red }}>
				<LottieView style={{ width: WINDOW.width / 2, height: WINDOW.width / 4 }} source={Lotties.loading} autoPlay />
			</View>
		);
	}

	return (
		<View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: Colors.red }}>
			<Animated.View style={[{ ...StyleSheet.absoluteFillObject, backgroundColor: puzzle.color }, backgroundAnimatedColor]} />
			<View
				style={{
					position: 'absolute',
					left: BOARD.x,
					top: BOARD.y,
					width: BOARD.width,
					height: BOARD.height,
					backgroundColor: '#0001',
					borderRadius: BOARD.width / 50,
					borderColor: 'white',
					borderWidth: StyleSheet.hairlineWidth,
				}}
			/>
			<View
				style={{
					position: 'absolute',
					left: WINDOW.width / 2 - 0.75 * SIZE,
					bottom: 0.085 * SIZE,
					width: 1.5 * SIZE,
					height: 1.5 * SIZE,
					borderRadius: 0.75 * SIZE,
					backgroundColor: Colors.coral,
				}}>
				<LottieView
					style={{ width: 1.5 * SIZE, height: 1.5 * SIZE, transform: [{ scale: 1.15 }] }}
					source={Lotties.circle}
					autoPlay
				/>
			</View>
			<View
				style={{
					position: 'absolute',
					left: SCROLL.x,
					top: SCROLL.y,
					width: SCROLL.width,
					height: SCROLL.height,
					// backgroundColor: '#0004',
				}}
			/>

			<Animated.View
				style={[
					{
						position: 'absolute',
						left: -SIZE / 3,
						top: -SIZE / 2,
						width: SIZE,
						height: SIZE,
						borderBottomRightRadius: SIZE / 2,
						backgroundColor: Colors.red,
					},
					animatedBackButtonStyle,
				]}>
				<Pressable
					style={{ position: 'absolute', left: 0.45 * SIZE, bottom: 0.1 * SIZE }}
					onPressIn={() => {
						backButtonPressed.value = true;
					}}
					onPressOut={() => {
						backButtonPressed.value = false;
					}}
					onPress={onClosePress}>
					<View>
						<AntDesign name="arrowleft" size={SIZE / 3} color="white" />
					</View>
				</Pressable>
			</Animated.View>
			<View>
				{pieces.map(piece => (
					<Piece
						key={'piece' + piece.id}
						piece={piece}
						size={SIZE}
						scroll={scroll}
						scrollToAbsolute={scrollToAbsolute}
						boardToAbsolute={boardToAbsolute}
						absoluteToBoard={absoluteToBoard}
						updatePiece={updatePiece}
					/>
				))}
			</View>
			<PanGestureHandler onGestureEvent={onGestureLeftScroll}>
				<Animated.View
					style={{
						position: 'absolute',
						width: (WINDOW.width - SCROLL.height) / 2,
						height: SCROLL.height,
						bottom: 0,
						left: 0,
						// backgroundColor: '#0001',
					}}
				/>
			</PanGestureHandler>
			<PanGestureHandler onGestureEvent={onGestureRightScroll}>
				<Animated.View
					style={{
						position: 'absolute',
						width: (WINDOW.width - SCROLL.height) / 2,
						height: SCROLL.height,
						bottom: 0,
						right: 0,
						// backgroundColor: '#0001',
					}}
				/>
			</PanGestureHandler>
			{gameOver && (
				<View style={{ ...StyleSheet.absoluteFillObject, zIndex: 1000 }} pointerEvents="none">
					<LottieView source={Lotties.confetti} autoPlay loop style={StyleSheet.absoluteFill} />
				</View>
			)}
		</View>
	);
};

export default GameScreen;
