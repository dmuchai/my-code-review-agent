import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import {
  getFileChangesInDirectoryTool,
  generateCommitMessageTool,
  writeMarkdownReviewTool,
  getGitHistoryTool,
} from "./tools";

const codeReviewAgent = async (prompt: string) => {
  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    prompt,
    system: SYSTEM_PROMPT,
    tools: {
      getFileChangesInDirectoryTool: getFileChangesInDirectoryTool,
      generateCommitMessageTool: generateCommitMessageTool,
      writeMarkdownReviewTool: writeMarkdownReviewTool,
      getGitHistoryTool: getGitHistoryTool,
    },
    stopWhen: stepCountIs(10),
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Enhanced Code Review Agent with multiple features
await codeReviewAgent(
  `Review the code changes in '../my-code-review-agent' directory. For each review:

  1. Analyze the changes file by file with detailed feedback
  2. Generate an appropriate commit message based on the changes
  3. Write the complete review to a markdown file in './reviews/' directory with timestamp
  4. Check recent git history if needed for context

  Make your reviews comprehensive and actionable.`,
);
