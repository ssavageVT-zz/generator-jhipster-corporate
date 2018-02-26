/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
    askPipelines,
    askIntegrations
};

function askPipelines() {
    if (this.abort) return;
    if (this.autoconfigureTravis) {
        this.log('Auto-configuring Travis CI');
        this.pipelines = ['travis'];
        return;
    }
    if (this.autoconfigureJenkins) {
        this.log('Auto-configuring Jenkins');
        this.pipelines = ['jenkins'];
        return;
    }
    const done = this.async();
    const prompts = [
        {
            type: 'checkbox',
            name: 'pipelines',
            message: 'What CI/CD pipeline do you want to generate?',
            default: [],
            choices: [
                { name: 'Jenkins pipeline', value: 'jenkins' },
                { name: 'Travis CI', value: 'travis' },
                { name: 'GitLab CI', value: 'gitlab' },
                { name: 'CircleCI', value: 'circle' }
            ]
        }
    ];
    this.prompt(prompts).then((props) => {
        if (props.pipelines.length === 0) {
            this.abort = true;
        }
        this.pipelines = props.pipelines;
        done();
    });
}

function askIntegrations() {
    if (this.abort || this.pipelines.length === 0) return;
    if (this.autoconfigureTravis) {
        this.heroku = [];
        return;
    }
    if (this.autoconfigureJenkins) {
        this.heroku = [];
        this.jenkinsIntegrations = [];
        return;
    }
    const done = this.async();
    const herokuChoices = [];
    const ecsChoices = [];
    if (this.pipelines.includes('jenkins')) {
        herokuChoices.push({ name: 'In Jenkins pipeline', value: 'jenkins' });
        ecsChoices.push({ name: 'In Jenkins pipeline', value: 'jenkins' });
    }
    if (this.pipelines.includes('gitlab')) {
        herokuChoices.push({ name: 'In GitLab CI', value: 'gitlab' });
    }
    if (this.pipelines.includes('circle')) {
        herokuChoices.push({ name: 'In CircleCI', value: 'circle' });
    }
    if (this.pipelines.includes('travis')) {
        herokuChoices.push({ name: 'In Travis CI', value: 'travis' });
    }

    const prompts = [
        {
            when: this.pipelines.includes('jenkins'),
            type: 'checkbox',
            name: 'jenkinsIntegrations',
            message: 'Jenkins pipeline: what tasks/integrations do you want to include?',
            default: [],
            choices: [
                { name: 'Perform the build in a Docker container', value: 'docker' },
                { name: 'Analyze code with Sonar', value: 'sonar' },
                { name: 'Send build status to GitLab', value: 'gitlab' },
                { name: 'Build and publish a Docker image', value: 'publishDocker' }
                //{ name: 'Deploy Docker Container to AWS ECS', value: 'deployECS' }
            ]
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.jenkinsIntegrations.includes('sonar'),
            type: 'input',
            name: 'jenkinsSonarName',
            message: 'What is the name of the Sonar server?',
            default: 'Sonar'
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.jenkinsIntegrations.includes('publishDocker'),
            type: 'input',
            name: 'dockerRegistryURL',
            message: 'What is the URL of the Docker registry?',
            default: 'https://registry.hub.docker.com'
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.jenkinsIntegrations.includes('publishDocker'),
            type: 'input',
            name: 'dockerRegistryCredentialsId',
            message: 'What is the Jenkins Credentials ID for the Docker registry?',
            default: 'docker-login'
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.jenkinsIntegrations.includes('publishDocker'),
            type: 'input',
            name: 'dockerRegistryOrganizationName',
            message: 'What is the Organization Name for the Docker registry?',
            default: 'docker-login'
        },
        {
            when: this.pipelines.includes('gitlab'),
            type: 'confirm',
            name: 'gitlabUseDocker',
            message: 'In GitLab CI, perform the build in a docker container (hint: GitLab.com uses Docker container)?',
            default: false
        },
        {
            when: (this.pipelines.includes('jenkins') || this.pipelines.includes('gitlab') || this.pipelines.includes('circle') || this.pipelines.includes('travis')) && this.herokuAppName,
            type: 'checkbox',
            name: 'deployment',
            message: 'Would you like to deploy your application?',
            default: [],
            choices: [
                { name: 'Deploy to Heroku', value: 'deployHeroku' },
                { name: 'Deploy to AWS ECS', value: 'deployECS' }
            ]
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.deployment.includes('deployHeroku'),
            type: 'checkbox',
            name: 'heroku',
            message: 'Deploy to heroku?',
            default: [],
            choices: herokuChoices
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.deployment.includes('deployECS'),
            type: 'checkbox',
            name: 'awsEcs',
            message: 'Deploy to AWS ECS?',
            default: [],
            choices: ecsChoices
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'serviceName',
            message: 'What is your ECS service name?',
            default: 'default'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'imageName',
            message: 'What is your image name?',
            default: 'default'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'cloudWatchLogGroup',
            message: 'What is your CloudWatch group?',
            default: 'default'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'clusterName',
            message: 'What is your cluster name?',
            default: 'default'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'targetGroupARN',
            message: 'What is the target group ARN?',
            default: 'none'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'portNumber',
            message: 'What port number?',
            default: '8080'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'desiredCount',
            message: 'How many container instances?',
            default: '1'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'ecsMemory',
            message: 'How much memory would you like allocated?',
            default: '2048'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'ecsCPU',
            message: 'How much CPU would you like allocated?',
            default: '256'
        },
        {
            when: response => response.deployment.includes('deployECS'),
            type: 'input',
            name: 'iamRole',
            message: 'What is the IAM Role for your containers?',
            default: 'default'
        },
    ];
    this.prompt(prompts).then((props) => {
        this.jenkinsIntegrations = props.jenkinsIntegrations;
        this.jenkinsSonarName = props.jenkinsSonarName;
        this.dockerRegistryURL = props.dockerRegistryURL;
        this.dockerRegistryCredentialsId = props.dockerRegistryCredentialsId;
        this.dockerRegistryOrganizationName = props.dockerRegistryOrganizationName;
        this.gitlabUseDocker = props.gitlabUseDocker;
        this.heroku = props.heroku;
        this.deployment = props.deployment;
        this.serviceName = props.serviceName;
        this.imageName = props.imageName;
        this.cloudWatchLogGroup = props.cloudWatchLogGroup;
        this.clusterName = props.clusterName;
        this.targetGroupARN = props.targetGroupARN;
        this.portNumber = props.portNumber;
        this.desiredCount = props.desiredCount;
        this.ecsMemory = props.ecsMemory;
        this.ecsCPU = props.ecsCPU;
        this.iamRole = props.iamRole;
        done();
    });
}
