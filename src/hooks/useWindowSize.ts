import React, { useState, createContext } from 'react';
import { LayoutChangeEvent } from 'react-native';

const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 720;

export const WindowSizeContext: React.Context<{ width: number, height: number }> = createContext<{ width: number, height: number }>({
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
});

const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
	const onContainerLayout = (event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setWindowSize({ width, height });
	};
	return [windowSize, onContainerLayout] as const;
};

export default useWindowSize;
