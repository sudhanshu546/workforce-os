package com.workforce.os.common.config;

import com.workforce.os.modules.identity.domain.Permission;
import com.workforce.os.modules.identity.domain.Role;
import com.workforce.os.modules.identity.repository.RoleRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            // Create Permissions
            Permission manageAll = createPermission("MANAGE_ALL");
            Permission manageWorkers = createPermission("MANAGE_WORKERS");
            Permission manageLeads = createPermission("MANAGE_LEADS");
            Permission viewJobs = createPermission("VIEW_JOBS");

            // Create Roles
            createRole("OWNER", Set.of(manageAll));
            createRole("MANAGER", Set.of(manageWorkers, manageLeads));
            createRole("WORKER", Set.of(viewJobs, manageWorkers)); // WORKER can view jobs and clock in/out
            createRole("CUSTOMER", Set.of());
        }
    }

    private Permission createPermission(String name) {
        Permission p = new Permission();
        p.setName(name);
        entityManager.persist(p);
        return p;
    }

    private void createRole(String name, Set<Permission> permissions) {
        Role role = new Role();
        role.setName(name);
        role.setPermissions(permissions);
        roleRepository.save(role);
    }
}
