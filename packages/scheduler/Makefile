all: deploy

compile: clean
        npm run build;
        cp package-lock.json env.yml package.json dist;
        cp _serverless.yml dist/serverless.yml;
        docker run --rm --volume ${PWD}/dist:/build tjoskar/awsnode:10 npm install --production;

deploy: compile
        cd dist; serverless deploy

deployfunctions: compile
        cd dist; serverless deploy --function thetvdb && serverless deploy --function showupdater

package: compile
        cd dist; serverless package

clean:
        if [ -d "dist" ]; then rm -r dist; fi
