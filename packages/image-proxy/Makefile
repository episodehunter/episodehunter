all: deploy

compile: clean
	npx tsc
	cp package-lock.json package.json serverless.yml env.yml dist
	docker run --rm --volume ${PWD}/dist:/build tjoskar/awsnode:10 npm install --production;

deployfunction: compile
	cd dist; serverless deploy function -f update

deploy: compile
	cd dist; serverless deploy

clean:
	if [ -d "dist" ]; then rm -r dist; fi
