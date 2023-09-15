[Back to README](../README.md)

## GitHub Action
1. The [GitHub action](https://docs.github.com/en/actions/quickstart) configuration in [/.github/workflows/main.yml](../.github/workflows/main.yml) uses Dockerfile to build the app, then pushes the image to the [GitHub container registry (GHCR)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
2. The action is triggered whenever a commit is made to the `master` branch.  E.g., when a pull request is merged to `master`.
3. OpenShift projects can periodically pull this image from GHCR.  Configure only **_NON-PRODUCTION_** MyLA projects to pull the image…
    ```sh
    oc tag ghcr.io/tl-its-umich-edu/my-learning-analytics:latest my-learning-analytics:latest --scheduled
    ```
    See the OpenShift documentation "[Managing image streams: Configuring periodic importing of image stream tags](https://docs.openshift.com/container-platform/4.11/openshift_images/image-streams-manage.html#images-imagestream-import_image-streams-managing)" for details.
