env.PROJ_DIR="${JENKINS_HOME}/workspace"        //jenkins  workspace
env.PROJ_DIR_HOSTPATH="/opt/data/jenkinsdata/workspace"
env.PROJ_URL="http://xx.xx.xx:7166/vue/vAdmin-web.git"  // 项目的http地址
//env.PROJ_NAME="*********" // 项目名
env.LANGUAGE="node" //基础镜像
env.TAGS="14.16.0-alpine"     //基础镜像TAG
env.HARBOR="registry.cn-beijing.aliyuncs.com/k8s22333"  //镜像仓库的URL
env.INAME="vadmin-web"  //制作的镜像名(自定义时不要使用大写字母)
//    String tag='latest' //制作的镜像TAG

node {
  wrap([$class: 'BuildUser']) {
    def user = env.BUILD_USER_ID
    def email = env.BUILD_USER_EMAIL
    println user
  }
  
  //def env = ["JAVA_HOME=${tool 'jdk1.8.0_131'}", "PATH+MAVEN=${tool 'maven_3.1.1'}/bin:${env.JAVA_HOME}/bin", "PATH+GRADLE=${tool 'gradle_4.1'}/bin:${env.JAVA_HOME}/bin" ]

  //def err = null
  //currentBuild.result = "SUCCESS"
}


def InPutCheckBranch(){
    timeout(time:10, unit:'SECONDS') {
        INPUT = input message: "两次输入不一致! 请重新输入你想构建的代码分支",
        ok: "do it",
        // submitter: "zhahuangbo",
        parameters: [
        string(name: 'branch', defaultValue: '', description: 'input your branch'),
        string(name: 'branch_confirm', defaultValue: '', description: 'input your branch again'),
        ]
    }
    env.branch="${INPUT.branch}"
}

class MyChange {
   String author;
   String msg;
}
@NonCPS
def GetChanges(){
    def changeLogSets = currentBuild.changeSets
    for (int i = 0; i < changeLogSets.size(); i++)
    {
        def entries = changeLogSets[0].items
        for (int j = 0; j < entries.length; j++)
        {
            def entry = entries[0]
            def change = new MyChange()
            change.author = entry.author
            change.msg = entry.msg
            return change
        }
    }
}

pipeline {
    agent any
    
    //triggers {
    //    cron('H 4/* 0 0 1-5')
    //}
    
    //tools {
        //工具名称必须在Jenkins 管理Jenkins → 全局工具配置中预配置。
    //    maven 'apache-maven-3.0.1'
    //}
    
    environment {
        _workspace = "${env.WORKSPACE}"
        _projectName = "${env.JOB_NAME}"
        _BUILD_NUMBER = "${env.BUILD_NUMBER}"
        //_ScannerMsBuildHome = "C:\\Users\\htsd\\Downloads\\sonar-scanner-msbuild-4.6.1.2049-net46"
        //_MSBuildHome = "C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Enterprise\\MSBuild\\15.0\\Bin\\amd64"
    }
    
    stages {
        
        stage('Example') {
            steps {
                echo 'Hello World'

                script {
                    def browsers = ['chrome', 'firefox']
                    for (int i = 0; i < browsers.size(); ++i) {
                        echo "Testing the ${browsers[i]} browser"
                    }
                }
            }
        }
        
        stage('Get code') {
            steps {
            checkout([                      // git repo
                $class: 'GitSCM',
                branches: [[name: '*/master']],
                doGenerateSubmoduleConfigurations: false,
                extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: './']],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: 'vugitlab',
                    url: 'http://xx.xx.xx:7166/vue/vAdmin-web.git'
                ]]
            ])
            }
        }
        
        stage('Get commit_msg') {
            steps {
                script {
                    env.commitmsg = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
                    env.tagfull = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.tag = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.GIT_COMMIT_EMAIL = sh(script: "git --no-pager show -s --format=\'%ae\'", returnStdout: true).trim()
                    env.BUILD_FULL = sh (script: "git log -1 --pretty=%B | grep '\\[jenkins-full]'",returnStatus: true) == 0
                }   
            }
        }
        
        stage('Sonar scan') {
            steps {
                // groovy 脚本
                sh "echo ${WORKSPACE} "
                sh "echo ${JOB_NAME} "
                //sh "echo ${deploy_step} "
                //sh "echo ${env.JOB_NAME} "
                
                // groovy 脚本
                script {
                switch(SONAR_SCAN) {
                case "TRUE":
                    sh "echo \u001B[31m不扫描\u001B[0m ！！！"
                default:
                    sh "echo 扫描"
                    sh '''/var/jenkins_home/sonar-scanner-4.6.0.2311/bin/sonar-scanner \
                    -Dsonar.projectKey=vadmin-web \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://xx.xx.xx:9000 \
                    -Dsonar.login=admin \
                    -Dsonar.password=sftf0423@'''
                }
                }
            }
        }

        stage('Docker Build') {           //构建镜像,ssh到远程主机执行命令，该命令要用""，Dodckerfile顶格
            steps {
            withEnv(["IMAGE_TAG=${tag}"]) {
            sh '''
                  ssh -i /var/jenkins_home/id_rsa  root@172.19.142.17 "cd $PROJ_DIR_HOSTPATH/$JOB_NAME/;
                  cat << EOF > Dockerfile
FROM ${LANGUAGE}:${TAGS} as builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add python2 make gcc
RUN mkdir /tmp/$JOB_NAME
COPY . /tmp/$JOB_NAME/
#RUN npm i node-sass -s -g cnpm --unsafe-perm --registry=http://registry.npm.taobao.org/ 
RUN npm install -g cnpm --registry=http://registry.npm.taobao.org/
RUN npm config set registry http://registry.npm.taobao.org
RUN cd /tmp/$JOB_NAME && cnpm install --save vue-fontawesome-elementui-icon-picker
RUN cd /tmp/$JOB_NAME && cnpm install
RUN cd /tmp/$JOB_NAME && npm run build:prod
FROM nginx as prod
COPY --from=builder /tmp/$JOB_NAME/dist  /usr/share/nginx/html
COPY --from=builder /tmp/$JOB_NAME/nginx.conf /etc/nginx/conf.d/$JOB_NAME.conf
EXPOSE 80
CMD [\\"nginx\\", \\"-g\\", \\"daemon off;\\"]
EOF
            docker build -t ${HARBOR}/${INAME}:$IMAGE_TAG ."
              '''
           }
        }
        }
        
        stage('Image Push') {              //上传镜像到远程镜像仓库
            steps {
            withEnv(["IMAGE_TAG=${tag}"]) {    
            sh '''
            ssh -i /var/jenkins_home/id_rsa  root@172.19.142.17 "docker push ${HARBOR}/${INAME}:$IMAGE_TAG;
            "
            '''
        }
            }
        }
       
       //部署阶段
       
       stage('Image Pull') {              //从远程镜像仓库拉取镜像
            steps {
            withEnv(["IMAGE_TAG=${tag}"]) {
            sh '''
            ssh -i /var/jenkins_home/id_rsa  root@172.19.142.17 "docker pull ${HARBOR}/${INAME}:$IMAGE_TAG"
            '''
       }
            }
       }
       
       stage('Remove old container') {              //删除原有容器
            steps {
            script {
            try{
                sh '''
                ssh -i /var/jenkins_home/id_rsa  root@172.19.142.17 "docker rm -f $JOB_NAME"
                '''
            }catch (error){
            }finally{
                echo "remove old container success"
            }
            }
            }
       }
        
        stage("Image Deploy") {
            steps {
                withEnv(["IMAGE_TAG=${tag}"]) {
                timeout(time: 1, unit: 'MINUTES') {
                script {
                    //env.DEPLOY_ENV = input message: '选择部署的环境', ok: 'deploy',
                    //    parameters: [choice(name: 'DEPLOY_ENV', choices: ['dev', 'test', 'pre', 'prd'], description: '选择部署环境')]

                        //switch("${env.DEPLOY_ENV}"){
                        switch("${environment}"){
                            case 'dev':
                                println('deploy dev env')
                                sh '''
                                ssh -i /var/jenkins_home/id_rsa  root@172.19.142.17 "docker run -d -p 7178:80 --name=$JOB_NAME ${HARBOR}/${INAME}:${IMAGE_TAG}"
                                '''
                                echo '记录线上版本'
                                sh "echo > /var/jenkins_home/onlineRevision/${JOB_NAME}.${tagfull}.`date '+%Y%m%d-%H:%M:%y'`.revision" 
                                break;

                            case 'test':
                                println('deploy test env')
                                break;

                            case 'pre':
                                println('deploy pre env')
                                break;
                            
                            case 'prd':
                                println('deploy prd env')
                                break;
                            
                            default:
                                println('error env')

                        }
                    }
                }
            }
        }
        }       
    }
    
    post { //stages所有任务执行后触发post
    
        always { //发送钉钉通知
           echo "构建、部署"
           //echo 'Dingtalk Notification'
           //sh "python3 sonar.py" 
        } 
          
        failure { //构建失败通知
            echo "构建失败"
            //dingTalk accessToken:'（钉钉通知密钥）',imageUrl: '', jenkinsUrl: 'http://xx.xx.xx:7176/', message: '代码部署失败', notifyPeople: 'phone'
        }
 
        success { //构建成功通知
            echo "构建成功"
            //dingTalk accessToken:'（钉钉通知密钥）',imageUrl: '', jenkinsUrl: 'http://xx.xx.xx:7176/', message: '代码部署成功', notifyPeople: 'phone'
        }
    
    }

}