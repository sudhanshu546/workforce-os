package com.workforce.os;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class WorkforceOsApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkforceOsApplication.class, args);
	}

}
