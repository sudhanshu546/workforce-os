package com.workforce.os.modules.finance.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.finance.domain.TaxConfig;
import com.workforce.os.modules.finance.repository.TaxConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxService {

    private final TaxConfigRepository taxConfigRepository;

    public Double calculateTax(Double amount, String region) {
        TaxConfig config = getTaxConfig(region);
        return amount * (config.getRate() / 100.0);
    }

    public TaxConfig getTaxConfig(String region) {
        String tenantId = TenantContext.getCurrentTenant();
        if (region != null) {
            return taxConfigRepository.findByTenantIdAndRegionAndActiveTrue(tenantId, region)
                    .orElseGet(() -> getDefaultConfig(tenantId));
        }
        return getDefaultConfig(tenantId);
    }

    private TaxConfig getDefaultConfig(String tenantId) {
        return taxConfigRepository.findByTenantIdAndIsDefaultTrueAndActiveTrue(tenantId)
                .orElse(TaxConfig.builder().name("Standard").rate(0.0).build()); // Fallback to 0 if none found
    }

    public List<TaxConfig> getActiveConfigs() {
        return taxConfigRepository.findByTenantIdAndActiveTrue(TenantContext.getCurrentTenant());
    }

    public TaxConfig saveConfig(TaxConfig config) {
        config.setTenantId(TenantContext.getCurrentTenant());
        return taxConfigRepository.save(config);
    }
}
