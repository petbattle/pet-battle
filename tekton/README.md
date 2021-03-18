tkn pipeline start fe-pet-battle \
 -w name=shared-workspace,volumeClaimTemplateFile=https://raw.githubusercontent.com/openshift/pipelines-tutorial/master/01_pipeline/03_persistent_volume_claim.yaml \
 -p git-url=http://github.com/springdo/pet-battle.git

```bash
oc apply -f tekton/tasks/build-nodejs.yaml
```

```bash
oc delete PipelineRun fe-pb-123 && \
oc apply -f tekton/PipelineRun.yaml && \
tkn pipelinerun logs fe-pb-123 -f -n springdo
```
