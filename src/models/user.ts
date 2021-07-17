import { UserPosition } from "@prisma/client";

export interface UserFormModel{
    Id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    IsActive: number;
    Password?: string;
    ImageUrl?: string;
    ThumbnailUrl?: string;
    Position?: number;
}

export interface UserPresentationModel{
    Id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    IsActive: boolean;
    Password: string;
    ImageUrl: string;
    ThumbnailUrl: string;
}

export interface UserContact {
    Id?: number;
    PhoneNumber: string;
    UserId?: number;
    WhatsappAvailable: boolean;
}

export interface UserLoginPresentationModel{
    Id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    IsActive: boolean;
    ImageUrl: string;
    ThumbnailUrl: string;
    UserPosition?: UserPosition[];
    Password: string;
}

export interface UserPositionProfileModel{
    EffectiveDate: Date;
    Position: number;
}

export interface UserPositionFormModel{
    Position: number;
    CreatedBy: string;
    UserEmail: string;
}

export interface UserLogin{
    Email: string;
    Password: string;
}