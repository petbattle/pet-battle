pipeline {
    agent {
        label "master"
    }

    environment {
        // GLobal Vars
        // PIPELINES_NAMESPACE = "${OPENSHIFT_BUILD_NAMESPACE}"        
        NAME = "pet-battle"
        RHACM_CONFIG_REPO_PATH = "rhacm/rhacm-subscription-prod.yaml"
        RHACM_CONFIG_REPO_BRANCH = "master"
        
        // Job name contains the branch eg my-app-feature%2Fjenkins-123
        JOB_NAME = "${JOB_NAME}".replace("%2F", "-").replace("/", "-")
        IMAGE_REPOSITORY= 'image-registry.openshift-image-registry.svc:5000'

        GIT_SSL_NO_VERIFY = true

        // Credentials bound in OpenShift
        GIT_CREDS = credentials("${OPENSHIFT_BUILD_NAMESPACE}-git-auth")
        NEXUS_CREDS = credentials("${OPENSHIFT_BUILD_NAMESPACE}-nexus-password")
        ARGOCD_CREDS = credentials("${OPENSHIFT_BUILD_NAMESPACE}-argocd-token")

        // Nexus Artifact repo 
        NEXUS_REPO_NAME="labs-static"
        NEXUS_REPO_HELM = "helm-charts"
    }

    // The options directive is for configuration that applies to the whole job.
    options {
        buildDiscarder(logRotator(numToKeepStr: '50', artifactNumToKeepStr: '1'))
        timeout(time: 15, unit: 'MINUTES')
        ansiColor('xterm')
        timestamps()
    }

    stages {
        stage('Perpare Environment') {
            failFast true
            parallel {
                stage("Release Build") {
                    options {
                        skipDefaultCheckout(true)
                    }
                    agent {
                        node {
                            label "master"
                        }
                    }
                    when {
                        expression { GIT_BRANCH.startsWith("master") }
                    }
                    steps {
                        script {
                            env.TARGET_NAMESPACE = "ds-test"
                            // app name for master is just pet-battle or something
                            env.APP_NAME = "${NAME}".replace("/", "-").toLowerCase()
                        }
                    }
                }
                stage("Sandbox Build") {
                    options {
                        skipDefaultCheckout(true)
                    }
                    agent {
                        node {
                            label "master"
                        }
                    }
                    when {
                        expression { GIT_BRANCH.startsWith("dev") || GIT_BRANCH.startsWith("feature") || GIT_BRANCH.startsWith("fix") }
                    }
                    steps {
                        script {
                            env.TARGET_NAMESPACE = "ds-dev"
                            // ammend the name to create 'sandbox' deploys based on current branch
                            env.APP_NAME = "${GIT_BRANCH}-${NAME}".replace("/", "-").toLowerCase()
                            env.NODE_ENV = "test"
                        }
                    }
                }
                stage("Pull Request Build") {
                    options {
                        skipDefaultCheckout(true)
                    }
                    agent {
                        node {
                            label "master"
                        }
                    }
                    when {
                        expression { GIT_BRANCH.startsWith("PR-") }
                    }
                    steps {
                        script {
                            env.TARGET_NAMESPACE = "ds-dev"
                            env.APP_NAME = "${GIT_BRANCH}-${NAME}".replace("/", "-").toLowerCase()
                        }
                    }
                }
            }
        }

        stage("Build (Compile App)") {
            agent {
                node {
                    label "jenkins-slave-npm"
                }
            }
            steps {
                script {
                    env.VERSION = sh(returnStdout: true, script: "npm run version --silent").trim()
                    env.PACKAGE = "${APP_NAME}-${VERSION}.tar.gz"
                }
                sh 'printenv'

                echo '### Install deps ###'
                // sh 'npm install'
                sh 'npm  --registry http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/labs-npm ci'

                echo '### Running linter ###'
                // sh 'npm run lint'
                // helm lint? probs not here as no helm in jenkins slave

                echo '### Running tests ###'
                // sh 'npm run test'

                echo '### Running build ###'
                sh '''
                    npm run build
                '''

                echo '### Packaging App for Nexus ###'
                sh '''
                    tar -zcvf ${PACKAGE} dist Dockerfile nginx.conf
                    curl -v -f -u ${NEXUS_CREDS} --upload-file ${PACKAGE} http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE}
                '''
            }
            // Post can be used both on individual stages and for the entire build.
        }

        stage("Bake (OpenShift Build)") {
            options {
                skipDefaultCheckout(true)
            }
            agent {
                node {
                    label "master"
                }
            }
            steps {
                sh 'printenv'

                echo '### Get Binary from Nexus and shove it in a box ###'
                sh  '''
                    rm -rf package-contents*
                    curl -v -f -u ${NEXUS_CREDS} http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE} -o ${PACKAGE}

                    BUILD_ARGS=" --build-arg git_commit=${GIT_COMMIT} --build-arg git_url=${GIT_URL}  --build-arg build_url=${RUN_DISPLAY_URL} --build-arg build_tag=${BUILD_TAG}"
                    echo ${BUILD_ARGS}
                    
                    oc get bc ${APP_NAME} || rc=$?
                    # dirty hack so i don't have to oc patch the bc for the new version ...
                    oc delete bc ${APP_NAME} || rc=$?
                    # if [ $rc -eq 1 ]; then
                        echo " 🏗 no build - creating one 🏗"
                        oc new-build --binary --name=${APP_NAME} -l app=${APP_NAME} ${BUILD_ARGS} --strategy=docker --push-secret=dschromeos-vodafone-poc-pull-secret --to-docker --to="quay.io/dschromeos/pet-battle:${VERSION}"
                    # fi
                    
                    echo " 🏗 build found - starting it  🏗"
                    oc start-build ${APP_NAME} --from-archive=${PACKAGE} ${BUILD_ARGS} --follow
                    # oc tag ${OPENSHIFT_BUILD_NAMESPACE}/${APP_NAME}:latest ${TARGET_NAMESPACE}/${APP_NAME}:${VERSION}
                '''
            }
        }

        stage("Deploy App (Staging)") {
            agent {
                node {
                    label "jenkins-slave-helm"
                }
            }
            steps {
                sh 'printenv'  
                sh '''
                    helm lint chart
                '''
                sh '''
                    # might be overkill...
                    yq w -i chart/Chart.yaml 'appVersion' ${VERSION}
                    yq w -i chart/Chart.yaml 'version' ${VERSION}

                    yq w -i chart/Chart.yaml 'name' ${APP_NAME}
                    
                    # probs point to the image inside ocp cluster or perhaps an external repo?
                    yq w -i chart/values.yaml 'image_name' ${APP_NAME}
                    yq w -i chart/values.yaml 'image_namespace' dschromeos
                    
                    # latest built image
                    yq w -i chart/values.yaml 'app_tag' ${VERSION}
                '''
                sh '''
                    # package and release helm chart?
                    helm package chart/ --app-version ${VERSION} --version ${VERSION}
                    
                    # RHACM and nexus issue - uri is not complete hence git hack below
                    # curl -v -f -u ${NEXUS_CREDS} http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_HELM}/ --upload-file ${APP_NAME}-${VERSION}.tgz

                    git config --global user.email "jenkins@rht-labs.bot.com"
                    git config --global user.name "Jenkins"
                    git config --global push.default simple

                    git stash 
                    git checkout gh-pages

                    cat << EOF | yq m -a -x - index.yaml > undex.yaml
---
entries:
  pet-battle:
  - appVersion: ${VERSION}
    created: 2020-05-20T11:37:47.405Z
    description: A Helm chart to deploy the frontend of the Pet Battle
    digest: 785b4bd6fce219234694e62763a3bb40239a5bf37b261244c619df79b248335d
    maintainers:
    - name: springdo
    name: pet-battle
    urls:
    - https://raw.githubusercontent.com/dschromeos/pet-battle/gh-pages/pet-battle-${VERSION}.tgz  
    version: ${VERSION}
EOF
                    mv undex.yaml index.yaml

                    git add index.yaml ${APP_NAME}*.tgz
                    git commit -m "🚀 AUTOMATED COMMIT - Deployment of new app version ${VERSION} 🚀" || rc=$?
                    git remote set-url origin https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@github.com/${GIT_CREDS_USR}/${NAME}.git
                    git push
                '''
            }
        }

        stage("End to End Test") {
            agent {
                node {
                    label "master"
                }
            }
            when {
                expression { GIT_BRANCH ==~ /(.*master)/ }
            }
            steps {
                sh  '''
                    echo "TODO - Run tests"      
                    sleep 30              
                '''
            }
        }

        stage("Promote app (Production)") {
            agent {
                node {
                    label "jenkins-slave-helm"
                }
            }
            when {
                expression { GIT_BRANCH ==~ /(.*master)/ }
            }
            steps {
                sh  '''
                    git checkout ${RHACM_CONFIG_REPO_BRANCH}
                    yq w -i ${RHACM_CONFIG_REPO_PATH} 'spec.packageFilter.version' ${VERSION}

                    git config --global user.email "jenkins@rht-labs.bot.com"
                    git config --global user.name "Jenkins"
                    git config --global push.default simple

                    git add ${RHACM_CONFIG_REPO_PATH}
                    # grabbing the error code incase there is nothing to commit and allow jenkins proceed
                    git commit -m "🚀 AUTOMATED COMMIT - Deployment new app version ${VERSION} 🚀" || rc=$?
                    git remote set-url origin https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@github.com/${GIT_CREDS_USR}/${NAME}.git
                    git push -u origin ${RHACM_CONFIG_REPO_BRANCH}
                '''
                sh '''
                   # TODO = ask cluster with acm on it to accept the new subscription?
                '''
            }
        }
    }
}
