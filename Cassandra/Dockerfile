FROM cassandra:latest

COPY ./cassandra.yaml ./etc/cassandra/cassandra.yaml

COPY ./auto_delete.sh .

COPY ./auto_snapshot.sh .

COPY ./postStart.sh .

COPY ./cassandra_run.sh .

COPY ./tables.cql .

RUN chmod +x auto_delete.sh

RUN chmod +x auto_snapshot.sh

RUN chmod +x postStart.sh

RUN chmod +x cassandra_run.sh

CMD ["cassandra", "-R", "-f"]
