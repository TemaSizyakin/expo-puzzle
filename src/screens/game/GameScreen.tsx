import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import Colors from '../../res/Colors';
import Images from '../../res/Images';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import { useState } from 'react';
import LottieView from 'lottie-react-native';
import { useSharedValue } from 'react-native-reanimated';
import Piece from './Piece';

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

	const window = useContext(WindowSizeContext);
	const [SquareSize, setSquareSize] = useState(0);
	const [Scroll, setScroll] = useState<Rect>(initRect);
	const [Board, setBoard] = useState<Rect>(initRect);
	useEffect(() => {
		const squareSize = Math.min(window.height / (puzzle.size.y + 1.67 + 1.2), window.width / puzzle.size.x);
		setSquareSize(squareSize);
		setScroll({ x: 0, y: window.height - 1.67 * squareSize, width: window.width, height: 1.67 * squareSize });
		setBoard({
			x: (window.width - squareSize * puzzle.size.x) / 2,
			y: 0.6 * squareSize,
			width: squareSize * puzzle.size.x,
			height: squareSize * puzzle.size.y,
		});
	}, [window, puzzle]);
	const [pieces, setPieces] = useState<Array<{ index: string, boardX: number, boardY: number, scrollX: number, image: number }>>([]);
	const scroll = useSharedValue(-Math.trunc((puzzle.size.x * puzzle.size.y) / 2));

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
	}, [puzzle]);

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
						left: Board.x,
						top: Board.y,
						width: Board.width,
						height: Board.height,
						backgroundColor: '#fff4',
					}}
				/>
			</Pressable>
			<View
				style={{
					position: 'absolute',
					left: Scroll.x,
					top: Scroll.y,
					width: Scroll.width,
					height: Scroll.height,
					backgroundColor: '#fff4',
				}}>
				{pieces.map(piece => (
					<Piece key={'piece' + piece.index} piece={piece} size={SquareSize} scroll={scroll} />
				))}
			</View>
		</View>
	);
};

export default GameScreen;
