import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers'; // 用于读取 cookie
import { defaultLocale, locales } from './config'; // 从你的配置导入

export default getRequestConfig(async () => {
	// 尝试从 cookie 读取用户选择的语言
	const cookieStore = await cookies();
	const savedLocale = cookieStore.get('NEXT_LOCALE')?.value;

	// 如果 cookie 中有有效的语言，则使用它
	const locale = (savedLocale && locales.includes(savedLocale)) ? savedLocale : defaultLocale;

	console.log(`[i18n Request] Using locale: ${locale}`); // 添加日志

	return {
		locale,
		messages: (await import(`./locales/${locale}.js`)).default
	};
}); 