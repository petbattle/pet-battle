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

## Deploy on OpenShift using RH Advanced Cluster Managemnt

1. Log in to the hub cluster in which RHACM is installed

2. Apply the cluster config using the following command. This sets up two channels, one for the helm-charts and one for the git repo to allow us use helm lifecycle for managing the apps deployment and also harness gitops for audit and traceability.

```sh
cat rhacm/rhacm-* | oc apply -f-
```

1. On the acm console you should now have a subscription tracking the helm repo and one tracking git. There is a subscription for `rhacm/staging` `rhacm/production`. Any changes to the yaml files in here will be reflected in the deployment on RHACM. For example, in the `rhacm/production/rhacm-subscription.yaml` you could update the helm chart version as part of a cd/cd workflow eg from `1.0.1` to `1.0.2`

```
spec:
  channel: pet-battle-ch/cat-app
  name: pet-battle
  packageFilter:
    version: 1.0.2
```
