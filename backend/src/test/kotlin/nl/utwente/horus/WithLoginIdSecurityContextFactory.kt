package nl.utwente.horus

import org.springframework.security.core.context.SecurityContextHolder
import nl.utwente.horus.auth.tokens.TokenFactory
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.auth.HorusUserDetails
import org.junit.Assert
import org.springframework.beans.factory.BeanFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.test.context.support.WithSecurityContextFactory


class WithLoginIdSecurityContextFactory: WithSecurityContextFactory<WithLoginId> {

    private val beans: BeanFactory

    constructor(@Autowired beans: BeanFactory) {
        this.beans = beans
    }

    override fun createSecurityContext(annotation: WithLoginId): SecurityContext {
        val userDetailsService = this.beans.getBean(HorusUserDetailService::class.java)
        val tokenFactory = this.beans.getBean(TokenFactory::class.java)
        val loginId = annotation.value
        Assert.assertTrue("value() must be non empty String", loginId.isNotBlank())
        val principal = userDetailsService.loadUserByUsername(loginId)
        val authentication = tokenFactory.generateTokenpair((principal as HorusUserDetails).person).accessToken
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        return context
    }
}
