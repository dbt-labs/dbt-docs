# dbt docs

[dbt](https://github.com/dbt-labs/dbt) (data build tool) helps analysts write reliable, modular code using a workflow that closely mirrors software development.

This repository contains code for generating a [documentation site](https://www.getdbt.com/example-documentation/#!/overview) for dbt projects. Check out the [dbt documentation](https://docs.getdbt.com/docs/overview) for more information.

---
### Getting Started

- [What is dbt]?
- Read the [dbt viewpoint]
- [Installation]
- Join the [chat][slack-url] on Slack for live questions and support.


## Code of Conduct

Everyone interacting in the dbt project's codebases, issue trackers, chat rooms, and mailing lists is expected to follow the [PyPA Code of Conduct].

[PyPA Code of Conduct]: https://www.pypa.io/en/latest/code-of-conduct/
[slack-url]: https://slack.getdbt.com/
[Installation]: https://docs.getdbt.com/docs/installation
[What is dbt]: https://docs.getdbt.com/docs/overview
[dbt viewpoint]: https://docs.getdbt.com/docs/viewpoint


### Development

After cloning this repository, run:

```bash
git submodule update --init --recursive
```

You'll also need to install bundler if you don't already have it:
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
