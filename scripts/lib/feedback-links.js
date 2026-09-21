const REPOSITORY_ISSUES_URL = 'https://github.com/nexus-os/nexus-os/issues/new';

const FEEDBACK_ROUTES = Object.freeze({
  problem: `${REPOSITORY_ISSUES_URL}?template=install-problem.yml`,
  feedback: `${REPOSITORY_ISSUES_URL}?template=quick-feedback.yml`,
  feature: `${REPOSITORY_ISSUES_URL}?template=feature-request.yml`,
});

function getFeedbackPayload() {
  return {
    schemaVersion: 'nexus.feedback.v1',
    privacy: 'public-github',
    diagnosticsUploaded: false,
    routes: { ...FEEDBACK_ROUTES },
  };
}

function problemReportLines() {
  return [
    'Report this problem (public GitHub issue):',
    FEEDBACK_ROUTES.problem,
    'NEXUS-OS does not upload diagnostics. Redact paths, repository names, prompts, and secrets before sharing output.',
  ];
}

function exitFeedbackLines() {
  return [
    'Optional 20-second exit feedback (public GitHub issue):',
    FEEDBACK_ROUTES.feedback,
    'NEXUS-OS does not upload diagnostics or block uninstall.',
  ];
}

module.exports = {
  FEEDBACK_ROUTES,
  exitFeedbackLines,
  getFeedbackPayload,
  problemReportLines,
};
