CREATE KEYSPACE IF NOT EXISTS usercredentials WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 3};

USE usercredentials;

CREATE TABLE IF NOT EXISTS user(
    email text,
    password text,
    userid uuid,
    last_edited timestamp,
    created_on timestamp,
    primary key ( userid )
);

CREATE ROLE IF NOT EXISTS team11 WITH PASSWORD = 'datasecurity' AND SUPERUSER = true AND LOGIN = true;

DROP ROLE IF EXISTS cassandra;