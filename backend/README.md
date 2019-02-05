# Horus Backend

## Initial database setup
```postgresql
CREATE DATABASE horus;
CREATE DATABASE horus_test;
CREATE USER horus WITH PASSWORD 'horus';
GRANT ALL PRIVILEGES ON DATABASE horus TO horus;
GRANT ALL PRIVILEGES ON DATABASE horus_test TO horus;
```

## Start development server
```shell
./gradlew :bootRun
```