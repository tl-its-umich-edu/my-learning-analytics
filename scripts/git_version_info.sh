#!/bin/bash
# Store the version information from the .git into a file so it can be used later at runtime after removing git

GIT_REPO=$(git config --local remote.origin.url)
GIT_COMMIT=$(git rev-parse HEAD)
GIT_BRANCH=$(git name-rev "$GIT_COMMIT" --name-only)

echo "export GIT_REPO=$GIT_REPO
export GIT_COMMIT=$GIT_COMMIT
export GIT_BRANCH=$GIT_BRANCH" > /etc/git.version
