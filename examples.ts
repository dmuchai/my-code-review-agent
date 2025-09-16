import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import {
  getFileChangesInDirectoryTool,
  generateCommitMessageTool,
  writeMarkdownReviewTool,
  getGitHistoryTool,
} from "./tools";

// Basic setup for the code review agent
const createCodeReviewAgent = () => {
  return {
    model: google("models/gemini-2.5-flash"),
    system: SYSTEM_PROMPT,
    tools: {
      getFileChangesInDirectoryTool,
      generateCommitMessageTool,
      writeMarkdownReviewTool,
      getGitHistoryTool,
    },
    stopWhen: stepCountIs(15),
  };
};

// Example 1: Basic code review
export const basicCodeReview = async (directory: string) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `Review the code changes in '${directory}' directory. Provide detailed feedback on each file.`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example 2: Full review with commit message and documentation
export const fullReviewWithDocumentation = async (
  directory: string,
  reviewTitle?: string
) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `Conduct a comprehensive code review for changes in '${directory}':

    1. Analyze all file changes
    2. Provide detailed feedback for each file
    3. Generate an appropriate commit message
    4. Save the review to './reviews/review-${Date.now()}.md'
    ${reviewTitle ? `5. Use "${reviewTitle}" as the review title` : ""}

    Focus on code quality, best practices, and actionable suggestions.`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example 3: Quick commit message generation
export const generateQuickCommitMessage = async (directory: string) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `You are an expert at analyzing git changes and generating conventional commit messages.

    Your task: Generate a conventional commit message for changes in directory "${directory}".

    IMPORTANT: After using the tools, you MUST output the final commit message as text.

    Process:
    1. Use getFileChangesInDirectoryTool to get git changes
    2. Use generateCommitMessageTool to create the commit message  
    3. Write the commit message as your final response

    After calling the tools, always provide a final text response with the commit message.`,
  });

  let textOutput = '';
  let toolCallsCount = 0;
  
  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'text-delta':
        textOutput += part.text;
        process.stdout.write(part.text);
        break;
      case 'tool-call':
        toolCallsCount++;
        // Don't show tool calls in commit message mode for cleaner output
        break;
      case 'tool-result':
        // Don't show tool results in commit message mode for cleaner output  
        break;
    }
  }
  
  if (!textOutput.trim() && toolCallsCount > 0) {
    console.log("Generated commit message but no text output. Tools were called successfully.");
  } else if (!textOutput.trim() && toolCallsCount === 0) {
    console.log("No tools were called and no text was generated.");
  }
};

// Example 4: Security-focused review
export const securityFocusedReview = async (directory: string) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `Perform a security-focused code review on changes in '${directory}':

    1. Identify potential security vulnerabilities
    2. Check for input validation issues
    3. Look for authentication/authorization problems
    4. Review error handling for information disclosure
    5. Check dependencies and external API usage
    6. Generate a security-focused commit message
    7. Save findings to './reviews/security-review-${Date.now()}.md'

    Be thorough and prioritize security concerns.`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example 5: Performance-focused review
export const performanceReview = async (directory: string) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `Conduct a performance-focused review of changes in '${directory}':

    1. Identify potential performance bottlenecks
    2. Look for inefficient algorithms or data structures
    3. Check for memory leaks or excessive allocations
    4. Review database queries and API calls
    5. Suggest optimizations where appropriate
    6. Generate a performance-focused commit message
    7. Document findings in './reviews/performance-review-${Date.now()}.md'`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example 6: Review with git history context
export const contextAwareReview = async (directory: string) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `Perform a context-aware code review for '${directory}':

    1. Check recent git history for context
    2. Analyze current changes in relation to recent commits
    3. Look for patterns or recurring issues
    4. Provide feedback considering the project's evolution
    5. Generate commit message consistent with project history
    6. Save comprehensive review to './reviews/context-review-${Date.now()}.md'`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example 7: Multi-language project review
export const multiLanguageReview = async (directory: string) => {
  const config = createCodeReviewAgent();

  const result = streamText({
    ...config,
    prompt: `Review a multi-language project in '${directory}':

    1. Identify different programming languages used
    2. Apply language-specific best practices
    3. Check for consistent patterns across languages
    4. Review inter-language integration points
    5. Suggest improvements for each language
    6. Generate appropriate commit message
    7. Document language-specific findings in './reviews/multilang-review-${Date.now()}.md'`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example usage demonstrations
if (import.meta.main) {
  console.log("Code Review Agent Examples");
  console.log("==========================");
  console.log("");
  console.log("Available review types:");
  console.log("1. Basic code review");
  console.log("2. Full review with documentation");
  console.log("3. Quick commit message generation");
  console.log("4. Security-focused review");
  console.log("5. Performance review");
  console.log("6. Context-aware review");
  console.log("7. Multi-language review");
  console.log("");
  console.log("Usage examples:");
  console.log("await basicCodeReview('../my-project');");
  console.log("await fullReviewWithDocumentation('../my-project', 'Feature X Review');");
  console.log("await securityFocusedReview('../my-project');");
  console.log("");
  console.log("Each review type focuses on different aspects of code quality.");
}
