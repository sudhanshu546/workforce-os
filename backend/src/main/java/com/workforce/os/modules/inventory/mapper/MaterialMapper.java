package com.workforce.os.modules.inventory.mapper;

import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.dto.MaterialDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MaterialMapper {
    @Mapping(source = "price", target = "unitPrice")
    @Mapping(source = "minThreshold", target = "minQuantity")
    @Mapping(target = "totalValue", expression = "java(calculateTotalValue(material))")
    MaterialDTO toDTO(Material material);

    @Mapping(source = "unitPrice", target = "price")
    @Mapping(source = "minQuantity", target = "minThreshold")
    Material toEntity(MaterialDTO dto);

    default Double calculateTotalValue(Material material) {
        if (material.getQuantity() == null || material.getPrice() == null) {
            return 0.0;
        }
        return material.getQuantity() * material.getPrice();
    }
}
