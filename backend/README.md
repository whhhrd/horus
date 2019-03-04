# Horus Backend

## API documentation 
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/c28839779b86c457e517)

## Initial database setup
```postgresql
CREATE DATABASE horus;
CREATE DATABASE horus_test;
CREATE USER horus WITH PASSWORD 'horus';
GRANT ALL PRIVILEGES ON DATABASE horus TO horus;
GRANT ALL PRIVILEGES ON DATABASE horus_test TO horus;
```

## Initial database setup - extension creation
Run as a superuser on the `horus` and `horus_test` databases
```postgresql
CREATE EXTENSION pg_trgm;
```

## Start development server
```shell
./gradlew :bootRun
```
