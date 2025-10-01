# ci-parallel-vars

> Get CI environment variables for parallelizing builds

## Install

```
yarn add ci-parallel-vars
```

## Usage

```js
const ciParallelVars = require('ci-parallel-vars');

console.log(ciParallelVars); // { index: 3, total: 10 } || null
```

## Supports

> If you want to add support for another pair, please open a pull request and
> add them to `index.js` and to this list.

- [Knapsack] / [TravisCI] / [GitLab] - `CI_NODE_INDEX`/`CI_NODE_TOTAL`
- [CircleCI] - `CIRCLE_NODE_INDEX`/`CIRCLE_NODE_TOTAL`
- [Bitbucket Pipelines] - `BITBUCKET_PARALLEL_STEP`/`BITBUCKET_PARALLEL_STEP_COUNT`
- [Buildkite] - `BUILDKITE_PARALLEL_JOB`/`BUILDKITE_PARALLEL_JOB_COUNT`
- [Semaphore] - `SEMAPHORE_CURRENT_JOB`/`SEMAPHORE_JOB_COUNT`

One of these pairs must both be defined as numbers or `ci-parallel-vars` will
be `null`.

[Knapsack]: http://docs.knapsackpro.com/ruby/knapsack#info-about-env-variables
[TravisCI]: https://docs.travis-ci.com/user/speeding-up-the-build/#Parallelizing-RSpec%2C-Cucumber-and-Minitest-on-multiple-VMs
[GitLab]: https://docs.gitlab.com/ee/ci/yaml/#parallel
[CircleCI]: https://circleci.com/docs/1.0/parallel-manual-setup/#using-environment-variables
[Bitbucket Pipelines]: https://confluence.atlassian.com/bitbucket/parallel-steps-946606807.html
[Buildkite]: https://buildkite.com/docs/builds/parallel-builds
[Semaphore]: https://semaphoreci.com/docs/available-environment-variables.html#variables-exported-in-builds-and-deploys
