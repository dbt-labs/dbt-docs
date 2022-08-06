
IMAGE := dbt-dev-image:1.0
.PHONY: clean dist dev

dev:
	DBT_DOCS_ENV=development npm start

watch:
	npm run-script watch

test:
	npm test

dist: clean
	DBT_DOCS_ENV=production webpack
	rm -rf dist/fonts dist/main.js dist/main.js.map

submodule:
	git submodule init
	git submodule update
	jekyll build -s styles/ -d styles/_site

dist-ci: clean submodule test
	DBT_DOCS_ENV=production webpack
	cp data/*.json dist/

clean:
	rm -rf dist/

build:
	@echo "Building image..."
	@docker build -t ${IMAGE} -f Dockerfile .
	@echo "Building image and opening shell..."
	@docker run -it \
    	-p 8080:8080 \
    	-w /app \
		-v ${PWD}:/app \
		-v ~/.aws/:/root/.aws \
		-v ~/.ssh/:/root/.ssh \
		-v ~/.gitconfig:/etc/gitconfig \
		${IMAGE} /bin/bash