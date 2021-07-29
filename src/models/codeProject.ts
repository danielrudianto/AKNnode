import { codeProjectUser } from "@prisma/client";

export interface CodeProjectForm{
    Id?: number;
    Name: string;
    ClientId: number;
    CreatedBy: number;
    CreatedDate: Date;
    ConfirmedDate?: Date;
    ConfirmedBy?: string;
    Address: string;
    DocumentName: string;
    IsCompleted: boolean;
    CompletedDate?: Date;
    CompletedBy?: number;
    IsDelete: boolean;
    Tasks: ProjectForm[];
    Users: codeProjectUser[];
}

export interface ProjectForm{
    Id?: number;
    Name: string;
    Description: string;
    BudgetPrice: number;
    Price: number;
    Quantity: number;
    Unit: string;
    Done: number;
    IsDelete: boolean;
    CodeProjectId: number;
    ParentId: number;
    EstimatedDuration: number;
    Timeline: number;
    Tasks?: ProjectForm[];
}