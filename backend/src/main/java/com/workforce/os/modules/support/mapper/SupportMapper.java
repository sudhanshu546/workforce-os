package com.workforce.os.modules.support.mapper;

import com.workforce.os.modules.support.domain.SupportTicket;
import com.workforce.os.modules.support.domain.TicketComment;
import com.workforce.os.modules.support.dto.SupportTicketResponseDTO;
import com.workforce.os.modules.support.dto.TicketCommentResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SupportMapper {

    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "workOrder", target = "workOrder")
    SupportTicketResponseDTO toTicketDTO(SupportTicket ticket);

    @Mapping(source = "user", target = "user")
    TicketCommentResponseDTO toCommentDTO(TicketComment comment);

    SupportTicketResponseDTO.WorkOrderDTO toWorkOrderDTO(com.workforce.os.modules.operations.domain.WorkOrder workOrder);

    TicketCommentResponseDTO.UserInfoDTO toUserDTO(com.workforce.os.modules.identity.domain.User user);
}
