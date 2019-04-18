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
/**
 * QueuingWebSocketHandler is the WebSocketHandler for queuing.
 * This implements methods for performing subscriptions to rooms based
 * on the handshake URLs of the incoming WebSocket connection requests.
 * Also keeps track of the subscriptions to rooms, so that they are discarded
 * when the connections closed. The methods are synchronized to control access
 * to the HashMap containing the subscriptions
 */
class QueuingWebSocketHandler: TextWebSocketHandler() {

    companion object {
        const val ROOM_CODE_PARAM = "roomCode"
        const val PATH_PATTERN = "/ws/queuing/rooms/{$ROOM_CODE_PARAM}/feed"

        val LOGGER = LoggerFactory.getLogger(QueuingWebSocketHandler::class.java)
    }

    val pathMatcher = AntPathMatcher()

    @Autowired
    private lateinit var queuingStateManager: QueuingStateManager

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val subscriberMap = HashMap<String, Disposable>()

    @Synchronized
    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        // Close the session on error
        session.close(CloseStatus.SESSION_NOT_RELIABLE)
        // End the subscription for events
        terminateSession(session.id)
    }

    @Synchronized
    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        // End the subscription after connection has closed
        terminateSession(session.id)
    }

    @Synchronized
    override fun afterConnectionEstablished(session: WebSocketSession) {
        // If room code is not in URL, close connection with a BadData error code
        val roomCode = pathMatcher.extractUriTemplateVariables(PATH_PATTERN, session.uri!!.rawPath)[ROOM_CODE_PARAM]
                ?: return session.close(CloseStatus.BAD_DATA)
        try {
            // Subscribe to the room for updates
            val subscription = queuingStateManager.atomicSubscribe(roomCode, {
                // Before getting any state updates, send the initial state
                session.sendMessage(TextMessage(objectMapper.writeValueAsString(it)))
            }, Consumer {
                // On every state update from the subscription,
                // serialize to JSON and send to client
                val str = objectMapper.writeValueAsString(it)
                try {
                    session.sendMessage(TextMessage(str))
                } catch (e: IllegalStateException) {
                    // If that fails, terminate the session
                    // and clean up subscription
                    terminateSession(session.id)
                    session.close()
                }
            }, Consumer {
                // If the subscription has an error, terminate session and clean up
                // Log the error as well
                LOGGER.warn("Exception thrown in WS (${session.id})", it)
                terminateSession(session.id)
                session.close(CloseStatus.SERVER_ERROR)
            }, Runnable {
                // On a normal subscription end (room closure),
                // remove subscription and close session with a Normal code
                terminateSession(session.id)
                session.close(CloseStatus.NORMAL)
            })

            // Add the subscription to the map
            subscriberMap[session.id] = subscription
        } catch (e: Exception) {
            if (e is RoomNotFoundException) {
                session.close(CloseStatus.BAD_DATA)
            } else if (session.isOpen) {
                session.close(CloseStatus.SERVER_ERROR)
            }
        }
    }

    @Synchronized
    /**
     * Perform clean up for a WebSocket session.
     * The corresponding subscription is removed from the map and disposed.
     * @param id ID of the WebSocket session.
     */
    private fun terminateSession(id: String) {
        val subscription = subscriberMap.remove(id)
        subscription?.dispose()
        if (subscription != null  && subscription.isDisposed) {
            LOGGER.debug("DISPOSED: $id")
        }
    }
}