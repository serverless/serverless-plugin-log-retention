> [!IMPORTANT]  
> The Serverless Framework now has built-in support for the log retention setting. [For more information please refer to the official documentation](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml#general-aws-lambda-settings). This plugin should no longer be needed.

# serverless-plugin-log-retention
Control the retention of your serverless function's cloudwatch logs.

## Usage example
`serverless.yml`

```yml
service: sample

plugins:
  - serverless-plugin-log-retention

provider:
  name: aws

custom:
  serverless-plugin-log-retention:
    logRetentionInDays: 30 # used to set a global value for all functions

functions:
  function1:
  function2:
    logRetentionInDays: 10 # set the retention for specific log group
```
