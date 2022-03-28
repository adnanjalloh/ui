export interface SearchLeaveRequestDto {
    employeeId: number;
    from: Date;
    to: Date;
}

export interface SearchLeaveResponseDto extends BaseLeaveDto{
}

export interface UpdateLeaveRequestDto extends BaseLeaveDto{
}

export interface GetAllLeaveTypeResponseDto {
    leaveTypeId: number;
    title: string;
}


export interface UpdateLeaveResponseDto extends BaseLeaveDto  {
}


export interface BaseLeaveDto{
    leaveId: number;
    employeeId: number;
    from: Date;
    to: Date;
    note: string,
    leaveTypeId: number;
    employeeTitle: string;
    leaveTypeTitle: string;
    numberOfDays: number;
}