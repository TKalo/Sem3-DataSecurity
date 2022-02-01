#!/bin/bash

set -e
  
until cqlshjs -u team11 -p datasecurity -e "describe cluster" cassandra; 
do
    echo "cassandra not ready"
    sleep 10
done

echo "BACKEND CONNECTED TO CASSANDRA"

npm test