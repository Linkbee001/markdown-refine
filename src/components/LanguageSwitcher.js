import React from 'react';
import { Box, Select, MenuItem } from '@mui/material';
import { useTranslation } from '../i18n';
import { getLanguageName } from '../i18n/config';

const LanguageSwitcher = ({ sx = {} }) => {
	const { locale, locales, changeLocale } = useTranslation();

	const handleChange = (event) => {
		changeLocale(event.target.value);
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