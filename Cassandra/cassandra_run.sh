#!/bin/bash

sleep 180

cqlsh localhost -f tables.cql -u cassandra -p cassandra

cqlsh localhost -f tables.cql -u team11 -p datasecurity

echo "CASSANDRA CONFIGURED!"

dir=$(ls -td /cassandra_data/data/usercredentials/*/ | head -1)

mkdir "${dir}"/snapshots

mkdir "${dir}"/snapshots/temp1

mkdir "${dir}"/snapshots/temp2

mkdir "${dir}"/snapshots/temp3
