package nl.utwente.horus.configurations

import nl.utwente.horus.queuing.QueuingWebSocketHandler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class HorusWebSocketConfiguration: WebSocketConfigurer {

    @Autowired
    lateinit var queuingHandler: QueuingWebSocketHandler

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(queuingHandler, "/ws/queuing/rooms/*/feed").setAllowedOrigins("*")
    }

}