package nl.utwente.horus.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class FrontendController {

    @RequestMapping(path = ["/**/{path:[^.]*}"], headers = ["Upgrade!=websocket"])
    fun getFrontendSPA(): String {
        return "forward:/"
    }

}