package com.workforce.os.modules.identity.web;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String name;
    private String email;
    private String role;
    private String number;
}
