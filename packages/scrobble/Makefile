all: deploy

compile: clean
	npx tsc
	cp package-lock.json env.yml package.json dist
	cp _serverless.yml dist/serverless.yml
	cd dist; npm install --production

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
