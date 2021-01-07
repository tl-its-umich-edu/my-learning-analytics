The Dockerfile(s) for the build are in this directory

* Dockerfile is the file used for most builds including localhost

* Dockerfile.openshift is a custom file with the FROM entries modified to point
to local images in the Openshift repository.

If you're using Openshift you'll want to put both python and node into 
into the openshift image stream then configure your build YAML like:

``
  strategy:
    dockerStrategy:
      dockerfilePath: dockerfilesDockerfile.openshift
    type: Docker
```
