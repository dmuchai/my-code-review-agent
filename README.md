# AI-Powered Code Review Agent

An intelligent code review agent built with AI that provides comprehensive code analysis, generates commit messages, and creates detailed review documentation.

## Features

### Core Capabilities
- **Automated Code Review**: Analyzes git diffs and provides detailed feedback on code quality, best practices, and potential issues
- **Commit Message Generation**: Creates conventional commit messages based on code changes
- **Review Documentation**: Saves reviews to markdown files with timestamps and metadata
- **Git History Integration**: Analyzes recent commit history for additional context
- **Multi-language Support**: Provides language-specific feedback and best practices

### Review Focus Areas
- **Correctness**: Logic errors, bugs, edge cases, and regressions
- **Clarity**: Code readability, naming conventions, and structure
- **Maintainability**: Code complexity, duplication, and coupling
- **Consistency**: Adherence to coding standards and patterns
- **Performance**: Efficiency and optimization opportunities
- **Security**: Vulnerabilities, input validation, and unsafe operations
- **Testing**: Test coverage and quality
- **Scalability**: Error handling and robustness under scale

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-code-review-agent
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up your Google AI API key:
```bash
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

## Usage

### Basic Code Review

```typescript
import { basicCodeReview } from './examples';

// Review changes in a directory
await basicCodeReview('../your-project-directory');
```

### Full Review with Documentation

```typescript
import { fullReviewWithDocumentation } from './examples';

// Comprehensive review with markdown output
await fullReviewWithDocumentation('../your-project-directory', 'Feature X Review');
```

### Quick Commit Message Generation

```typescript
import { generateQuickCommitMessage } from './examples';

// Generate only a commit message
await generateQuickCommitMessage('../your-project-directory');
```

### Specialized Reviews

```typescript
import { 
  securityFocusedReview, 
  performanceReview, 
  contextAwareReview 
} from './examples';

// Security-focused analysis
await securityFocusedReview('../your-project-directory');

// Performance optimization review
await performanceReview('../your-project-directory');

// Review with git history context
await contextAwareReview('../your-project-directory');
```

### Custom Review

```typescript
import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import {
  getFileChangesInDirectoryTool,
  generateCommitMessageTool,
  writeMarkdownReviewTool,
  getGitHistoryTool,
} from "./tools";

const customReview = async (directory: string, customPrompt: string) => {
  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    prompt: customPrompt,
    system: SYSTEM_PROMPT,
    tools: {
      getFileChangesInDirectoryTool,
      generateCommitMessageTool,
      writeMarkdownReviewTool,
      getGitHistoryTool,
    },
    stopWhen: stepCountIs(15),
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};
```

## Available Tools

The agent comes with four powerful tools:

### 1. `getFileChangesInDirectoryTool`
Analyzes git diffs and file changes in a specified directory.

```typescript
// Automatically used to detect changes
const changes = await getFileChangesInDirectoryTool.execute({
  rootDir: '../project-directory'
});
```

### 2. `generateCommitMessageTool`
Creates conventional commit messages based on analyzed changes.

```typescript
// Generates commit messages following conventional commits standard
const commitMsg = await generateCommitMessageTool.execute({
  changes: fileChanges,
  type: 'feat' // Optional: 'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'
});
```

### 3. `writeMarkdownReviewTool`
Saves review content to markdown files with metadata.

```typescript
// Saves reviews for documentation and tracking
const result = await writeMarkdownReviewTool.execute({
  filePath: './reviews/review-2024-01-01.md',
  content: 'Your review content here',
  title: 'Code Review: Feature X'
});
```

### 4. `getGitHistoryTool`
Retrieves recent git commit history for additional context.

```typescript
// Gets recent commits for context
const history = await getGitHistoryTool.execute({
  rootDir: '../project-directory',
  maxCount: 10
});
```

## Configuration

### Model Configuration
The agent uses Google's Gemini 2.5 Flash model by default. You can modify the model in the configuration:

```typescript
const result = streamText({
  model: google("models/gemini-2.5-flash"),
  // ... other options
});
```

### Excluded Files
Certain files are excluded from analysis by default (defined in `tools.ts`):
- `dist/`
- `bun.lock`

You can modify the `excludeFiles` array to customize this behavior.

### Step Count Limit
The agent has a step count limit to prevent excessive API calls:

```typescript
stopWhen: stepCountIs(15), // Adjust as needed
```

## Output Examples

### Generated Commit Message
```
feat(auth): add user authentication system

- Modified 3 files
- Added 150 lines, removed 20 lines
- Files: auth.ts, login.ts, middleware.ts
```

### Review Output Structure
```markdown
---
generated: 2024-01-01T12:00:00.000Z
type: code-review
---

# Code Review: Feature Implementation

## Summary
Brief overview of changes and overall assessment...

## File-by-File Analysis
### auth.ts
- ✅ Good use of TypeScript interfaces
- ⚠️ Consider adding input validation
- 📝 Suggestion: Extract constants to separate file

### login.ts
- ✅ Proper error handling implemented
- ❌ Missing rate limiting
- 📝 Security: Use secure session storage

## Suggestions
1. Add comprehensive input validation
2. Implement rate limiting for login attempts
3. Add unit tests for authentication flows

## Positive Highlights
- Clean, readable code structure
- Good separation of concerns
- Consistent naming conventions

## Commit Message
feat(auth): implement user authentication system

## Action Items
1. Add input validation (High Priority)
2. Implement rate limiting (High Priority)
3. Add unit tests (Medium Priority)
```

## Project Structure

```
my-code-review-agent/
├── index.ts          # Main entry point
├── examples.ts       # Usage examples and patterns
├── tools.ts          # AI tools implementation
├── prompts.ts        # System prompts and instructions
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
├── reviews/          # Generated review files (created automatically)
└── README.md         # This file
```

## Dependencies

- `ai`: AI SDK for model integration
- `@ai-sdk/google`: Google AI provider
- `simple-git`: Git operations
- `zod`: Schema validation
- `typescript`: TypeScript support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the code review agent on your changes
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Support for multiple AI models
- [ ] Integration with GitHub/GitLab APIs
- [ ] Custom rule configuration
- [ ] Team-specific review templates
- [ ] Integration with CI/CD pipelines
- [ ] Review metrics and analytics
- [ ] Support for more version control systems