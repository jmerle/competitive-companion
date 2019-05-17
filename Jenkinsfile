pipeline {
    agent any

    triggers {
        cron(env.BRANCH_NAME == "master" ? "@daily" : "")
    }

    stages {
        stage("Quality Assurance") {
            agent {
                docker "buildkite/puppeteer"
            }

            stages {
                stage("Install dependencies") {
                    steps {
                        sh "yarn install --frozen-lockfile"
                    }
                }

                stage("Build") {
                    steps {
                        sh "yarn build"
                    }
                }

                stage("Lint code") {
                    steps {
                        sh "yarn lint:tslint"
                        sh "yarn lint:prettier"
                    }
                }

                stage("Lint package") {
                    steps {
                        sh "yarn lint:package"
                    }
                }

                stage("Test") {
                    when {
                        branch "master"
                    }

                    steps {
                        sh "yarn test:coverage"
                    }
                }
            }
        }

        stage("Analysis") {
            agent {
                docker {
                    image "noenv/node-sonar-scanner"
                    args "--network web"
                }
            }

            when {
                branch "master"
            }

            steps {
                withSonarQubeEnv("sonar.jmerle.dev") {
                    sh "sonar-scanner -Dsonar.projectVersion=${BUILD_NUMBER}"
                }
            }
        }
    }

    post {
        failure {
            script {
                if (env.BRANCH_NAME == "master") {
                    emailext(
                        to: "jaspervmerle@gmail.com",
                        from: "\"jenkins.jmerle.dev\" <jmerlenoreply@gmail.com>",
                        subject: "Competitive Companion build #${env.BUILD_NUMBER} failed",
                        body: "Something went wrong while running build #${env.BUILD_NUMBER} on the master branch of Competitive Companion.\n\nBuild details: ${env.BUILD_URL}"
                    )
                }
            }
        }
    }
}
