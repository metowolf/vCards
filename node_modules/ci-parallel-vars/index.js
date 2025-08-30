// @flow
'use strict';

/*::
type Match = null | { index: number, total: number };
*/

const envs = [
  // Knapsack / TravisCI / GitLab
  {
    index: 'CI_NODE_INDEX',
    total: 'CI_NODE_TOTAL',
  },
  // CircleCI
  {
    index: 'CIRCLE_NODE_INDEX',
    total: 'CIRCLE_NODE_TOTAL',
  },
  // Bitbucket Pipelines
  {
    index: 'BITBUCKET_PARALLEL_STEP',
    total: 'BITBUCKET_PARALLEL_STEP_COUNT',
  },
  // Buildkite
  {
    index: 'BUILDKITE_PARALLEL_JOB',
    total: 'BUILDKITE_PARALLEL_JOB_COUNT',
  },
  // Semaphore
  {
    index: 'SEMAPHORE_CURRENT_JOB',
    total: 'SEMAPHORE_JOB_COUNT',
  },
];

let maybeNum = val => {
  let num = parseInt(val, 10);
  return Number.isNaN(num) ? null : num;
};

let match /*: Match */ = null;

for (let env of envs) {
  let index = maybeNum(process.env[env.index]);
  let total = maybeNum(process.env[env.total]);

  if (index !== null && total !== null) {
    if (process.env.GITLAB_CI) {
      index = index - 1;
    }
    match = { index, total };
    break;
  }
}

module.exports = match;
