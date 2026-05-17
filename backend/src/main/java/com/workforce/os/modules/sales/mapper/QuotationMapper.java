package com.workforce.os.modules.sales.mapper;

import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.sales.domain.QuotationItem;
import com.workforce.os.modules.sales.dto.QuotationResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuotationMapper {
    @Mapping(source = "lead.id", target = "leadId")
    @Mapping(source = "items", target = "items")
    @Mapping(source = "totalAmount", target = "total")
    QuotationResponseDTO toDTO(Quotation quotation);

    QuotationResponseDTO.QuotationItemDTO toItemDTO(QuotationItem item);
}
