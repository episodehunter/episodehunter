all: package

compile:
        npx tsc
        cp package-lock.json package.json serverless.yml env.yml dist

image: compile
        docker build --tag amazonlinux:nodejs .

package: image
        docker run --rm --volume ${PWD}/dist:/build amazonlinux:nodejs npm install --production

deployfunction: compile
        cd dist
        serverless deploy function -f update

deploy: compile
        cd dist
        serverless deploy

clean:
        rm -r dist
        docker rmi --force amazonlinux:nodejs
