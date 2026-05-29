package com.workforce.os.common.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaErrorController implements ErrorController {

    @GetMapping("/error")
    public String redirect() {
        // Forward to index.html so React Router can handle the client-side route
        return "forward:/index.html";
    }
}
