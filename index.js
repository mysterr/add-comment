const core = require("@actions/core");
const github = require("@actions/github");

function getrepo() {
  if (process.env.GITHUB_REPOSITORY) {
    console.log('GITHUB_REPOSITORY')
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    return { owner, repo };
  }
  if (this.payload.repository) {
    console.log('payload.repository')
    return {
      owner: this.payload.repository.owner.login,
      repo: this.payload.repository.name,
    };
  }
  throw new Error(
    "required a GITHUB_REPOSITORY environment variable like 'owner/repo'"
  );
}

function createComment(octokit, owner, repoInfo, issueNumber, body) {
  const { data: comment } = octokit.rest.issues.createComment({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    issue_number: issueNumber,
    body,
  });
  core.info(`Created comment id '${comment.id}' on issue '${issueNumber}'.`);
  return comment.id;
}

try {
  const issueNumber = core.getInput("issue-number");
  const comment = core.getInput("comment");
  const token = core.getInput("token");
  const octokit = github.getOctokit(token);
  console.log(`comment: ${comment}!`);

  const repoInfo = getrepo();
  console.log(repoInfo);
  const commentId = createComment(octokit, repoInfo, issueNumber, comment);

  core.setOutput("comment-id", commentId);
} catch (error) {
  core.setFailed(error.message);
}
