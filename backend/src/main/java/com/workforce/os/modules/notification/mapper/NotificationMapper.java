package com.workforce.os.modules.notification.mapper;

import com.workforce.os.modules.notification.domain.Notification;
import com.workforce.os.modules.notification.dto.NotificationResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponseDTO toDTO(Notification notification);
}
