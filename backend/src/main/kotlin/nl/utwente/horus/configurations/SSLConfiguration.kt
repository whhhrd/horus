package nl.utwente.horus.configurations

import org.apache.catalina.Context
import org.apache.catalina.connector.Connector
import org.apache.tomcat.util.descriptor.web.SecurityCollection
import org.apache.tomcat.util.descriptor.web.SecurityConstraint
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.servlet.server.ServletWebServerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile


@Configuration
@Profile(value = ["production"])
class SSLConfiguration {

    // Configures HTTPS redirect
    // Copied/translated from https://github.com/spring-projects/spring-boot/issues/9836
    @Bean
    fun servletContainer(): ServletWebServerFactory {
        val tomcat = SecuredTomcatServletWebServerFactory()
        tomcat.addAdditionalTomcatConnectors(redirectConnector())
        return tomcat
    }

    private fun redirectConnector(): Connector {
        val connector = Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL)
        connector.scheme = "http"
        connector.port = 80
        connector.secure = false
        connector.redirectPort = 443
        return connector
    }
}

class SecuredTomcatServletWebServerFactory : TomcatServletWebServerFactory() {
    override fun postProcessContext(context: Context) {
        /*
        Add 2 security constraints
        - First one that we don't need HTTPS for actuator endpoints
        - Second one that we need HTTPS everywhere

        By defining in this order, the actuator endpoints are not included.
        For some reason, this works, but the collection.addOmittedMethod() does not work...
        If debugging this, test with curl -I flag enabled to avoid "smart" browser caches doing the redirects for you...
         */
        val exclude = SecurityConstraint()
        exclude.userConstraint = "NONE"
        val c = SecurityCollection()
        c.addPattern("/actuator/*")
        exclude.addCollection(c)
        context.addConstraint(exclude)

        val secure = SecurityConstraint()
        secure.userConstraint = "CONFIDENTIAL"
        val collection = SecurityCollection()
        collection.addPattern("/*")
        secure.addCollection(collection)
        context.addConstraint(secure)
    }


}