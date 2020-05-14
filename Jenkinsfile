pipeline {
    agent {
        label "master"
    }

    environment {
        // GLobal Vars
        PIPELINES_NAMESPACE = "ds-ci-cd"
        APP_NAME = "pet-battle"
        VERSION = "latest"
        
        JENKINS_TAG = "${JOB_NAME}.${BUILD_NUMBER}".replace("/", "-")
        // Job name contains the branch
        JOB_NAME = "${JOB_NAME}".replace("/", "-")

        IMAGE_REPOSITORY= 'image-registry.openshift-image-registry.svc:5000'

        GIT_SSL_NO_VERIFY = true
        // Credentials bound in OpenShift
        GIT_CREDS = credentials("${PIPELINES_NAMESPACE}-git-auth")
        NEXUS_CREDS = credentials("${PIPELINES_NAMESPACE}-nexus-password")
        ARGOCD_CREDS = credentials("${PIPELINES_NAMESPACE}-argocd-token")

        // Nexus Artifact repo 
        NEXUS_REPO_NAME="labs-static"
        NEXUS_HELM_REPO = "helm-charts"
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
                            // env.APP_NAME = "${GIT_BRANCH}-${APP_NAME}".replace("/", "-").toLowerCase()
                        }
                    }
                }
                stage("Sandbox Build") {
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
                            // in multibranch the job name is just the git branch name
                            env.APP_NAME = "${GIT_BRANCH}-${APP_NAME}".replace("/", "-").toLowerCase()
                            env.NODE_ENV = "test"
                        }
                    }
                }
                stage("Pull Request Build") {
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
                            env.APP_NAME = "${GIT_BRANCH}-${APP_NAME}".replace("/", "-").toLowerCase()
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
                // git url: "https://github.com/springdo/pet-battle.git"


                script {
                    env.VERSION = sh(returnStatus: true, script: "npm run version --silent")
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
                    curl -vvv -u ${NEXUS_CREDS} --upload-file ${PACKAGE} http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE}
                '''
            }
            // Post can be used both on individual stages and for the entire build.
        }

        stage("Bake (OpenShift Build)") {
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

                    oc get bc ${APP_NAME} || rc=$?
                    BUILD_ARGS=" --build-arg git_commit=${GIT_COMMIT} --build-arg git_url=${GIT_URL}  --build-arg build_url=${RUN_DISPLAY_URL} --build-arg build_tag=${BUILD_TAG}"
                    echo ${BUILD_ARGS}

                    # TODO - ENABLE THIS AS S43 is fooooked
                    if [ $rc -eq 1 ]; then
                        echo " 🏗 no build - creating one 🏗"
                        oc new-build --binary --name=${APP_NAME} -l app=${APP_NAME} ${BUILD_ARGS} --strategy=docker
                    else
                        echo " 🏗 build found - starting it  🏗"
                        oc start-build ${APP_NAME} --from-archive=${PACKAGE} ${BUILD_ARGS} --follow
                    fi
                    

                    oc tag ${PIPELINES_NAMESPACE}/${APP_NAME}:latest ${TARGET_NAMESPACE}/${APP_NAME}:${VERSION}
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
                    curl -vvv -u ${NEXUS_CREDS} http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${HELM_REPO} --upload-file ${APP_NAME}-${VERSION}.tgz
                '''
            }
        }

        stage("Deploy App") {
            failFast true
            parallel {
                stage("sandbox - helm3 publish and install"){
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
                                http://${SONATYPE_NEXUS_SERVICE_SERVICE_HOST}:${SONATYPE_NEXUS_SERVICE_SERVICE_PORT}/repository/${HELM_REPO}/${APP_NAME}-${VERSION}.tgz
                        '''
                    }
                }
                stage("test env - ArgoCD sync") {
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
                            git clone https://github.com/springdo/ubiquitous-journey.git
                            cd ubiquitous-journey
                            yq w -i example-deployment/values-applications.yaml 'pet_battle.app_tag' ${VERSION}

                            git config --global user.email "jenkins@rht-labs.bot.com"
                            git config --global user.name "Jenkins"
                            git config --global push.default simple

                            git add example-deployment/values-applications.yaml
                            git commit -m "🚀 AUTOMATED COMMIT - Deployment new app version ${VERSION} 🚀"
                            # git push https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@github.com/springdo/ubiquitous-journey.git
                        '''

                        echo '### Ask ArgoCD to Sync the changes and roll it out ###'
                        sh '''
                            # 1. Check if app of apps exists, if not create?
                            # 1.1 Check sync not currently in progress . if so, kill it

                            # 2. sync argocd to change pushed in previous step
                            ARGOCD_INFO="--auth-token ${ARGOCD_CREDS_PSW} --server ${ARGOCD_SERVER_SERVICE_HOST}:${ARGOCD_SERVER_SERVICE_PORT_HTTP} --insecure"
                            argocd app sync catz ${ARGOCD_INFO}

                            # todo sync child app 
                            argocd app sync pb-front-end ${ARGOCD_INFO}
                            argocd app wait pb-front-end ${ARGOCD_INFO}
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
                    label "master"
                }
            }
            when {
                expression { GIT_BRANCH ==~ /(.*master)/ }
            }
            steps {
                sh  '''
                    echo "merge versions back to the GIT repo as they should be persisted?"
                '''
                
                sh  '''
                    echo "TODO - Run ArgoCD Sync 2 for staging env"
                '''
            }
        }
    }
}
