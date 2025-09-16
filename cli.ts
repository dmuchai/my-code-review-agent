#!/usr/bin/env bun

import { parseArgs } from "util";
import { existsSync } from "fs";
import { resolve } from "path";
import {
  basicCodeReview,
  fullReviewWithDocumentation,
  generateQuickCommitMessage,
  securityFocusedReview,
  performanceReview,
  contextAwareReview,
  multiLanguageReview,
} from "./examples";

// CLI argument parsing
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    type: {
      type: "string",
      short: "t",
      default: "basic",
    },
    directory: {
      type: "string",
      short: "d",
      default: ".",
    },
    title: {
      type: "string",
      short: "T",
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
    version: {
      type: "boolean",
      short: "v",
      default: false,
    },
    output: {
      type: "string",
      short: "o",
    },
    verbose: {
      type: "boolean",
      default: false,
    },
  },
  allowPositionals: true,
});

// Help text
const helpText = `
AI-Powered Code Review Agent

USAGE:
  bun cli.ts [OPTIONS] [DIRECTORY]

ARGUMENTS:
  DIRECTORY    Path to the directory to review (default: current directory)

OPTIONS:
  -t, --type <TYPE>        Type of review to perform
                          [basic|full|commit|security|performance|context|multilang]
                          (default: basic)

  -T, --title <TITLE>      Title for the review (used with 'full' type)

  -o, --output <PATH>      Custom output path for markdown files

  --verbose               Enable verbose output

  -h, --help              Show this help message

  -v, --version           Show version information

REVIEW TYPES:
  basic        Basic code review with file-by-file analysis
  full         Comprehensive review with commit message and markdown output
  commit       Generate only a commit message based on changes
  security     Security-focused code review
  performance  Performance optimization review
  context      Context-aware review using git history
  multilang    Multi-language project review

EXAMPLES:
  # Basic review of current directory
  bun cli.ts

  # Full review with custom title
  bun cli.ts -t full -T "Feature X Implementation" ../my-project

  # Security review of specific directory
  bun cli.ts -t security -d ../backend-service

  # Generate commit message only
  bun cli.ts -t commit

  # Performance review with custom output location
  bun cli.ts -t performance -o ./custom-reviews/

ENVIRONMENT VARIABLES:
  GOOGLE_GENERATIVE_AI_API_KEY    Required: Your Google AI API key

For more information, visit: https://github.com/your-repo/code-review-agent
`;

// Version information
const version = "1.0.0";

// Validate directory exists
function validateDirectory(dir: string): string {
  const resolvedDir = resolve(dir);
  if (!existsSync(resolvedDir)) {
    console.error(`❌ Error: Directory '${dir}' does not exist.`);
    process.exit(1);
  }
  return resolvedDir;
}

// Main CLI logic
async function main() {
  // Handle help flag
  if (values.help) {
    console.log(helpText);
    process.exit(0);
  }

  // Handle version flag
  if (values.version) {
    console.log(`Code Review Agent v${version}`);
    process.exit(0);
  }

  // Check for API key
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY environment variable is required.");
    console.error("Set it with: export GOOGLE_GENERATIVE_AI_API_KEY='your-api-key'");
    process.exit(1);
  }

  // Get directory from positional args or option
  const directory = positionals[0] || values.directory || ".";
  const validatedDir = validateDirectory(directory);

  // Get review type
  const reviewType = values.type?.toLowerCase() || "basic";
  const validTypes = [
    "basic",
    "full",
    "commit",
    "security",
    "performance",
    "context",
    "multilang",
  ];

  if (!validTypes.includes(reviewType)) {
    console.error(
      `❌ Error: Invalid review type '${reviewType}'. Valid types: ${validTypes.join(", ")}`
    );
    process.exit(1);
  }

  // Display startup information
  console.log("🤖 AI-Powered Code Review Agent");
  console.log("================================");
  console.log(`📁 Directory: ${validatedDir}`);
  console.log(`📋 Review Type: ${reviewType}`);
  if (values.title) console.log(`📝 Title: ${values.title}`);
  if (values.output) console.log(`💾 Output: ${values.output}`);
  console.log("");

  // Create output directory if specified
  if (values.output) {
    const outputDir = resolve(values.output);
    await Bun.write(outputDir + "/.gitkeep", "");
    console.log(`📂 Created output directory: ${outputDir}`);
  }

  try {
    // Execute the appropriate review type
    switch (reviewType) {
      case "basic":
        console.log("🔍 Starting basic code review...\n");
        await basicCodeReview(validatedDir);
        break;

      case "full":
        console.log("📊 Starting comprehensive review...\n");
        await fullReviewWithDocumentation(validatedDir, values.title);
        break;

      case "commit":
        console.log("💬 Generating commit message...\n");
        await generateQuickCommitMessage(validatedDir);
        break;

      case "security":
        console.log("🔒 Starting security-focused review...\n");
        await securityFocusedReview(validatedDir);
        break;

      case "performance":
        console.log("⚡ Starting performance review...\n");
        await performanceReview(validatedDir);
        break;

      case "context":
        console.log("🕒 Starting context-aware review...\n");
        await contextAwareReview(validatedDir);
        break;

      case "multilang":
        console.log("🌐 Starting multi-language review...\n");
        await multiLanguageReview(validatedDir);
        break;

      default:
        console.error(`❌ Unhandled review type: ${reviewType}`);
        process.exit(1);
    }

    console.log("\n✅ Review completed successfully!");

    // Show helpful next steps
    if (reviewType !== "commit") {
      console.log("\n📋 Next Steps:");
      console.log("• Review the generated feedback");
      console.log("• Check the './reviews/' directory for markdown files");
      console.log("• Apply suggested improvements to your code");
      if (reviewType !== "full") {
        console.log("• Run with --type full for comprehensive documentation");
      }
    }

  } catch (error) {
    console.error("\n❌ Error during review:");
    if (values.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
      console.error("Use --verbose for detailed error information");
    }
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on("uncaughtException", (error) => {
  console.error("\n💥 Uncaught Exception:");
  console.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("\n💥 Unhandled Rejection:");
  console.error(reason);
  process.exit(1);
});

// Run the CLI
if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}
