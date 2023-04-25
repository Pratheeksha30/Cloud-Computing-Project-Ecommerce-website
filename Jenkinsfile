pipeline {
  agent any
    
  tools {nodejs "node"}
    
  stages {
        
    stage('Git') {
      steps {
        git 'https://github.com/Pratheeksha30/Cloud-Computing-Project.git'
      }
    }
     
    stage('Build') {
      steps {
        sh npm install
      }
    }  
    
            
    stage('Test') {
      steps {
        git 'https://github.com/Pratheeksha30/Cloud-Computing-Project.git'
      }
    }
  }
}
