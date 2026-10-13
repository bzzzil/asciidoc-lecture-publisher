# Automatic lecture publisher

For given asciidoc slides document this action:
1) Generates HTML version (document + images + css + js)
2) Generates PDF version
3) Uploads artifacts via SCP to given host

## Repository Secrets

* `DEPLOY_KEY` - Private SSH key for use
* `DEPLOY_HOST` - Remote host name
* `DEPLOY_ROOT` - target root directory to use without trailing slash
* `DEPLOY_USER` - looks not essential. Hmmmm... 
