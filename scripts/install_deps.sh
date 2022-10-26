cd -
git clone https://github.com/dbt-labs/dbt-docs.git
cp -R ./dbt-docs/ui ./ui
cp -R ./dbt-docs/styles ./styles
cp -R ./dbt-docs/.git ./.git

rm -rf ./dbt-docs

git submodule update --init --recursive

gem install bundler
bundle install

cd styles
bundle exec jekyll build
cd -

npm install