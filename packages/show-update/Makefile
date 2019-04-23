all: deploy

compile: clean
        npx tsc;
        cp package-lock.json env.yml package.json dist;
        cp _serverless.yml dist/serverless.yml;
        docker run --rm --volume ${PWD}/dist:/build tjoskar/awsnode:8 npm install --production;

deploy: compile
        cd dist; serverless deploy

deploy-update: compile
        cd dist; serverless deploy --function update

deploy-add: compile
        cd dist; serverless deploy --function add

deploy-dragonstone: compile
        cd dist; serverless deploy --function update2 && serverless deploy --function add2

package: compile
        cd dist; serverless package

clean:
        if [ -d "dist" ]; then rm -r dist; fi
