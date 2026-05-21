package com.workforce.os.common.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.paramnames.ParameterNamesModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Standard modules for Java 8 types and Parameter names
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(new Jdk8Module());
        objectMapper.registerModule(new ParameterNamesModule());
        
        // Use ANY visibility to ensure Jackson can access internal Spring Data fields if needed
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.findAndRegisterModules(); 

        // Register Spring Data Mixins (CRITICAL for handling 'Orders must not be null')
        // We use @JsonTypeInfo(use = JsonTypeInfo.Id.NONE) inside these Mixins to disable default typing for them.
        objectMapper.addMixIn(org.springframework.data.domain.PageImpl.class, PageImplMixin.class);
        objectMapper.addMixIn(org.springframework.data.domain.Page.class, PageImplMixin.class);
        objectMapper.addMixIn(org.springframework.data.domain.PageRequest.class, PageRequestMixin.class);
        objectMapper.addMixIn(org.springframework.data.domain.Pageable.class, PageRequestMixin.class);
        objectMapper.addMixIn(org.springframework.data.domain.Sort.class, SortMixin.class);

        // Try to load official modules as well for additional compatibility via reflection
        try {
            Class<?> pageModuleClass = Class.forName("org.springframework.data.web.config.SpringDataJacksonConfiguration$PageModule");
            objectMapper.registerModule((com.fasterxml.jackson.databind.Module) pageModuleClass.getDeclaredConstructor().newInstance());
            Class<?> sortModuleClass = Class.forName("org.springframework.data.web.config.SpringDataJacksonConfiguration$SortModule");
            objectMapper.registerModule((com.fasterxml.jackson.databind.Module) sortModuleClass.getDeclaredConstructor().newInstance());
        } catch (Exception e) {
            // Ignored as we have Mixins
        }

        return objectMapper;
    }
}
