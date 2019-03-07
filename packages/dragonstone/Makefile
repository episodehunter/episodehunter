all: deploy

image:
        docker build --tag amazonlinux:nodejs .

compile: clean
        npx tsc;
        cp package-lock.json env.yml package.json dist;
        cp _serverless.yml dist/serverless.yml;
        docker run --rm --volume ${PWD}/dist:/build amazonlinux:nodejs npm install --production;

deploy: compile
        cd dist; serverless deploy

package: compile
        cd dist; serverless package

clean:
        if [ -d "dist" ]; then rm -r dist; fi
