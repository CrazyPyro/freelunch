FROM node
MAINTAINER Neil Funk <freelunch@neilfunk.com>

#RUN apt-get update && apt-get install -y \
#    s3cmd

# Cache NPM dependencies. Changes to package.json will bust Docker's cache for this layer:
ADD ./src/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
 
# Atop the previous layer of dependencies, add the application's code:
WORKDIR /opt/app
ADD ./src /opt/app/src
ADD ./views /opt/app/views

EXPOSE 8080
CMD ["node", "src/index.js"]
