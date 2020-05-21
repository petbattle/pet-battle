pipeline {
    agent {
        label "master"
    }

    environment {
        // GLobal Vars
        // PIPELINES_NAMESPACE = "${OPENSHIFT_BUILD_NAMESPACE}"        
        NAME = "pet-battle"
        ARGOCD_CONFIG_REPO = "github.com/springdo/ubiquitous-journey.git"
        ARGOCD_CONFIG_REPO_PATH = "example-deployment/values-applications.yaml"
        ARGOCD_CONFIG_REPO_BRANCH = "ds-env"
        
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
                    if [ $rc -eq 1 ]; then
                        echo " 🏗 no build - creating one 🏗"
                        oc new-build --binary --name=${APP_NAME} -l app=${APP_NAME} ${BUILD_ARGS} --strategy=docker
                    fi
                    
                    echo " 🏗 build found - starting it  🏗"
                    oc start-build ${APP_NAME} --from-archive=${PACKAGE} ${BUILD_ARGS} --follow
                    oc tag ${OPENSHIFT_BUILD_NAMESPACE}/${APP_NAME}:latest ${TARGET_NAMESPACE}/${APP_NAME}:${VERSION}
                '''
            }
        }

        stage("Helm Package App (master)") {
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
                    yq w -i chart/values.yaml 'image_repository' ${IMAGE_REPOSITORY}
                    yq w -i chart/values.yaml 'image_name' ${APP_NAME}
                    yq w -i chart/values.yaml 'image_namespace' ${TARGET_NAMESPACE}
                    
                    # latest built image
                    yq w -i chart/values.yaml 'app_tag' ${VERSION}
                '''
                sh '''
                    # package and release helm chart?
                    helm package chart/ --app-version ${VERSION} --version ${VERSION}
                    curl -v -f -u ${NEXUS_CREDS} http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_HELM}/ --upload-file ${APP_NAME}-${VERSION}.tgz
                '''
            }
        }

        stage("Deploy App") {
            failFast true
            parallel {
                stage("sandbox - helm3 publish and install"){
                    options {
                        skipDefaultCheckout(true)
                    }
                    agent {
                        node {
                            label "jenkins-slave-helm"
                        }
                    }
                    when {
                        expression { GIT_BRANCH.startsWith("dev") || GIT_BRANCH.startsWith("feature") || GIT_BRANCH.startsWith("fix") }
                    }
                    steps {
                        // TODO - if SANDBOX, create release in rando ns
                        sh '''
                            helm upgrade --install ${APP_NAME} \
                                --namespace=${TARGET_NAMESPACE} \
                                http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_HELM}/${APP_NAME}-${VERSION}.tgz
                        '''
                    }
                }
                stage("test env - ArgoCD sync") {
                    options {
                        skipDefaultCheckout(true)
                    }
                    agent {
                        node {
                            label "jenkins-slave-argocd"
                        }
                    }
                    when {
                        expression { GIT_BRANCH ==~ /(.*master)/ }
                    }
                    steps {
                        echo '### Commit new image tag to git ###'
                        sh  '''
                            # TODO ARGOCD create app?
                            # TODO - fix all this after chat with @eformat
                            git clone https://${ARGOCD_CONFIG_REPO} config-repo
                            cd config-repo
                            git checkout ${ARGOCD_CONFIG_REPO_BRANCH}

                            # TODO - @eformat we probs need to think about the app of apps approach or better logic here 
                            # as using array[0] is 🧻
                            yq w -i ${ARGOCD_CONFIG_REPO_PATH} 'applications[0].source_ref' ${VERSION}

                            git config --global user.email "jenkins@rht-labs.bot.com"
                            git config --global user.name "Jenkins"
                            git config --global push.default simple

                            git add ${ARGOCD_CONFIG_REPO_PATH}
                            git commit -m "🚀 AUTOMATED COMMIT - Deployment new app version ${VERSION} 🚀" || rc=$?
                            git remote set-url origin  https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@${ARGOCD_CONFIG_REPO}
                            git push -u origin ${ARGOCD_CONFIG_REPO_BRANCH}
                        '''

                        echo '### Ask ArgoCD to Sync the changes and roll it out ###'
                        sh '''
                            # 1. Check if app of apps exists, if not create?
                            # 1.1 Check sync not currently in progress . if so, kill it

                            # 2. sync argocd to change pushed in previous step
                            ARGOCD_INFO="--auth-token ${ARGOCD_CREDS_PSW} --server ${ARGOCD_SERVER_SERVICE_HOST}:${ARGOCD_SERVER_SERVICE_PORT_HTTP} --insecure"
                            argocd app sync catz ${ARGOCD_INFO}

                            # todo sync child app 
                            argocd app sync test-${NAME} ${ARGOCD_INFO}
                            argocd app wait test-${NAME} ${ARGOCD_INFO}
                        '''
                    }
                }


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
                '''
            }
        }

        stage("Promote app to Staging") {
            agent {
                node {
                    label "jenkins-slave-argocd"
                }
            }
            when {
                expression { GIT_BRANCH ==~ /(.*master)/ }
            }
            steps {
                sh  '''
                    # TODO ARGOCD create app?
                    # TODO - fix all this after chat with @eformat
                    git clone ${ARGOCD_CONFIG_REPO} config-repo
                    cd config-repo
                    git checkout ${ARGOCD_CONFIG_REPO_BRANCH}

                    # TODO - @eformat we probs need to think about the app of apps approach or better logic here 
                    # as using array[0] is 🧻
                    yq w -i ${ARGOCD_CONFIG_REPO_PATH} 'applications[3].source_ref' ${VERSION}

                    git config --global user.email "jenkins@rht-labs.bot.com"
                    git config --global user.name "Jenkins"
                    git config --global push.default simple

                    git add ${ARGOCD_CONFIG_REPO_PATH}
                    # grabbing the error code incase there is nothing to commit and allow jenkins proceed
                    git commit -m "🚀 AUTOMATED COMMIT - Deployment new app version ${VERSION} 🚀" || rc=$?
                    git remote set-url origin  https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@${ARGOCD_CONFIG_REPO}
                    git push -u origin ${ARGOCD_CONFIG_REPO_BRANCH}
                '''

                echo '### Ask ArgoCD to Sync the changes and roll it out ###'
                sh '''
                    # 1. Check if app of apps exists, if not create?
                    # 1.1 Check sync not currently in progress . if so, kill it

                    # 2. sync argocd to change pushed in previous step
                    ARGOCD_INFO="--auth-token ${ARGOCD_CREDS_PSW} --server ${ARGOCD_SERVER_SERVICE_HOST}:${ARGOCD_SERVER_SERVICE_PORT_HTTP} --insecure"
                    argocd app sync catz ${ARGOCD_INFO}

                    # todo sync child app 
                    argocd app sync ${NAME} ${ARGOCD_INFO}
                    argocd app wait ${NAME} ${ARGOCD_INFO}
                '''

                sh  '''
                    echo "merge versions back to the original GIT repo as they should be persisted?"
                    git checkout ${GIT_BRANCH}
                    yq w -i chart/Chart.yaml 'appVersion' ${VERSION}
                    yq w -i chart/Chart.yaml 'version' ${VERSION}

                    git add chart/Chart.yaml
                    git commit -m "🚀 AUTOMATED COMMIT - Deployment of new app version ${VERSION} 🚀" || rc=$?
                    git remote set-url origin https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@github.com/springdo/pet-battle.git
                    git push
                '''
            }
        }
    }
}
