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

        env.PACKAGE = "${APP_NAME}-${VERSION}-${JENKINS_TAG}.tar.gz"

        IMAGE_REPOSITORY= 'image-registry.openshift-image-registry.svc:5000'

        GIT_SSL_NO_VERIFY = true
        // Credentials bound in OpenShift
        GIT_CREDS = credentials("${PIPELINES_NAMESPACE}-git-auth-ds2")
        NEXUS_CREDS = credentials("${PIPELINES_NAMESPACE}-nexus-password-ds")
        ARGOCD_CREDS = credentials("${PIPELINES_NAMESPACE}-argocd-token-ds")

        // Nexus Artifact repo 
        NEXUS_REPO_NAME="labs-static"
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
                            env.TARGET_NAMESPACE = "labs-test"
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
                            env.TARGET_NAMESPACE = "labs-dev"
                            env.VERSION = "cat package.json | jq -r .version".execute().text.minus("'").minus("'")
                            env.PACKAGE = "${APP_NAME}-${VERSION}-${JENKINS_TAG}.tar.gz"
                            env.PROJECT_NAMESPACE = "ds-dev"
                            env.NODE_ENV = "test"
                            env.E2E_TEST_ROUTE = "oc get route/${APP_NAME} --template='{{.spec.host}}' -n ${PROJECT_NAMESPACE}".execute().text.minus("'").minus("'")
                            env.APP_NAME = "pet-battle-${GIT_BRANCH}".replace("/", "-").toLowerCase()
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
                            env.TARGET_NAMESPACE = "labs-dev"
                            env.APP_NAME = "pet-battle-${GIT_BRANCH}".replace("/", "-").toLowerCase()
                        }
                    }
                }
            }
        }
        stage("ArgoCD Create App") {
            agent {
                node {
                    label "master"
                }
            }
            when {
              expression { BUILD_NUMBER == 1 }
            }
            steps {
                echo '### Create ArgoCD App ? ###'
                sh '''
                    echo "TODO"
                '''
            }
        }
        stage("Build (Compile App)") {
            agent {
                node {
                    label "jenkins-slave-npm"
                }
            }
            when {
                expression { GIT_BRANCH ==~ /(.*master|.*develop)/ }
            }
            steps {
                // git url: "https://github.com/springdo/pet-battle.git"
                sh 'printenv'

                echo '### Install deps ###'
                // TODO - set proxy via nexus
                // sh 'npm install'
                sh 'npm  --registry http://${NEXUS_SERVICE_SERVICE_HOST}:${NEXUS_SERVICE_SERVICE_PORT}/repository/labs-npm ci'

                echo '### Running linter ###'
                // sh 'npm run lint'
                // helm lint

                echo '### Running tests ###'
                // sh 'npm run test'

                echo '### Running build ###'
                sh '''
                    npm run build
                '''

                echo '### Packaging App for Nexus ###'
                sh '''
                    # PACKAGE=${APP_NAME}-0.1.0-${JENKINS_TAG}.tar.gz
                    tar -zcvf ${PACKAGE} dist Dockerfile nginx.conf
                    curl -vvv -u ${NEXUS_CREDS} --upload-file ${PACKAGE} http://${NEXUS_SERVICE_SERVICE_HOST}:${NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE}
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
            when {
                expression { GIT_BRANCH ==~ /(.*master|.*develop)/ }
            }
            steps {
                echo '### Get Binary from Nexus and shove it in a box ###'
                sh  '''
                    rm -rf package-contents*
                    # PACKAGE=${APP_NAME}-0.1.0-${JENKINS_TAG}.tar.gz
                    curl -v -f -u ${NEXUS_CREDS} http://${NEXUS_SERVICE_SERVICE_HOST}:${NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE} -o ${PACKAGE}
                    # TODO think about labeling of images for version purposes 
                    oc get bc ${APP_NAME}
                    if [ $? -eq 0 ]; then
                    # TODO - Think about labelling images. perhaps use --build-args=[git_commit=abd14] or something to map to the LABELS in the dockerfile  
                    # oc patch bc ${APP_NAME} -p "{\\"spec\\":{\\"output\\":{\\"imageLabels\\":[{\\"name\\":\\"git-commit\\",\\"value\\":\\"$GIT_COMMIT\\"},{\\"name\\":\\"build-url\\",\\"value\\":\\"$BUILD_URL\\"},{\\"name\\":\\"jenkins-tag\\",\\"value\\":\\"$JENKINS_TAG\\"}]}}}"
                    oc start-build ${APP_NAME} --from-archive=${PACKAGE} --follow
                    
                    else
                    oc new-build --binary --name=${APP_NAME} -l app=${APP_NAME} --strategy=docker --follow
                    fi
                    oc tag ${PIPELINES_NAMESPACE}/${APP_NAME}:latest ${TARGET_NAMESPACE}/${APP_NAME}:${VERSION}
                '''
            }
        }

        stage("Deploy (via helm install)") {
            agent {
                node {
                    label "jenkins-slave-helm"
                }
            }
            when {
                expression { GIT_BRANCH ==~ /(.*jenkins|.*develop)/ }
            }
            steps {
                // TODO - if SANDBOX, create release in rando ns
                sh '''
                    helm lint helm
                '''
                // TODO - if SANDBOX, create release in rando ns
                sh '''
                    helm upgrade --install ${APP_NAME} helm \
                        --namespace=${TARGET_NAMESPACE} \
                        --set image_name=${APP_NAME}
                        --set app_tag=${VERSION} \
                        --set image_repository=${IMAGE_REPOSITORY} \
                        --set image_namespace=${TARGET_NAMESPACE}
                '''
            }
        
        }

        
        stage("Deploy (ArgoCD)") {

            // TODO - break this down into a  parallel if / else type thingy
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
                    git clone https://github.com/springdo/ubiquitous-journey.git
                    cd ubiquitous-journey
                    yq w -i example-deployment/values-applications.yaml 'pet_battle.app_tag' ${JENKINS_TAG}

                    git config --global user.email "jenkins@rht-labs.bot.com"
                    git config --global user.name "Jenkins"
                    git add example-deployment/values-applications.yaml
                    git commit -m "🚀 AUTOMATED COMMIT - Deployment new app version ${JENKINS_TAG} 🚀"
                    git push https://${GIT_CREDS_USR}:${GIT_CREDS_PSW}@github.com/springdo/ubiquitous-journey.git
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

        // stage("Helm version update") {
        //     agent {
        //         node {
        //             label "jenkins-slave-helm"
        //         }
        //     }
        //     steps {
        //         yq -w -i helm/Chart.yaml 'appVersion' ${JENKINS_TAG} ..
                
        //         // after this should I bump chart version in UJ again or use "source_ref: master" 
        //     }
        // }
    
        // stage("Test stuff..") {
        //     agent {
        //         node {
        //             label "jenkins-slave-.."
        //         }
        //     }
        //     steps {
        //         //TODO
        //     }

        // }


    }
}
