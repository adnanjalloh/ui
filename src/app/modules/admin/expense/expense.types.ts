export interface SearchExpenseClaimRequestDto {
    employeeId: number;
}

export interface SearchExpenseClaimResponseDto extends BaseExpenseDto{
}

export interface UpdateExpenseRequestDto extends BaseExpenseDto{
}

export interface UpdateExpenseResponseDto extends BaseExpenseDto  {
}

export interface UpdateExpenseDetailRequestDto extends BaseExpenseDetailDto {
}

export interface UpdateExpenseDetailResponseDto extends BaseExpenseDetailDto {
}

export interface GetClaimDetailsRequestDto{
    claimId: number;
}
export interface GetClaimDetailsResponseDto extends BaseExpenseDetailDto {

}

export interface BaseExpenseDetailDto{
     expenseClaimDetailId :number; 
     description :string;
     total :number; 
     date :string; 
     expenseClaimId :number;
     expenseClaimTitle :string;
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