import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import ThemeRegistry from '../components/ThemeRegistry';

export const metadata = {
	title: "Markdown Refiner",
	description: "Refine your markdown with AI",
};

export default async function RootLayout({ children }) {
	const locale = await getLocale();
	const messages = await getMessages(); // 获取由 request.ts 提供的消息

	return (
		<html lang={locale}>
			<body>
				<ThemeRegistry>
					<NextIntlClientProvider locale={locale} messages={messages}>
						{children}
					</NextIntlClientProvider>
				</ThemeRegistry>
			</body>
		</html>
	);
}
