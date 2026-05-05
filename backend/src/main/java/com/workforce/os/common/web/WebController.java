package com.workforce.os.common.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController {

    @RequestMapping(value = {
            "/{path:[^\\.]*}",
            "/{path:[^\\.]*}/{subpath:[^\\.]*}",
            "/{path:[^\\.]*}/{subpath:[^\\.]*}/{third:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}