
.PHONY: clean dist dev

dev:
	DBT_DOCS_ENV=development npm start

dist: clean
	DBT_DOCS_ENV=production webpack
	rm -rf dist/fonts dist/main.js dist/main.js.map

clean:
	rm -rf dist/
