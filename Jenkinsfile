// Jenkinsfile — Windows Jenkins agent (this machine's actual environment).
// Requires the "HTML Publisher" and "Allure Jenkins" plugins for the
// reporting stage. If your agent isn't Windows, replace `bat` with `sh`
// throughout and adjust `tools`/paths accordingly.

pipeline {
    agent any

    tools {
        // Name must match a NodeJS installation configured under
        // Manage Jenkins > Tools > NodeJS installations. If your agent
        // already has Node on PATH, remove this block entirely.
        nodejs 'NodeJS-20'
    }

    parameters {
        choice(name: 'TEST_ENV', choices: ['qa', 'dev', 'prod'], description: 'Which config/environments/*.config.ts to use')
    }

    environment {
        // Playwright/Jenkins convention: CI=true switches playwright.config.ts
        // to headless mode and enables retries (Phase 3). Jenkins does not
        // set this on its own — it must be declared explicitly here.
        CI = 'true'
        TEST_ENV = "${params.TEST_ENV}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install --with-deps'
            }
        }

        stage('TypeScript Check') {
            steps {
                bat 'npm run typecheck'
            }
        }

        stage('Smoke Tests') {
            steps {
                bat 'npm run test:smoke'
            }
        }

        stage('Regression Tests') {
            steps {
                bat 'npm run test:regression'
            }
        }
    }

    post {
        always {
            // A Jenkins agent always has a JVM (Jenkins itself requires one),
            // so — unlike the local machine this framework was built on —
            // Allure's HTML report generation works here without extra setup.
            allure([
                includeProperties: false,
                results: [[path: 'reports/allure-results']],
            ])

            publishHTML(target: [
                reportDir: 'reports/playwright',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true,
            ])

            archiveArtifacts artifacts: 'reports/**, test-results/**, screenshots/**, logs/**', allowEmptyArchive: true
        }

        failure {
            echo 'Build failed — see the Playwright HTML report and archived screenshots/videos/traces for evidence.'
        }
    }
}
