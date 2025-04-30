'use client'; // 如果你的主题依赖于客户端 API，可能需要这个

import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// 创建一个主题实例。
const theme = createTheme({
	palette: {
		primary: {
			main: '#556cd6', // 一个示例主色调
		},
		secondary: {
			main: '#19857b', // 一个示例次色调
		},
		error: {
			main: red.A400, // 使用导入的红色
		},
		// 你可以在这里自定义更多颜色、排版、间距等
	},
	typography: {
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),
	},
	// 可以添加组件的默认属性等
	// components: {
	//   MuiButton: {
	//     defaultProps: {
	//       disableElevation: true,
	//     },
	//   },
	// },
});

export default theme; 