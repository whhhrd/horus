package nl.utwente.horus.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class FrontendController {

    @RequestMapping(path = ["/**/{path:[^.]*}"])
    fun getFrontendSPA(): String {
        return "forward:/"
    }

}