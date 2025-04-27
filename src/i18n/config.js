export const defaultLocale = 'zh-CN';
export const locales = ['zh-CN', 'en-US'];

// 检查提供的语言代码是否在支持的列表中，如果不在则返回默认语言
export const getLocale = (locale) => {
	if (!locale) return defaultLocale;

	const normalizedLocale = locale.toLowerCase();
	return locales.find(l => l.toLowerCase() === normalizedLocale) || defaultLocale;
};

// 获取语言的显示名称
export const getLanguageName = (locale) => {
	const names = {
		'zh-CN': '简体中文',
		'en-US': 'English'
	};
	return names[locale] || locale;
}; 