package nl.utwente.horus

import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import javax.servlet.ServletContext

class ServletInitializer : SpringBootServletInitializer() {

	override fun configure(application: SpringApplicationBuilder): SpringApplicationBuilder {
		return application.sources(HorusApplication::class.java)
	}

	override fun onStartup(servletContext: ServletContext) {
		servletContext.setInitParameter("spring.profiles.active", "develop")
		super.onStartup(servletContext)
	}

}

