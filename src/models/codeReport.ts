export interface codeReport{
    Id?: number;
    CreatedBy: number | string;
    CreatedDate: Date;
    Date: Date;
    CodeProjectId: number;
    Type: number;
    IsDelete: boolean;
    Note: string;
}

export interface WorkerReport{
    Id?: number;
    CreatedBy: number | string;
    CreatedDate: Date;
    Date: Date;
    CodeProjectId: number;
    Type: number;
    IsDelete: boolean;
    Note: string;
    Workers: Worker[];
}

export interface Worker{
    Id?: number;
    Name: string;
    Quantity: number;
    CodeReportId: number;
}

export interface ToolReport{
    Id?: number;
    CreatedBy: number | string;
    CreatedDate: Date;
    Date: Date;
    CodeProjectId: number;
    Type: number;
    IsDelete: boolean;
    Note: string;
    Tools: Tool[];
}

export interface Tool{
    Id?: number;
    Name: string;
    Quantity: number;
    Description: string;
    CodeReportId: number;
}

export interface MaterialReport{
    Id?: number;
    CreatedBy: number | string;
    CreatedDate: Date;
    Date: Date;
    CodeProjectId: number;
    Type: number;
    IsDelete: boolean;
    Note: string;
    Materials: Material[];
}

export interface Material{
    Id?: number;
    Name: string;
    Quantity: number;
    Unit: string;
    Description: string;
    CodeReportId: number;
    Status: number;
}