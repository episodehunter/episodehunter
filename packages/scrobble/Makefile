all: deploy

compile: clean
	npm run build
	cp package-lock.json env.yml package.json dist
	cp _serverless.yml dist/serverless.yml
	docker run --rm --volume ${PWD}/dist:/build tjoskar/awsnode:10 npm install --production;

deployplex: compile
	cd dist; serverless deploy function -f plex

deploykodi: compile
	cd dist; serverless deploy function -f kodi

deploy: compile
	cd dist; serverless deploy

deployfunctions: compile
	cd dist; serverless deploy function -f kodi && serverless deploy function -f plex

package: compile
	cd dist; serverless package

clean:
	if [ -d "dist" ]; then rm -r dist; fi
