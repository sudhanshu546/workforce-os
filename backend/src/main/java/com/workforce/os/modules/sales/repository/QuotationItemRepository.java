package com.workforce.os.modules.sales.repository;

import com.workforce.os.modules.sales.domain.QuotationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuotationItemRepository extends JpaRepository<QuotationItem, Long> {
}
