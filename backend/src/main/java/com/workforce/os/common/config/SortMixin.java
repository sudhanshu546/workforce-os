package com.workforce.os.common.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.springframework.data.domain.Sort;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonDeserialize(using = SortDeserializer.class)
public abstract class SortMixin {
}
