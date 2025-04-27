'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultLocale, locales, getLocale } from './config';

// 导入所有语言文件
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// 语言映射
const translations = {
	'zh-CN': zhCN,
	'en-US': enUS,
};

// 创建Context
export const I18nContext = createContext();

// 浏览器环境下从localStorage获取语言设置
const getBrowserLocale = () => {
	if (typeof window === 'undefined') return defaultLocale;

	const savedLocale = localStorage.getItem('locale');
	if (savedLocale) return getLocale(savedLocale);

	// 如果没有保存的偏好，尝试使用浏览器语言
	const browserLocale = navigator.language || navigator.userLanguage;
	return getLocale(browserLocale);
};

// Provider组件
export const I18nProvider = ({ children }) => {
	const [locale, setLocale] = useState(defaultLocale);

	// 初始化
	useEffect(() => {
		setLocale(getBrowserLocale());
	}, []);

	// 更改语言
	const changeLocale = useCallback((newLocale) => {
		const validLocale = getLocale(newLocale);
		setLocale(validLocale);
		if (typeof window !== 'undefined') {
			localStorage.setItem('locale', validLocale);
		}
	}, []);

	// 获取翻译
	const t = useCallback((key, params) => {
		const keys = key.split('.');
		let value = translations[locale];

		for (const k of keys) {
			if (!value) return key;
			value = value[k];
		}

		if (!value) return key;

		// 处理参数化翻译
		if (params && typeof value === 'string') {
			return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
				return params[paramKey] !== undefined ? params[paramKey] : match;
			});
		}

		return value || key;
	}, [locale]);

	const contextValue = {
		locale,
		locales,
		changeLocale,
		t,
	};

	return (
		<I18nContext.Provider value={contextValue}>
			{children}
		</I18nContext.Provider>
	);
};

// Hook用于访问翻译
export const useTranslation = () => {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error('useTranslation必须在I18nProvider内使用');
	}
	return context;
};

// HOC用于包装组件
export const withTranslation = (Component) => {
	return (props) => {
		const i18n = useTranslation();
		return <Component {...props} i18n={i18n} />;
	};
}; 