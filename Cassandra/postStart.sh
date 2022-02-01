#!/bin/bash

chown -R cassandra:cassandra /cassandra_data/

./auto_delete.sh &

./auto_snapshot.sh &

./cassandra_run.sh &
