[Back to README](../README.md)

## Github Action
1. The [github action](https://docs.github.com/en/actions/quickstart) configuration will build Dockerfile and pushes the artifacts to [Github container registry(GHCR)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
2. The build is done whenever a commit is made to master branch
3. [Openshift](https://docs.openshift.com/container-platform/4.11/openshift_images/image-streams-manage.html#images-imagestream-import_image-streams-managing) project will pull this image from GHCR. So configure each non-prod environment myla project to pull the image from the registry
    ```sh
    oc tag ghcr.io/tl-its-umich-edu/my-learning-analytics:latest my-learning-analytics:latest --scheduled
    ```

         