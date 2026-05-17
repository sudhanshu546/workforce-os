package com.workforce.os.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "workforce.direct";
    public static final String INVOICE_QUEUE = "workforce.invoice.queue";
    public static final String INVOICE_ROUTING_KEY = "workforce.invoice.routingKey";
    
    public static final String REPORT_QUEUE = "workforce.report.queue";
    public static final String REPORT_ROUTING_KEY = "workforce.report.routingKey";

    @Bean
    public Queue invoiceQueue() {
        return new Queue(INVOICE_QUEUE);
    }

    @Bean
    public Queue reportQueue() {
        return new Queue(REPORT_QUEUE);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Binding invoiceBinding(Queue invoiceQueue, DirectExchange exchange) {
        return BindingBuilder.bind(invoiceQueue).to(exchange).with(INVOICE_ROUTING_KEY);
    }

    @Bean
    public Binding reportBinding(Queue reportQueue, DirectExchange exchange) {
        return BindingBuilder.bind(reportQueue).to(exchange).with(REPORT_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}
