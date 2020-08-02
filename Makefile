
.PHONY: clean dist dev

dev:
	DBT_DOCS_ENV=development npm start

watch:
	npm run-script watch

dist: clean
	DBT_DOCS_ENV=production webpack
	rm -rf dist/fonts dist/main.js dist/main.js.map

dist-ci: clean
	git submodule init
	git submodule update
	jekyll build -s styles/ -d styles/_site
	DBT_DOCS_ENV=production webpack
	cp data/*.json dist/

clean:
	rm -rf dist/
