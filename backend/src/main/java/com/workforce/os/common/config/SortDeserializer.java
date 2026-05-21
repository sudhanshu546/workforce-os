package com.workforce.os.common.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SortDeserializer extends JsonDeserializer<Sort> {
    @Override
    public Sort deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node == null || node.isMissingNode()) {
            return Sort.unsorted();
        }

        // Handle both plain object and DefaultTyping wrapped array
        JsonNode ordersNode = node.get("orders");
        if (ordersNode == null) {
            return Sort.unsorted();
        }

        // If DefaultTyping is on, it might be ["java.util.ArrayList", [...]]
        if (ordersNode.isArray() && ordersNode.size() == 2 && ordersNode.get(0).isTextual() && ordersNode.get(1).isArray()) {
            ordersNode = ordersNode.get(1);
        }

        if (!ordersNode.isArray()) {
            return Sort.unsorted();
        }

        List<Sort.Order> orders = new ArrayList<>();
        for (JsonNode orderNode : ordersNode) {
            // Handle possible wrapping of individual Order objects
            if (orderNode.isArray() && orderNode.size() == 2 && orderNode.get(1).isObject()) {
                orderNode = orderNode.get(1);
            }

            if (!orderNode.isObject()) continue;

            String property = orderNode.has("property") ? orderNode.get("property").asText() : null;
            if (property == null) continue;

            String directionStr = orderNode.has("direction") ? orderNode.get("direction").asText() : "ASC";
            Sort.Direction direction = Sort.Direction.fromString(directionStr);
            
            Sort.Order order = new Sort.Order(direction, property);
            
            if (orderNode.has("ignoreCase") && orderNode.get("ignoreCase").asBoolean()) {
                order = order.ignoreCase();
            }
            
            if (orderNode.has("nullHandling")) {
                String nullHandlingStr = orderNode.get("nullHandling").asText();
                try {
                    order = order.with(Sort.NullHandling.valueOf(nullHandlingStr));
                } catch (Exception e) {
                    // Ignore invalid null handling
                }
            }
            
            orders.add(order);
        }

        return orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
    }
}
