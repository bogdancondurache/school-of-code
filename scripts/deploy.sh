#!/usr/bin/env bash

set -ex

export PROJECT=online-compiler-215303

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${parent_path}"

../online-compiler/scripts/deploy.sh

cd ../webclient
netlify deploy -p