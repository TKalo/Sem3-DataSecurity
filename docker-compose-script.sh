#!/bin/bash

docker-compose -f docker-compose-test.yaml build
docker-compose -f docker-compose-test.yaml up
