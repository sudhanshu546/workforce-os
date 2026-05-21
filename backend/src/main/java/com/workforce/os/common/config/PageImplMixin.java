package com.workforce.os.common.config;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class PageImplMixin<T> {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public static <T> PageImpl<T> create(@JsonProperty("content") List<T> content,
                                        @JsonProperty("pageable") Pageable pageable,
                                        @JsonProperty("totalElements") @JsonAlias("total") Long totalElements) {
        return new PageImpl<>(
            content != null ? content : new ArrayList<>(), 
            pageable != null ? pageable : PageRequest.of(0, Math.max(1, content != null ? content.size() : 10)), 
            totalElements != null ? totalElements : (content != null ? content.size() : 0)
        );
    }
}
