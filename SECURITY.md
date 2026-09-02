# Security

## Reporting a vulnerability

Please do not open a public issue for a suspected security vulnerability. Contact the repository owner privately through their GitHub profile instead.

## Secrets

This project is a client-side portfolio and does not require credentials to build or run. Never commit `.env` files, private keys, access tokens, deployment credentials, or service-account files. Values exposed through Vite variables prefixed with `VITE_` are bundled into browser code and must never be treated as secrets.

## Supported version

Security fixes are applied to the latest version on the default branch.
