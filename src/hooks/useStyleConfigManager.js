'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_STYLE_CONFIG } from '../config/editorConfig';

const LOCAL_STORAGE_KEY = 'buity_saved_styles';

export function useStyleConfigManager(initialCustomStyles = {}, setCustomStylesCallback, updatePreviewCallback) {
	const [savedStyleConfigs, setSavedStyleConfigs] = useState(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
			const initialConfigs = saved ? JSON.parse(saved) : [DEFAULT_STYLE_CONFIG];
			if (!initialConfigs.find(c => c.configName === DEFAULT_STYLE_CONFIG.configName)) {
				initialConfigs.unshift(DEFAULT_STYLE_CONFIG);
			}
			return initialConfigs;
		}
		return [DEFAULT_STYLE_CONFIG];
	});

	const [currentConfigName, setCurrentConfigName] = useState(DEFAULT_STYLE_CONFIG.configName);
	const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);

	// 使用 useEffect 确保初始样式与当前配置一致
	useEffect(() => {
		const currentConfig = savedStyleConfigs.find(c => c.configName === currentConfigName);
		if (currentConfig && setCustomStylesCallback) {
			setCustomStylesCallback(currentConfig.styles || {});
		} else if (setCustomStylesCallback) {
			// 如果找不到当前配置（例如被删除），则加载默认配置
			const defaultConfig = savedStyleConfigs.find(c => c.configName === DEFAULT_STYLE_CONFIG.configName) || DEFAULT_STYLE_CONFIG;
			setCustomStylesCallback(defaultConfig.styles || {});
			setCurrentConfigName(defaultConfig.configName);
		}
	}, [currentConfigName, savedStyleConfigs, setCustomStylesCallback]);

	// 保存当前样式配置
	const saveCurrentStyleConfig = useCallback((configName, currentStyles) => {
		const newConfig = {
			configName: configName || `样式配置 ${new Date().toLocaleString('zh-CN')}`,
			styles: { ...currentStyles } // 使用传入的当前样式
		};

		setSavedStyleConfigs(prevConfigs => {
			const updatedConfigs = [...prevConfigs];
			const existingIndex = updatedConfigs.findIndex(config => config.configName === newConfig.configName);

			if (existingIndex >= 0) {
				updatedConfigs[existingIndex] = newConfig;
			} else {
				updatedConfigs.push(newConfig);
			}

			if (typeof window !== 'undefined') {
				localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfigs));
			}
			return updatedConfigs;
		});

		setCurrentConfigName(newConfig.configName); // 更新当前配置名称
		setIsStyleManagerOpen(false); // 通常保存后关闭管理器

	}, []);

	// 加载样式配置
	const loadStyleConfig = useCallback((configName) => {
		const config = savedStyleConfigs.find(cfg => cfg.configName === configName);
		if (config && setCustomStylesCallback) {
			setCustomStylesCallback(config.styles || {}); // 更新外部 customStyles 状态
			setCurrentConfigName(config.configName);
			if (updatePreviewCallback) {
				updatePreviewCallback(config.styles || {}); // 更新预览
			}
			setIsStyleManagerOpen(false); // 通常加载后关闭管理器
		}
	}, [savedStyleConfigs, setCustomStylesCallback, updatePreviewCallback]);

	// 删除样式配置
	const deleteStyleConfig = useCallback((configName) => {
		if (configName === DEFAULT_STYLE_CONFIG.configName) return; // 不允许删除默认

		setSavedStyleConfigs(prevConfigs => {
			const updatedConfigs = prevConfigs.filter(cfg => cfg.configName !== configName);
			if (typeof window !== 'undefined') {
				localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfigs));
			}
			return updatedConfigs;
		});

		// 如果删除的是当前配置，切换到默认配置
		if (currentConfigName === configName) {
			loadStyleConfig(DEFAULT_STYLE_CONFIG.configName);
		}
	}, [currentConfigName, loadStyleConfig]);

	// 打开样式管理器
	const openStyleManager = useCallback(() => {
		setIsStyleManagerOpen(true);
	}, []);

	// 关闭样式管理器
	const closeStyleManager = useCallback(() => {
		setIsStyleManagerOpen(false);
	}, []);


	return {
		savedStyleConfigs,
		currentConfigName,
		setCurrentConfigName, // 暴露以便输入框可以双向绑定
		isStyleManagerOpen,
		openStyleManager,
		closeStyleManager,
		saveCurrentStyleConfig,
		loadStyleConfig,
		deleteStyleConfig
	};
} 