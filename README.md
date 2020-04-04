# pet battle

This project was generated with [ngX-Rocket](https://github.com/ngx-rocket/generator-ngx-rocket/)
version 7.1.0

## Getting started

1. Go to project folder and install dependencies:

```sh
npm install
```

2. Launch development server, and open `localhost:4200` in your browser:

```sh
npm start
```

## Deploy prebuilt app on OpenShift using Helm

```
helm template -f helm/values.yaml helm | oc apply -n my-namespace -f-
```

To deploy a specific tagged version set the app_tag variable

```
helm template -f helm/values.yaml helm --set app_tag=purple | oc apply -n my-namespace -f-
```

## Config Map for the API

```
helm template -f helm/values.yaml helm --set config_map="'http://cats-pet-battle-api.apps.ssmycluster.com'" | oc apply -f-
oc scale dc/pet-battle --replicas=0
oc scale dc/pet-battle --replicas=10
```

## Build and Deploy on OpenShift

1. Build it

```sh
oc process -f buildconfig.yaml \
    -p NAME=pet-battle \
    -p SOURCE_REPOSITORY_URL=https://github.com/springdo/pet-battle.git \
    | oc apply -n springdo -f -
```

2. Run it

```
oc process -f deploymentconfig.yaml \
    -p NAME=pet-battle \
    -p IMAGE=quay.io/springdo/pet-battle-nginx:latest \
    | oc apply -n springdo -f -
```
