package nl.utwente.horus.auth.filters

import org.opensaml.saml.saml2.metadata.impl.EntityDescriptorImpl
import org.opensaml.saml.saml2.metadata.impl.SPSSODescriptorImpl
import org.pac4j.saml.client.SAML2Client
import org.pac4j.saml.metadata.SAML2MetadataGenerator
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class SAML2MetadataProviderFilter: OncePerRequestFilter {

    private val requestMatcher: RequestMatcher
    private val saml2Client : SAML2Client

    constructor(requestMatcher: RequestMatcher, saml2Client: SAML2Client) : super() {
        this.requestMatcher = requestMatcher
        this.saml2Client = saml2Client
    }

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        if (!requestMatcher.matches(request)) {
            filterChain.doFilter(request, response)
            return
        }

        // Ugly hack to remove the SingleLogout profile from the generated metadata
        val elem = saml2Client.serviceProviderMetadataResolver.entityDescriptorElement as EntityDescriptorImpl
        val spSSODescriptor = elem.roleDescriptors[0] as SPSSODescriptorImpl
        spSSODescriptor.singleLogoutServices.clear()
        val generator = SAML2MetadataGenerator()
        val metadata = generator.getMetadata(elem)

        response.contentType = MediaType.APPLICATION_XML_VALUE
        response.status = HttpStatus.OK.value()
        response.writer.write(metadata)
    }
}