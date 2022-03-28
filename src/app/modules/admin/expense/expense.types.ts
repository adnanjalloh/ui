export interface SearchExpenseClaimRequestDto {
    employeeId: number;
}

export interface SearchExpenseClaimResponseDto extends BaseExpenseDto{
}

export interface UpdateExpenseRequestDto extends BaseExpenseDto{
}

export interface UpdateExpenseResponseDto extends BaseExpenseDto  {
}


export interface BaseExpenseDto{
    expenseClaimId: number;
    employeeId: number;
    description: string,
    total: number;
    employeeTitle: string;
    date: Date;
    status: number;
}