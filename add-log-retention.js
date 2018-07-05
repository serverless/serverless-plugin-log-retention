'use strict';

const nco = require('nco');
const semver = require('semver');

//values from http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutRetentionPolicy.html
const validRetentionInDays = [1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653];

class AwsAddLogRetention {
  constructor(serverless, options) {
    if(!semver.satisfies(serverless.version, '>= 1.20.2')) {
      throw new Error('serverless-plugin-log-retention requires serverless 1.20.2 or higher');
    }

    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
    this.hooks = {
      'package:createDeploymentArtifacts': this.beforeDeploy.bind(this),
    };
  }

  sanitizeRetentionValue(inputValue) {
    const value = Number(inputValue);
    if(Number.isInteger(value) && validRetentionInDays.includes(value)) {
      return value;
    } else {
      throw new Error(`RetentionInDays value must be one of ${validRetentionInDays}`);
    }
  }

  addLogRetentionForFunctions(globalLogRetentionInDays) {
    const service = this.serverless.service;
    if(typeof service.functions !== 'object') {
      return;
    }

    const resources = nco(service.resources, {});
    resources.Resources = nco(resources.Resources, {});

    Object.keys(service.functions).forEach(functionName => {
      const localLogRentationInDays = nco(service.functions[functionName].logRetentionInDays, null);
      if(localLogRentationInDays === null && globalLogRetentionInDays === null) {
        return;
      }
      const functionLogRetentionInDays = localLogRentationInDays === null ? globalLogRetentionInDays : this.sanitizeRetentionValue(localLogRentationInDays);
      const logGroupLogicalId = this.provider.naming.getLogGroupLogicalId(functionName);

      const resource = {
        Type: 'AWS::Logs::LogGroup',
        Properties: {
          RetentionInDays: functionLogRetentionInDays
        }
      };
      resources.Resources[logGroupLogicalId] = resource;
    });
  }

  beforeDeploy() {
    const service = this.serverless.service;
    const globalLogRetentionInDays = service.custom && service.custom.logRetentionInDays
      ? this.sanitizeRetentionValue(service.custom.logRetentionInDays)
      : null;
    this.addLogRetentionForFunctions(globalLogRetentionInDays);
  }
}

module.exports = AwsAddLogRetention;
