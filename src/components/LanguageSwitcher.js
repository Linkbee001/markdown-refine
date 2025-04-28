import React from 'react';
import { Box, Select, MenuItem } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { locales, getLanguageName } from '../i18n/config';

const LanguageSwitcher = ({ sx = {} }) => {
	const locale = useLocale();
	const t = useTranslations('common');

	const handleChange = (event) => {
		const newLocale = event.target.value;
		// 设置 cookie，有效期一年
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
		// 刷新页面以应用新语言
		window.location.reload();
	};

	return (
		<Box sx={{ minWidth: 120, ...sx }}>
			<Select
				value={locale}
				onChange={handleChange}
				size="small"
				sx={{
					'.MuiSelect-select': {
						py: 0.5,
						pl: 1.5
					},
					bgcolor: 'background.paper',
					'&:hover': {
						bgcolor: 'background.paper',
					},
				}}
			>
				{locales.map((loc) => (
					<MenuItem key={loc} value={loc}>
						{getLanguageName(loc)}
					</MenuItem>
				))}
			</Select>
		</Box>
	);
};

export default LanguageSwitcher; 