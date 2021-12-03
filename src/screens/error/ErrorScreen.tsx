import React, { useContext } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Colors from '../../res/Colors';
import { Ionicons } from '@expo/vector-icons';
import { WindowSizeContext } from '../../hooks/useWindowSize';
import Fonts from '../../res/Fonts';

interface ErrorScreenProps {
	error?: string;
	onRefreshPress: () => void;
}

const ErrorScreen = ({ error, onRefreshPress }: ErrorScreenProps) => {
	const window = useContext(WindowSizeContext);
	return (
		<View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' }}>
			<Text style={{ fontFamily: Object.keys(Fonts)[0], fontSize: window.width / 40, color: 'white' }}>{error}</Text>
			<Pressable
				onPress={() => {
					onRefreshPress();
				}}
				style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.9 : 1 }] })}>
				<Ionicons name="refresh-circle" size={window.width / 8} color="white" />
			</Pressable>
		</View>
	);
};

export default ErrorScreen;
