package com.workforce.os.modules.chat.mapper;

import com.workforce.os.modules.chat.domain.ChatMessage;
import com.workforce.os.modules.chat.dto.ChatMessageDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChatMapper {
    ChatMessageDTO toDTO(ChatMessage message);
    ChatMessage toEntity(ChatMessageDTO dto);
}
