The Dockerfiles for building are in this directory.

* `Dockerfile` — For most builds, including development on `localhost`.

* `Dockerfile.openshift` — Custom file with `FROM` entries that point
  to local images in the OpenShift repository.
  (Note: We may be able to combine this with `Dockerfile` again when we have access OpenShift 4).

When using OpenShift, put both python and node into the openshift image stream, then update the build configuration (bc) YAML to use the following `strategy` block:

```yaml
  strategy:
    dockerStrategy:
      dockerfilePath: dockerfiles/Dockerfile.openshift
    type: Docker
```

