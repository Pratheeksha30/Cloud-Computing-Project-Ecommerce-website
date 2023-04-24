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
        git init
      }
    }  
    
            
    stage('Test') {
      steps {
        git log
      }
    }
  }
}
