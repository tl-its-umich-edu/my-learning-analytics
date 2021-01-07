The Dockerfile(s) for the build are in this directory.

* `Dockerfile` is the file used for most builds including when using localhost.

* `Dockerfile.openshift` is a custom file with the FROM entries modified to point
  to local images in the Openshift repository.
  (Note: we may be able to combine this with `Dockerfile` again when we have access Openshift 4).

If you're using Openshift you'll want to put both python and node into 
into the openshift image stream then configure your build YAML to use the following `strategy` block:

```
  strategy:
    dockerStrategy:
      dockerfilePath: dockerfiles/Dockerfile.openshift
    type: Docker
```
