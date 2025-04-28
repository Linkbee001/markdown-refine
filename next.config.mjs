import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
	// 指定 request.ts 的路径
	'./src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
	// 其他 Next.js 配置...
};

export default withNextIntl(nextConfig);
