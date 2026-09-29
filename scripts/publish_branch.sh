#!/usr/bin/env bash
# Publish the already validated static output; preserve gh-pages history.
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"
test -f "$repo_root/_site/build-manifest.json"
publish_dir="$(mktemp -d)"
trap 'rm -rf "$publish_dir"' EXIT
git -C "$publish_dir" init --quiet
# The checkout action supplies the credential helper/header. Pass it only through
# Git configuration, never embed the token in a remote URL or write it to output.
git -C "$publish_dir" remote add origin "$(git remote get-url origin)"
auth_header="$(git config --get http.https://github.com/.extraheader || true)"
if [[ -n "$auth_header" ]]; then
  git -C "$publish_dir" config http.https://github.com/.extraheader "$auth_header"
fi
if git -C "$publish_dir" ls-remote --exit-code --heads origin gh-pages >/dev/null; then
  git -C "$publish_dir" fetch --quiet --depth=1 origin gh-pages
  git -C "$publish_dir" checkout --quiet -B gh-pages FETCH_HEAD
else
  git -C "$publish_dir" checkout --quiet --orphan gh-pages
fi
# This is a fresh checkout, so removing tracked files also removes stale output.
# Use Git and cp rather than requiring rsync on local act runners.
git -C "$publish_dir" rm -r --quiet --ignore-unmatch .
cp -a "$repo_root/_site/." "$publish_dir/"
git -C "$publish_dir" config user.name 'github-actions[bot]'
git -C "$publish_dir" config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git -C "$publish_dir" add --all
if git -C "$publish_dir" diff --cached --quiet; then
  echo 'The gh-pages snapshot is already current.'
else
  git -C "$publish_dir" commit --quiet -m "Publish Cartographics from ${GITHUB_SHA:-local}"
  git -C "$publish_dir" push origin HEAD:gh-pages
fi
