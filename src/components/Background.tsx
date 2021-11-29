import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../res/Colors';

const Background = () => {
	return <View style={styles.container} />;
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: Colors.indigo,
	},
});

export default Background;
