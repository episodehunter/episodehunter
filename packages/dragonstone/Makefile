all: deploy

compile: clean
        npx tsc;
        cp package-lock.json env.yml package.json dist;
        cp _serverless.yml dist/serverless.yml;
        docker run --rm --volume ${PWD}/dist:/build tjoskar/awsnode:8 npm install --production;

deployfunction: compile
        cd dist; serverless deploy --function graphql

deploy: compile
        cd dist; serverless deploy

package: compile
        cd dist; serverless package

clean:
        if [ -d "dist" ]; then rm -r dist; fi
