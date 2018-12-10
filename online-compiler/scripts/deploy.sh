#!/usr/bin/env bash

set -ex

export PROJECT=online-compiler-215303

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"
docker build --tag=gcr.io/${PROJECT}/compiler ../
docker push gcr.io/${PROJECT}/compiler

prev_ver=`gcloud container images list-tags gcr.io/${PROJECT}/compiler | grep -v latest | awk '{if(NR>1)print $1}'`
if [ ! -z "$prev_ver" ]; then
    yes | gcloud container images delete gcr.io/${PROJECT}/compiler@sha256:${prev_ver} --force-delete-tags
fi

gcloud compute firewall-rules create default-allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server \
    --description "Allow port 8080 access to http-server" || true

gcloud beta compute --project=online-compiler-215303 instances create-with-container online-compiler --zone=us-east1-b \
 --machine-type=f1-micro --subnet=default --network-tier=PREMIUM --metadata=google-logging-enabled=true \
 --maintenance-policy=MIGRATE --service-account=768654789015-compute@developer.gserviceaccount.com \
 --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append \
 --tags=http-server,default-allow-http-8080 --image=cos-stable-70-11021-99-0 --image-project=cos-cloud\
 --boot-disk-size=10GB --boot-disk-type=pd-standard --boot-disk-device-name=online-compiler \
 --container-image=gcr.io/online-compiler-215303/compiler --container-restart-policy=always \
 --container-mount-host-path=mount-path=/var/run/docker.sock,host-path=/var/run/docker.sock,mode=rw \
 --labels=container-vm=cos-stable-70-11021-99-0


export COMPILER_IP=`gcloud compute instances list --filter="name=( 'NAME' online-compiler )" | awk '{if(NR==2)print$5}'`
echo $COMPILER_IP