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
  logRetentionInDays: 30 # used to set a global value for all functions

functions:
  function1:
  function2:
    logRetentionInDays: 10 # set the retention for specific log group
```
