'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const AwsAddLogRetention = require('../add-log-retention');

function createTestInstance(options) {
  options = options || {};
  return new AwsAddLogRetention({
    version: options.version || '1.20.2',
    service: {
      provider: options.provider || {},
      functions: options.functions,
      resources: options.resources ? { Resources: options.resources } : undefined
    },
    getProvider: () => {
      return {
        naming: {
          getLogGroupLogicalId(functionName) {
            return `${functionName.charAt(0).toUpperCase()}${functionName.slice(1)}LogGroup`; //TODO: dash/underscore replacement?
          }
        }
      }
    }
  }, {});
}

describe('serverless-plugin-log-retention', function() {
  describe('#constructor', function() {
    it('should throw on older version', function() {
      expect(() => createTestInstance({version: '1.20.1'}))
        .to.throw('serverless-plugin-log-retention requires serverless 1.20.2 or higher');
    });

    it('should create hooks', function() {
      const instance = createTestInstance();
      expect(instance)
        .to.have.property('hooks')
        .that.has.all.keys('package:createDeploymentArtifacts');

      const stub = sinon.stub(instance, 'addLogRetentionForFunctions');
      instance.hooks['package:createDeploymentArtifacts']();

      sinon.assert.calledOnce(stub);
    });

    it('should create missing resources block', function() {
      const instance = createTestInstance({
        resources: undefined,
        functions: {TestFunc: {logRetentionInDays: 30}}
      });

      expect(instance.serverless.service.resources)
        .not.to.be.a('object');

      instance.hooks['package:createDeploymentArtifacts']();

      expect(instance.serverless.service.resources)
        .to.have.property('Resources')
        .that.have.property('TestFuncLogGroup')
          .that.deep.equal({
            Type: 'AWS::Logs::LogGroup',
            Properties: {
              RetentionInDays: 30
            }
          });
    });

    it('should update existing resources block', function() {
      const instance = createTestInstance({
        resources: {SampleRes: {}},
        functions: {TestFunc: {logRetentionInDays: 30}}
      });

      expect(instance.serverless.service.resources)
        .to.be.a('object')
        .that.have.property('Resources')
          .that.have.property('SampleRes');

      instance.hooks['package:createDeploymentArtifacts']();

      expect(instance.serverless.service.resources)
        .to.have.property('Resources')
        .that.have.property('TestFuncLogGroup')
        .that.deep.equal({
          Type: 'AWS::Logs::LogGroup',
          Properties: {
            RetentionInDays: 30
          }
        });
    });
  })

});
