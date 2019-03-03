#!/usr/bin/env bash

complete_line_prod () {
    # Weird "+" separator is used since the default "/" collides with the URIs.
    sed -i -e "s+$1=+$1=$2+g" src/main/resources/application-production.properties
}

# Replace profile in application.properties
sed -i -e "s/spring.profiles.active=develop/spring.profiles.active=production/g" src/main/resources/application.properties

# Complete production profile
complete_line_prod "spring.datasource.url" ${JDBC_URL}
complete_line_prod "spring.datasource.username" ${JDBC_USER}
complete_line_prod "spring.datasource.password" ${JDBC_PASSWORD}

complete_line_prod "horus.tokenSecret" ${TOKEN_SECRET}

complete_line_prod "server.ssl.key-store" ${SSL_LOCATION}
complete_line_prod "server.ssl.key-store-password" ${SSL_PASSWORD}
complete_line_prod "server.ssl.keyAlias" ${SSL_ALIAS}

complete_line_prod "horus.samlKeyStorePassword" ${SAML_KEYSTORE_PASSWORD}
complete_line_prod "horus.samlPrivateKeyPassword" ${SAML_PRIVATE_KEY_PASSWORD}

