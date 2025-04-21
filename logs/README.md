# Logs Directory

This directory contains log files for the Digital Desk application.

## Contents

- **security.log**: Security-related events and access logs
- **application.log**: General application logs (created at runtime)
- **error.log**: Error messages and exceptions (created at runtime)

## Log Rotation

Log files are automatically rotated to prevent them from growing too large.
The rotation configuration can be found in the server logging setup.

## Cleanup

Old logs can be cleaned up using the cleanup script:

```bash
./scripts/run.sh cleanup-logs
```

## Log Format

Logs are formatted using Pino in JSON format, with pretty-printing in development mode.
In production, raw JSON logs are generated for easier parsing by log analytics tools.

## Log Levels

The following log levels are used:

- **error**: Critical issues that require immediate attention
- **warn**: Warnings that don't affect functionality but should be noted
- **info**: General operational information
- **debug**: Detailed information useful for debugging
- **trace**: Very detailed trace information (development only)

The log level is controlled via the NODE_ENV environment variable.