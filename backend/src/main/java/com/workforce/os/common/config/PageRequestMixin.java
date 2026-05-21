package com.workforce.os.common.config;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Sort;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class PageRequestMixin {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public static org.springframework.data.domain.PageRequest of(
            @JsonProperty("pageNumber") @JsonAlias("page") Integer page,
            @JsonProperty("pageSize") @JsonAlias("size") Integer size,
            @JsonProperty("sort") Sort sort) {
        return org.springframework.data.domain.PageRequest.of(
            page != null ? page : 0, 
            size != null ? size : 10, 
            sort != null ? sort : Sort.unsorted()
        );
    }
}
