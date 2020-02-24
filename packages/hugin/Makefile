all: deploy

compile: clean
        npm run build;
        cp package-lock.json env.yml package.json dist;
        cp _serverless.yml dist/serverless.yml;
        docker run --rm --volume ${PWD}/dist:/build tjoskar/awsnode:12 npm install --production;

deploy: compile
        cd dist; npx serverless deploy

package: compile
        cd dist; npx serverless package

clean:
        if [ -d "dist" ]; then rm -r dist; fi
