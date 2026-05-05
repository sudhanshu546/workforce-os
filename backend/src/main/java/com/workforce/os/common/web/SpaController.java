package com.workforce.os.common.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping("/{path:^(?!api|swagger-ui|v3).*$}/**")
    public String forward() {
        return "forward:/index.html";
    }
}