# Markdown Beautifier

<p align="center">
  <img src="public/logo.png" alt="Markdown Beautifier Logo" width="200" height="200" />
</p>

<p align="center">
  <a href="README.md">中文</a> | <a href="README.en.md">English</a>
</p>

A powerful Markdown beautification tool that uses AI technology to help you optimize the formatting and styling of Markdown documents, making them more professional and visually appealing.

## ✨ Features

- 🤖 **AI-Driven Beautification**: Use artificial intelligence to optimize Markdown formatting and presentation
- 🎨 **Style Editor**: Visually edit HTML element styles, adjust typography, colors, and layout
- 📱 **Responsive Design**: Perfect adaptation for desktop and mobile devices
- 🌐 **Internationalization**: Support for Chinese and English interfaces
- 📤 **Multi-Format Export**: Export as HTML, Markdown, and image formats
- 🔄 **Real-time Preview**: Instantly view beautification effects
- 🧩 **Component-Based Layout**: Flexibly adjust document structure
- 📊 **Content Outline**: Automatically generate document structure outline

## 🛠️ Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Material UI](https://mui.com/) - UI component library
- [OpenRouter](https://openrouter.ai/) / [OpenAI](https://openai.com/) / [Anthropic](https://www.anthropic.com/) - Provides AI model support

## 📦 Installation

1. Clone the repository

```bash
git clone https://github.com/username/markdown-beautifier.git
cd markdown-beautifier
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment variables file

Copy the example environment variables file and modify as needed:

```bash
cp .env.example .env.local
```

Make sure to configure at least the necessary API keys:
- For frontend: `NEXT_PUBLIC_AI_API_KEY`
- For backend: `AI_API_KEY`

If there's no example file in your environment, you can manually create `.env.local` with the following content:

```
# Backend LLM Configuration
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://openrouter.ai/api/v1
AI_DEFAULT_MODEL=anthropic/claude-3.7-sonnet
AI_FALLBACK_MODEL=anthropic/claude-3-haiku
AI_OUTLINE_MODEL=anthropic/claude-3.7-sonnet
AI_DEFAULT_TEMPERATURE=0.1
AI_OUTLINE_TEMPERATURE=0.0

# Frontend AI API Configuration
NEXT_PUBLIC_AI_API_URL=https://api.openrouter.ai/api/v1/chat/completions
NEXT_PUBLIC_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_AI_MODEL_NAME=anthropic/claude-3-haiku-20240307
NEXT_PUBLIC_AI_MAX_TOKENS=4000
NEXT_PUBLIC_AI_TEMPERATURE=0.7

# Application Info
NEXT_PUBLIC_APP_NAME=Markdown Beautifier
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Visit [http://localhost:3000](http://localhost:3000) to view the application

## 🚀 Usage

1. Enter or paste Markdown content in the main editor
2. Input style prompt (e.g., "Use a clean, professional tech blog style...")
3. Click the "AI Beautify" button
4. View the beautified result and adjust styles as needed
5. Export to the desired format (HTML, image, or Markdown)

## ⚙️ Configuration

### AI API Configuration

This project uses external AI API services to implement Markdown beautification. You need to configure the following AI-related environment variables in your `.env.local` file:

```
# AI API Configuration
NEXT_PUBLIC_AI_API_URL=https://api.openrouter.ai/api/v1/chat/completions  # AI API endpoint
NEXT_PUBLIC_AI_API_KEY=your_api_key_here  # API key
NEXT_PUBLIC_AI_MODEL_NAME=anthropic/claude-3-haiku-20240307  # Default model name
NEXT_PUBLIC_AI_MAX_TOKENS=4000  # Maximum output tokens
NEXT_PUBLIC_AI_TEMPERATURE=0.7  # Temperature parameter, controls output randomness
NEXT_PUBLIC_AI_SUPPORTED_MODELS=anthropic/claude-3-haiku-20240307,openai/gpt-3.5-turbo  # Supported models list (comma-separated)
```

### LLM Service Configuration (Backend)

The backend API uses LangChain and LangGraph to process Markdown files and generate beautified HTML. You can customize LLM service behavior by configuring the following environment variables in your `.env.local` file:

```
# LLM Service Configuration (for backend API)
AI_API_KEY=your_api_key_here  # Backend API key (required)
AI_BASE_URL=https://openrouter.ai/api/v1  # API base URL

# Model Configuration
AI_DEFAULT_MODEL=anthropic/claude-3.7-sonnet  # Default model
AI_FALLBACK_MODEL=anthropic/claude-3-haiku  # Fallback model (when default is unavailable)
AI_OUTLINE_MODEL=anthropic/claude-3.7-sonnet  # Model for document outline generation

# Generation Parameters
AI_DEFAULT_TEMPERATURE=0.1  # Default temperature parameter 
AI_OUTLINE_TEMPERATURE=0.0  # Outline generation temperature (lower for deterministic results)

# Application Info (for API request headers)
NEXT_PUBLIC_APP_NAME=Markdown Beautifier  # Application name
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Application URL
```

If you don't set some of the variables above, the system will use default values. However, `AI_API_KEY` is required - without it, the beautification feature will not work.

#### Supported AI Service Providers

The project supports the following AI service providers by default (via OpenRouter or direct API):

1. **OpenRouter** (recommended)
   - Supports multiple models, including Anthropic Claude and OpenAI GPT series
   - Get API key: [OpenRouter](https://openrouter.ai/)

2. **OpenAI**
   - Supports GPT-3.5-Turbo and GPT-4 series models
   - Get API key: [OpenAI Platform](https://platform.openai.com/)
   - Set `NEXT_PUBLIC_AI_API_URL=https://api.openai.com/v1/chat/completions`

3. **Anthropic**
   - Supports Claude series models
   - Get API key: [Anthropic Console](https://console.anthropic.com/)
   - Set `NEXT_PUBLIC_AI_API_URL=https://api.anthropic.com/v1/messages`

#### Configuring Custom AI Models

To use different AI models, modify the `NEXT_PUBLIC_AI_MODEL_NAME` environment variable. The default value is `anthropic/claude-3-haiku-20240307`.

Available models depend on your chosen AI service provider. If using OpenRouter, you can view the list of supported models at [OpenRouter Models](https://openrouter.ai/models).

### Internationalization

This project supports both Chinese and English languages. Language configuration files are located in the `src/i18n/locales/` directory.

To add a new language:

1. Create a new language file in the `src/i18n/locales/` directory, e.g., `ja-JP.js`
2. Update the `locales` array and `getLanguageName` function in `src/i18n/config.js`
3. Import the new language file and update the `translations` object in `src/i18n/index.js`

```javascript
// Import new language file
import jaJP from './locales/ja-JP';

// Update language mapping
const translations = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
};
```

### Application Configuration

In addition to AI-related environment variables, you can set the following environment variables to configure the application:

```
# Application Settings
NEXT_PUBLIC_APP_NAME=Markdown Beautifier  # Application name
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Application URL
NEXT_PUBLIC_ENABLE_ANALYTICS=false  # Whether to enable analytics
NEXT_PUBLIC_MAX_CONTENT_LENGTH=50000  # Maximum content length limit (number of characters)
```

## 🧑‍💻 Development

### Directory Structure

```
markdown-beautifier/
├── public/            # Static assets
├── src/               # Source code
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   ├── i18n/          # Internationalization setup
│   │   └── locales/   # Language files
│   ├── utils/         # Utility functions
│   │   └── aiService.js  # AI service module
│   └── styles/        # Style files
├── .env.example       # Environment variables example
├── next.config.mjs    # Next.js configuration
└── package.json       # Project dependencies
```

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Start Production Server

```bash
npm start
# or
yarn start
# or
pnpm start
```

## 📝 Contributing Guidelines

Contributions through code, issues, or improvement suggestions are welcome!

1. Fork the repository
2. Create a new branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- [Next.js Team](https://nextjs.org/)
- [Material UI Team](https://mui.com/)
- [OpenRouter](https://openrouter.ai/)
- All contributors

---

<p align="center">Made with ❤️</p> 