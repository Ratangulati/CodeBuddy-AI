import * as core from "@actions/core";
import * as github from "@actions/github";
import fetch from "node-fetch";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface FileChange {
  filename: string;
  patch?: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

// File types to exclude from review
const EXCLUDED_FILE_PATTERNS = [
  /\.lock$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.min\.(js|css)$/,
  /\.bundle\.(js|css)$/,
  /node_modules/,
  /\.git/,
  /\.DS_Store$/,
  /\.log$/,
  /\.tmp$/,
  /\.temp$/,
];

// Maximum file size to review (in characters)
const MAX_FILE_SIZE = 50000;

function shouldExcludeFile(filename: string, patch?: string): boolean {
  // Check file patterns
  if (EXCLUDED_FILE_PATTERNS.some(pattern => pattern.test(filename))) {
    return true;
  }
  
  // Check file size
  if (patch && patch.length > MAX_FILE_SIZE) {
    core.info(`Skipping large file: ${filename} (${patch.length} characters)`);
    return true;
  }
  
  return false;
}

function validateInputs(): { geminiKey: string; githubToken: string } {
  const geminiKey = core.getInput("gemini_api_key") || process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!geminiKey) {
    throw new Error("Gemini API key is missing. Please provide it via 'gemini_api_key' input or 'GEMINI_API_KEY' environment variable.");
  }

  if (!githubToken) {
    throw new Error("GitHub token is missing. This should be automatically provided by GitHub Actions.");
  }

  return { geminiKey, githubToken };
}

function createReviewPrompt(files: FileChange[], prTitle?: string, prBody?: string): string {
  const fileCount = files.length;
  const totalChanges = files.reduce((sum, file) => sum + file.changes, 0);
  
  let prompt = `You are an expert code reviewer with extensive experience in software development. Please review the following pull request changes and provide constructive, actionable feedback.

**Pull Request Context:**
- Title: ${prTitle || 'No title provided'}
- Description: ${prBody || 'No description provided'}
- Files changed: ${fileCount}
- Total changes: ${totalChanges} lines

**Review Guidelines:**
1. Focus on code quality, security, performance, and maintainability
2. Identify potential bugs, edge cases, and improvements
3. Check for proper error handling and validation
4. Ensure code follows best practices and conventions
5. Suggest specific improvements with clear explanations
6. Be constructive and professional in your feedback

**Code Changes to Review:**

`;

  files.forEach((file, index) => {
    if (file.patch) {
      prompt += `**File ${index + 1}: ${file.filename}** (${file.status}, +${file.additions}/-${file.deletions})
\`\`\`diff
${file.patch}
\`\`\`

`;
    }
  });

  prompt += `Please provide a comprehensive review covering:
- Overall assessment of the changes
- Specific issues or concerns
- Suggestions for improvement
- Security considerations (if any)
- Performance implications (if any)

Format your response in a clear, structured way that will be helpful for the developer.`;

  return prompt;
}

async function getGeminiReview(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as GeminiResponse;
    
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const reviewText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reviewText) {
      throw new Error("No review content received from Gemini API");
    }

    return reviewText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get AI review: ${error.message}`);
    }
    throw new Error("Unknown error occurred while getting AI review");
  }
}

async function run() {
  try {
    core.info("🤖 Starting AI Code Review Bot...");

    // Validate inputs
    const { geminiKey, githubToken } = validateInputs();
    core.info("✅ Input validation passed");

    // Get PR context
    const context = github.context;
    if (!context.payload.pull_request) {
      core.setFailed("This action only runs on pull_request events.");
      return;
    }

    const pr = context.payload.pull_request;
    const prNumber = pr.number;
    const repo = context.repo.repo;
    const owner = context.repo.owner;
    const prTitle = pr.title;
    const prBody = pr.body;

    core.info(`📋 Reviewing PR #${prNumber}: "${prTitle}"`);

    const octokit = github.getOctokit(githubToken);

    // Get list of changed files
    core.info("📁 Fetching changed files...");
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Filter files for review
    const filesToReview = files.filter(file => 
      !shouldExcludeFile(file.filename, file.patch)
    );

    core.info(`📊 Found ${files.length} changed files, reviewing ${filesToReview.length} files`);

    if (filesToReview.length === 0) {
      core.info("ℹ️ No files to review (all files were filtered out)");
      return;
    }

    // Create review prompt
    const reviewPrompt = createReviewPrompt(filesToReview, prTitle, prBody);
    
    // Get AI review
    core.info("🧠 Getting AI review from Gemini...");
    const reviewText = await getGeminiReview(reviewPrompt, geminiKey);

    // Create summary
    const summary = `**📊 Review Summary:**
- Files reviewed: ${filesToReview.length}/${files.length}
- Total changes: ${filesToReview.reduce((sum, file) => sum + file.changes, 0)} lines
- Files excluded: ${files.length - filesToReview.length} (large files, lock files, etc.)

`;

    // Post comment on PR
    core.info("💬 Posting review comment...");
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `🤖 **AI Code Review**\n\n${summary}${reviewText}`,
    });

    core.info("✅ Review posted successfully!");
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    core.error(`❌ Error: ${errorMessage}`);
    core.setFailed(errorMessage);
  }
}

run();
// test
