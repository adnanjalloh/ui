export interface UpdateEmployeeRequestDto extends BaseEmployeeDto, EmployeeId{
}

export interface CreateEmployeeResponseDto extends BaseEmployeeDto, EmployeeId{
}

export interface GetAllDepartmentResponseDto {
    departmentId: number;
    title: string;
}

export interface GetAllEmployeeResponseDto extends BaseEmployeeDto, EmployeeId{
}

export interface UpdateEmployeeResponseDto extends BaseEmployeeDto,EmployeeId  {
}

export interface BaseEmployeeDto{
    name: string;
    email: string;
    address: string;
    departmentId: number;
    departmentTitle : string;
}
export interface EmployeeId{
    employeeId: number;
}