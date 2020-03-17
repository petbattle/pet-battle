# Proper angular dockerfile....
# FROM registry.access.redhat.com/rhscl/nginx-112-rhel7
# COPY dist $HOME
# CMD ["nginx", "-g", "daemon off;"]

# NOTE THIS IS NOT HOW YOU SHOULD RUN AN ANGULAR APP IN 'PROD MODE'
FROM openshift/nodejs-010-centos7
# FROM registry.redhat.io/rhel8/nodejs-12
WORKDIR /opt/app-root/src
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
CMD [ "npx", "ng", "serve", "--prod", "--proxy-config", "proxy.conf.js", "--disableHostCheck=true" ,"--host=0.0.0.0"]