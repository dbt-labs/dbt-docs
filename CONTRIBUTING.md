** replace `dbt-docs` with your repository name in all docs


# Contributing to `dbt-docs`

`dbt-docs` is a template for open source software projects at dbt Labs.


1. [About this document](#about-this-document)
2. [Getting the code](#getting-the-code)
3. [Setting up an environment](#setting-up-an-environment)
4. [Running in development](#running-dbt-docs-in-development)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Adding or modifying a changelog entry](#adding-or-modifying-a-changelog-entry)
8. [Submitting a Pull Request](#submitting-a-pull-request)

## About this document

There are many ways to contribute to the ongoing development of `dbt-docs`, such as by participating in discussions and issues. We encourage you to first read our higher-level document: ["Expectations for Open Source Contributors"](https://docs.getdbt.com/docs/contributing/oss-expectations).

The rest of this document serves as a more granular guide for contributing code changes to `dbt-docs` (this repository). It is not intended as a guide for using `dbt-docs`, and some pieces assume a level of familiarity with Javascript development. Specific code snippets in this guide assume you are using macOS or Linux and are comfortable with the command line.

### Notes

- **CLA:** Please note that anyone contributing code to `dbt-docs` must sign the [Contributor License Agreement](https://docs.getdbt.com/docs/contributor-license-agreements). If you are unable to sign the CLA, the `dbt-docs` maintainers will unfortunately be unable to merge any of your Pull Requests. We welcome you to participate in discussions, open issues, and comment on existing ones.
- **Branches:** All pull requests from community contributors should target the `main` branch (default).
- **Releases**: This repository is never released in itself.  An html file is generated that lives in the dbt-core repository and is released as part of that code base.

## Getting the code

### Installing git

You will need `git` in order to download and modify the source code.

### External contributors

If you are not a member of the `dbt-labs` GitHub organization, you can contribute to `dbt-docs` by forking the `dbt-docs` repository. For a detailed overview on forking, check out the [GitHub docs on forking](https://help.github.com/en/articles/fork-a-repo). In short, you will need to:

1. Fork the `dbt-docs` repository
2. Clone your fork locally
3. Check out a new branch for your proposed changes
4. Push changes to your fork
5. Open a pull request against `dbt-labs/dbt-docs` from your forked repository

### dbt Labs contributors

If you are a member of the `dbt-labs` GitHub organization, you will have push access to the `dbt-docs` repo. Rather than forking `dbt-docs` to make your changes, just clone the repository, check out a new branch, and push directly to that branch.

## Setting up an environment

## Running `dbt-docs` in development

### Installation

After cloning this repository, run:

```bash
git submodule update --init --recursive
```

You'll also need to install bundler if you don't already have it:
```bash
gem install bundler
bundle install
```

### Building `dbt-docs`

To build the css files required for webpack:

```bash
cd styles
bundle exec jekyll build
cd -
```

To build an index.html file:

```bash
npm install
npx webpack
```

### Running `dbt-docs`

To run the dev server, first copy your `manifest.json` and `catalog.json` files to
the `src/` directory. Then run:

```bash
npm install
npm start
```

## Adding or modifying a CHANGELOG Entry

We use [changie](https://changie.dev) to generate `CHANGELOG` entries.  The changie file you generate in `dbt-docs` will make its way over to the `dbt-core` repository when we migrate your change over there.  It will show up in the release notes for `dbt-core`! **Note:** Do not edit the `CHANGELOG.md` directly. Your modifications will be lost.

Follow the steps to [install `changie`](https://changie.dev/guide/installation/) for your system.

Once changie is installed and your PR is created for a new feature, simply run the following command and changie will walk you through the process of creating a changelog entry:

```shell
changie new
```

Commit the file that's created and your changelog entry is complete!

## Submitting a Pull Request

Code can be merged into the current development branch `main` by opening a pull request. A `dbt-docs` maintainer will review your PR. They may suggest code revision for style or clarity, or request that you add unit or integration test(s). These are good things! We believe that, with a little bit of help, anyone can contribute high-quality code.

Automated tests run via GitHub Actions. If you're a first-time contributor, all tests (including code checks and unit tests) will require a maintainer to approve. Changes in the `dbt-docs` repository trigger integration tests against Postgres. dbt Labs also provides CI environments in which to test changes to other adapters, triggered by PRs in those adapters' repositories, as well as periodic maintenance checks of each adapter in concert with the latest `dbt-docs` code changes.

Once all tests are passing and your PR has been approved, a `dbt-docs` maintainer will merge your changes into the active development branch. And that's it! Happy developing :tada:

Sometimes, the content license agreement auto-check bot doesn't find a user's entry in its roster. If you need to force a rerun, add `@cla-bot check` in a comment on the pull request.
