package nl.utwente.horus.queuing

import com.fasterxml.jackson.databind.ObjectMapper
import nl.utwente.horus.queuing.exceptions.RoomNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.util.AntPathMatcher
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import reactor.core.Disposable
import java.util.concurrent.ConcurrentHashMap
import java.util.function.Consumer

@Component
class QueuingWebSocketHandler: TextWebSocketHandler() {

    companion object {
        const val ROOM_CODE_PARAM = "roomCode"
        const val PATH_PATTERN = "/ws/queuing/rooms/{$ROOM_CODE_PARAM}/feed"

        val LOGGER = LoggerFactory.getLogger(QueuingWebSocketHandler::class.java)
    }

    val pathMatcher = AntPathMatcher()

    @Autowired
    lateinit var queuingStateManager: QueuingStateManager

    @Autowired
    lateinit var objectMapper: ObjectMapper

    private val subscriberMap = ConcurrentHashMap<String, Disposable>()

    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        session.close(CloseStatus.SESSION_NOT_RELIABLE)
        terminateSession(session.id)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        terminateSession(session.id)
    }

    override fun afterConnectionEstablished(session: WebSocketSession) {
        val roomCode = pathMatcher.extractUriTemplateVariables(PATH_PATTERN, session.uri!!.rawPath)[ROOM_CODE_PARAM]
                ?: return session.close(CloseStatus.BAD_DATA)
        try {
            val subscription = queuingStateManager.atomicSubscribe(roomCode, {
                session.sendMessage(TextMessage(objectMapper.writeValueAsString(it)))
            }, Consumer {
                val str = objectMapper.writeValueAsString(it)
                try {
                    session.sendMessage(TextMessage(str))
                } catch (e: IllegalStateException) {
                    terminateSession(session.id)
                    session.close()
                }
            }, Consumer {
                LOGGER.warn("Exception thrown in WS (${session.id})", it)
                terminateSession(session.id)
                session.close(CloseStatus.SERVER_ERROR)
            }, Runnable {
                terminateSession(session.id)
                session.close(CloseStatus.NORMAL)
            })

            subscriberMap[session.id] = subscription
        } catch (e: Exception) {
            if (e is RoomNotFoundException) {
                session.close(CloseStatus.BAD_DATA)
            } else if (session.isOpen) {
                session.close(CloseStatus.SERVER_ERROR)
            }
        }
    }

    private fun terminateSession(id: String) {
        val subscription = subscriberMap.remove(id)
        subscription?.dispose()
        if (subscription != null  && subscription.isDisposed) {
            LOGGER.debug("DISPOSED: $id")
        }
    }
}