import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

// Schema for commit message generation
const commitMessageSchema = z.object({
  changes: z
    .array(
      z.object({
        file: z.string(),
        diff: z.string(),
      }),
    )
    .describe("Array of file changes with their diffs"),
  type: z
    .enum(["feat", "fix", "docs", "style", "refactor", "test", "chore"])
    .optional()
    .describe("Type of commit (conventional commits)"),
});

type CommitMessageInput = z.infer<typeof commitMessageSchema>;

async function generateCommitMessage({ changes, type }: CommitMessageInput) {
  // Analyze changes to suggest commit type if not provided
  let suggestedType = type;

  if (!suggestedType) {
    const hasNewFeatures = changes.some(
      (change) =>
        change.diff.includes("+ ") &&
        (change.diff.includes("function") ||
          change.diff.includes("class") ||
          change.diff.includes("export")),
    );
    const hasBugFixes = changes.some(
      (change) =>
        change.diff.includes("fix") ||
        change.diff.includes("bug") ||
        change.diff.includes("error"),
    );
    const hasDocChanges = changes.some(
      (change) =>
        change.file.includes("README") ||
        change.file.includes(".md") ||
        change.diff.includes("@param") ||
        change.diff.includes("@returns"),
    );
    const hasTestChanges = changes.some(
      (change) => change.file.includes("test") || change.file.includes("spec"),
    );

    if (hasNewFeatures) suggestedType = "feat";
    else if (hasBugFixes) suggestedType = "fix";
    else if (hasDocChanges) suggestedType = "docs";
    else if (hasTestChanges) suggestedType = "test";
    else suggestedType = "chore";
  }

  // Generate summary of changes
  const fileNames = changes.map((change) => change.file).join(", ");
  const addedLines = changes.reduce(
    (sum, change) => sum + (change.diff.match(/^\+/gm)?.length || 0),
    0,
  );
  const removedLines = changes.reduce(
    (sum, change) => sum + (change.diff.match(/^\-/gm)?.length || 0),
    0,
  );

  // Create commit message
  const scope =
    changes.length === 1
      ? changes[0].file.split("/").pop()?.split(".")[0]
      : changes.length > 3
        ? "multiple"
        : fileNames.split(",").length > 1
          ? "files"
          : "";

  const scopeText = scope ? `(${scope})` : "";

  let description = "";
  if (suggestedType === "feat") {
    description = `add new functionality`;
  } else if (suggestedType === "fix") {
    description = `resolve issues`;
  } else if (suggestedType === "docs") {
    description = `update documentation`;
  } else if (suggestedType === "refactor") {
    description = `improve code structure`;
  } else if (suggestedType === "test") {
    description = `add/update tests`;
  } else {
    description = `update code`;
  }

  const commitMessage = `${suggestedType}${scopeText}: ${description}

- Modified ${changes.length} file${changes.length > 1 ? "s" : ""}
- Added ${addedLines} lines, removed ${removedLines} lines
- Files: ${fileNames}`;

  return {
    message: commitMessage,
    type: suggestedType,
    stats: { addedLines, removedLines, filesChanged: changes.length },
  };
}

export const generateCommitMessageTool = tool({
  description: "Generates a conventional commit message based on code changes",
  inputSchema: commitMessageSchema,
  execute: generateCommitMessage,
});

// Schema for writing markdown review
const writeMarkdownSchema = z.object({
  filePath: z
    .string()
    .describe("Path where the markdown file should be written"),
  content: z.string().describe("The markdown content to write"),
  title: z.string().optional().describe("Optional title for the review"),
});

type WriteMarkdownInput = z.infer<typeof writeMarkdownSchema>;

async function writeMarkdownReview({
  filePath,
  content,
  title,
}: WriteMarkdownInput) {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });

    // Create markdown content with title if provided
    const markdownContent = title ? `# ${title}\n\n${content}` : content;

    // Add metadata header
    const timestamp = new Date().toISOString();
    const fullContent = `---
generated: ${timestamp}
type: code-review
---

${markdownContent}
`;

    await writeFile(filePath, fullContent, "utf8");

    return {
      success: true,
      filePath,
      size: fullContent.length,
      message: `Successfully wrote ${fullContent.length} characters to ${filePath}`,
    };
  } catch (error) {
    return {
      success: false,
      filePath,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const writeMarkdownReviewTool = tool({
  description: "Writes code review content to a markdown file",
  inputSchema: writeMarkdownSchema,
  execute: writeMarkdownReview,
});

// Schema for getting git commit history
const gitHistorySchema = z.object({
  rootDir: z.string().describe("The root directory to get git history from"),
  maxCount: z
    .number()
    .optional()
    .default(10)
    .describe("Maximum number of commits to retrieve"),
});

type GitHistoryInput = z.infer<typeof gitHistorySchema>;

async function getGitHistory({ rootDir, maxCount }: GitHistoryInput) {
  try {
    const git = simpleGit(rootDir);
    const log = await git.log({ maxCount });

    return {
      commits: log.all.map((commit) => ({
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
        author: commit.author_name,
        email: commit.author_email,
      })),
    };
  } catch (error) {
    return {
      commits: [],
      error:
        error instanceof Error ? error.message : "Failed to get git history",
    };
  }
}

export const getGitHistoryTool = tool({
  description: "Gets recent git commit history from a directory",
  inputSchema: gitHistorySchema,
  execute: getGitHistory,
});
