pipeline {

  environment {
    dockerimagename = "pes2ug20cs239/webapp"
    dockerImage = ""
  }

  agent any

  stages {

    stage('Checkout Source') {
      steps {
        git 'https://github.com/Pratheeksha30/Cloud-Computing-Project.git'
      }
    }

    stage('Build image') {
      steps{
        script {
          dockerImage = docker.build dockerimagename
        }
      }
    }

    stage('Pushing Image') {
      environment {
               registryCredential = 'dockerhub-credentials'
           }
      steps{
        script {
          docker.withRegistry( 'https://registry.hub.docker.com', registryCredential ) {
            dockerImage.push("latest")
          }
        }
      }
    }

    stage('Deploying WebApp container to Kubernetes') {
      steps {
        script {
          kubernetesDeploy(configs: "mongo-deployemnt.yaml","mongo-service.yaml","webapp-deployment.yaml", "webapp-service.yaml")
        }
      }
    }

  }

}
