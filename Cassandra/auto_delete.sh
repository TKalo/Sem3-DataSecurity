#!/bin/bash

while :
do
    sleep 1h
    dir=$(ls -td /cassandra_data/data/usercredentials/*/ | tail -1)
    dir2=$(ls -td "${dir}"/snapshots/*/ | tail -1)
    rm -f -r "${dir2}"
done