# dbt docs

[dbt](https://github.com/dbt-labs/dbt-core) helps analysts write reliable, modular code using a workflow that closely mirrors software development.

This repository contains code for generating a documentation site for dbt projects. Check out the [dbt documentation](https://docs.getdbt.com/docs/overview) for more information.

---
### Getting Started

- [What is dbt]?
- Read the [dbt viewpoint]
- [Installation]
- Join the [chat][slack-url] on Slack for live questions and support.


## Code of Conduct

Everyone interacting in the dbt project's codebases, issue trackers, chat rooms, and mailing lists is expected to follow the [PyPA Code of Conduct].

[PyPA Code of Conduct]: https://www.pypa.io/en/latest/code-of-conduct/
[slack-url]: https://www.getdbt.com/community/
[Installation]: https://docs.getdbt.com/docs/installation
[What is dbt]: https://docs.getdbt.com/docs/overview
[dbt viewpoint]: https://docs.getdbt.com/docs/viewpoint

### Showing dbt docs

In your dbt project, run `dbt docs generate` then `dbt docs serve`. 

### Development

After cloning this repository, run:

```bash
git submodule update --init --recursive
```

Ensure you have a sufficient ssh key in `~/.ssh`. npm installs some deps from Github

To build the container 
```bash
$ make build
```

npm installs some dependances from Github using SSH. SSH prompts the user to verify the authenticity 
of the host (Github recomends HTTPS access) which hangs then fails since the install task is daemonized.
This adds Github as a known host.

```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

Install bundler:
```bash
gem install bundler
bundle install
```

### Build / Run

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

To run the dev server, first copy your `manifest.json` and `catalog.json` files to
the `src/` directory. Then run:

```bash
npm install
npm start
```
