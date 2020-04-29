pipeline {

    agent {
        // label "" also could have been 'agent any' - that has the same meaning.
        label "master"
    }

    environment {
        // GLobal Vars
        PIPELINES_NAMESPACE = "ds-ci-cd"
        APP_NAME = "pet-battle"

        JENKINS_TAG = "${JOB_NAME}.${BUILD_NUMBER}".replace("/", "-")
        JOB_NAME = "${JOB_NAME}".replace("/", "-")

        GIT_SSL_NO_VERIFY = true
        GIT_CREDENTIALS = credentials("${PIPELINES_NAMESPACE}-git-auth-ds")
        NEXUS_CREDS = credentials("${PIPELINES_NAMESPACE}-nexus-password-ds")
        ARGOCD_CREDS = credentials("${PIPELINES_NAMESPACE}-argocd-token-ds")
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
            steps {
                git url: "https://github.com/springdo/pet-battle.git"
                sh 'printenv'

                echo '### Install deps ###'
                // TODO - set proxy via nexus
                sh 'npm install'

                echo '### Running linter ###'
                // sh 'npm run lint'

                echo '### Running tests ###'
                // sh 'npm run test'

                echo '### Running build ###'
                sh '''
                    npm run build
                '''

                echo '### Packaging App for Nexus ###'
                sh '''
                    PACKAGE=${APP_NAME}-0.1.0-${JENKINS_TAG}.tar.gz
                    tar -zcvf $PACKAGE dist Dockerfile nginx.conf
                    curl -vvv -u ${NEXUS_CREDS} --upload-file $PACKAGE http://${NEXUS_SERVICE_SERVICE_HOST}:${NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE}
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
                echo '### Get Binary from Nexus and shove it in a box ###'
                sh  '''
                        rm -rf package-contents*
                        PACKAGE=${APP_NAME}-0.1.0-${JENKINS_TAG}.tar.gz
                        curl -v -f -u ${NEXUS_CREDS} http://${NEXUS_SERVICE_SERVICE_HOST}:${NEXUS_SERVICE_SERVICE_PORT}/repository/${NEXUS_REPO_NAME}/${APP_NAME}/${PACKAGE} -o ${PACKAGE}
                        # TODO think about labeling of images for version purposes 
                        # oc patch bc ${APP_NAME} -p "{\\"spec\\":{\\"output\\":{\\"imageLabels\\":[{\\"name\\":\\"THINGY\\",\\"value\\":\\"MY_AWESOME_THINGY\\"},{\\"name\\":\\"OTHER_THINGY\\",\\"value\\":\\"MY_OTHER_AWESOME_THINGY\\"}]}}}"

                        oc start-build ${APP_NAME} --from-archive=${PACKAGE} --follow
                        oc tag ${PIPELINES_NAMESPACE}/${APP_NAME}:latest ds-dev/${APP_NAME}:${JENKINS_TAG}
                    '''
            }
        }

        stage("Deploy (ArgoCD)") {
            agent {
                node {
                    label "jenkins-slave-argocd"
                }
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
                    git push https://${GIT_CREDENTIALS_USR}:${GIT_CREDENTIALS_PSW}@github.com/springdo/ubiquitous-journey.git
                '''

                echo '### Ask ArgoCD to Sync the changes and roll it out ###'
                sh '''
                    # 1. Check if app of apps exists, if not create?
                    # 1.1 Check sync not currently in progress . if so, kill it
                    # 2. sync argocd to change pushed in previous step
                    argocd app sync catz --auth-token $ARGOCD_CREDS_PSW --server ${ARGOCD_SERVER_SERVICE_HOST}:${ARGOCD_SERVER_SERVICE_PORT_HTTP} --insecure
                '''
                echo '### Verify OCP Deployment ###'
            }
        }
    }
}
