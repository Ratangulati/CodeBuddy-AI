# 🤖 AI Code Review Bot (Gemini)

A GitHub Action that automatically reviews pull requests using Google's Gemini AI API. This bot provides intelligent, constructive feedback on code changes to help improve code quality and catch potential issues early.

## ✨ Features

- **Intelligent Code Review**: Uses Google's Gemini 1.5 Flash model for comprehensive code analysis
- **Smart File Filtering**: Automatically excludes lock files, large files, and other non-reviewable content
- **Detailed Feedback**: Provides structured feedback covering code quality, security, performance, and best practices
- **Rich Context**: Includes PR title, description, and change statistics in the review
- **Professional Formatting**: Well-formatted comments with emojis and clear structure
- **Error Handling**: Robust error handling with detailed logging
- **Configurable**: Easy to customize and extend

## 🚀 Quick Start

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for later use

### 2. Set up the GitHub Action

Create a `.github/workflows/ai-review.yml` file in your repository:

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: AI Code Review
        uses: your-username/ai-code-review-bot@main
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

### 3. Add the API Key as a Secret

1. Go to your repository's **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GEMINI_API_KEY`
4. Value: Your Gemini API key from step 1

## 📋 Usage

The action will automatically run on:
- New pull requests (`opened`)
- New commits to existing PRs (`synchronize`)
- Reopened pull requests (`reopened`)

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `gemini_api_key` | Your Gemini API key | No* | - |

*Required if `GEMINI_API_KEY` environment variable is not set

### Example Output

The bot will post a comment like this on your PR:

```
🤖 AI Code Review

📊 Review Summary:
- Files reviewed: 3/5
- Total changes: 45 lines
- Files excluded: 2 (large files, lock files, etc.)

## Overall Assessment
The changes look good overall with some minor improvements needed...

## Specific Issues
1. **Line 23**: Consider adding input validation...
2. **Line 45**: This function could benefit from error handling...

## Suggestions for Improvement
- Add JSDoc comments for better documentation
- Consider extracting the validation logic into a separate function
- Add unit tests for the new functionality

## Security Considerations
- No security issues detected
- Input sanitization looks appropriate

## Performance Implications
- The new caching mechanism should improve performance
- Consider memoization for expensive calculations
```

## 🔧 Configuration

### File Filtering

The bot automatically excludes certain file types from review:

- Lock files: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Minified files: `*.min.js`, `*.min.css`
- Bundle files: `*.bundle.js`, `*.bundle.css`
- System files: `.DS_Store`, `.log`, `.tmp`, `.temp`
- Large files: Files larger than 50,000 characters

### Customization

You can customize the bot by modifying the source code:

1. **Review Prompt**: Edit the `createReviewPrompt` function to change how the AI analyzes code
2. **File Filtering**: Modify `EXCLUDED_FILE_PATTERNS` to include/exclude different file types
3. **File Size Limit**: Change `MAX_FILE_SIZE` to adjust the maximum file size for review
4. **AI Model**: Switch to a different Gemini model by changing the API endpoint

## 🛠️ Development

### Prerequisites

- Node.js 20+
- npm or yarn
- TypeScript

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/ai-code-review-bot.git
cd ai-code-review-bot
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Scripts

- `npm run build` - Build the TypeScript code and bundle with ncc
- `npm run build:watch` - Build in watch mode for development
- `npm run clean` - Remove the dist directory

### Project Structure

```
├── src/
│   └── index.ts          # Main action code
├── dist/                 # Built files (generated)
├── action.yml            # GitHub Action metadata
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Build and test: `npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini API](https://ai.google.dev/) for providing the AI capabilities
- [GitHub Actions](https://github.com/features/actions) for the automation platform
- [@vercel/ncc](https://github.com/vercel/ncc) for bundling the code

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/ai-code-review-bot/issues) page
2. Create a new issue with detailed information
3. Include logs and error messages if applicable

---

**Made with ❤️ by [Ratan Gulati](https://github.com/your-username)**
