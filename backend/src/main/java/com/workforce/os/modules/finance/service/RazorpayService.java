package com.workforce.os.modules.finance.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws RazorpayException {
        this.client = new RazorpayClient(keyId, keySecret);
    }

    @CircuitBreaker(name = "razorpayService", fallbackMethod = "createOrderFallback")
    @Retry(name = "razorpayService")
    public String createOrder(Double amount, String invoiceNumber) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100)); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", invoiceNumber);
        
        Order order = client.orders.create(orderRequest);
        return order.get("id");
    }

    public String createOrderFallback(Double amount, String invoiceNumber, Throwable t) {
        log.error("Razorpay order creation failed for invoice: {}. Error: {}", invoiceNumber, t.getMessage());
        throw new RuntimeException("Payment gateway is currently unavailable. Please try again later.");
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            
            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
