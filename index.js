const core = require('@actions/core');
const github = require('@actions/github');

const octokit = github.getOctokit();

function getrepo() {
    if (process.env.GITHUB_REPOSITORY) {
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        return { owner, repo };
    }
    if (this.payload.repository) {
        return {
            owner: this.payload.repository.owner.login,
            repo: this.payload.repository.name
        };
    }
    throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
}

function createComment(owner, repo, issueNumber, body) {
    const { data: comment } = octokit.rest.issues.createComment({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body
    });
    core.info(`Created comment id '${comment.id}' on issue '${issueNumber}'.`);
    return comment.id;
}

try {
  const issueNumber = core.getInput('issue-number');
  const comment = core.getInput('comment');
  console.log(`comment: ${comment}!`);

  const [owner, repo] = getrepo();
  const commentId = createComment(owner, repo, issueNumber, comment);

  core.setOutput('comment-id', commentId);

} catch (error) {
  core.setFailed(error.message);
}