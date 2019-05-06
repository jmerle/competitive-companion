pipeline {
    agent any

    stages {
        stage("Quality Assurance") {
            agent {
                docker "weboaks/node-karma-protractor-chrome:headless"
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

                stage("Lint") {
                    steps {
                        sh "yarn lint"
                    }
                }

                stage("Test") {
                    steps {
                        sh "yarn test:coverage -t google"
                        stash name: "code-coverage", includes: "coverage/lcov.info"
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
                unstash "code-coverage"

                withSonarQubeEnv("sonar.jmerle.dev") {
                    sh "sonar-scanner"
                }
            }
        }
    }
}
