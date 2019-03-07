package nl.utwente.horus

import org.springframework.security.test.context.support.WithSecurityContext
import java.lang.annotation.Inherited


@Target(AnnotationTarget.FUNCTION, AnnotationTarget.TYPE)
@Retention(AnnotationRetention.RUNTIME)
@Inherited
@MustBeDocumented
@WithSecurityContext(factory = WithLoginIdSecurityContextFactory::class)
annotation class WithLoginId(val value: String)
