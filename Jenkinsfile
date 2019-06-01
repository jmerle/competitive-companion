pipeline {
    agent any

    triggers {
        cron(BRANCH_NAME == "master" ? "@daily" : "")
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
                        beforeAgent true
                        allOf {
                            branch "master"
                            triggeredBy "TimerTrigger"
                        }
                    }

                    steps {
                        sh "yarn test:coverage"
                    }

                    post {
                        failure {
                            script {
                                emailext(
                                    to: "jaspervmerle@gmail.com",
                                    from: "\"jenkins.jmerle.dev\" <jmerlenoreply@gmail.com>",
                                    subject: "Competitive Companion build #${BUILD_NUMBER} failed",
                                    body: "Something went wrong while running build #${BUILD_NUMBER} on the master branch of Competitive Companion.\n\nBuild details: ${env.BUILD_URL}"
                                )
                            }
                        }
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
                beforeAgent true
                allOf {
                    branch "master"
                    triggeredBy "TimerTrigger"
                }
            }

            steps {
                withSonarQubeEnv("sonar.jmerle.dev") {
                    sh "sonar-scanner -Dsonar.projectVersion=${BUILD_NUMBER}"
                }
            }
        }
    }
}
