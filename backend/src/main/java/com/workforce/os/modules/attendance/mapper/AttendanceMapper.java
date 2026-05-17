package com.workforce.os.modules.attendance.mapper;

import com.workforce.os.modules.attendance.domain.Attendance;
import com.workforce.os.modules.attendance.dto.AttendanceResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {
    @Mapping(source = "worker.id", target = "workerId")
    @Mapping(source = "worker.user.name", target = "workerName")
    @Mapping(source = "workOrder.id", target = "workOrderId")
    AttendanceResponseDTO toDTO(Attendance attendance);
}
