import { ClientContactPresentation } from "./clientContact";

export interface ClientFormModel{
    Id: number;
    Name: string;
    Address: string;
    City: string;
    Pic: string;
    PhoneNumber: string;
    Email: string;
    TaxIdentificationNumber: string;
    CreatedBy: number;
    CreatedDate: Date;
}

export interface ClientPresentationModel{
    Id: number;
    Name: string;
    Address: string;
    City: string;
    Pic: string;
    PhoneNumber: string;
    Email: string;
    TaxIdentificationNumber: string;
    CreatedBy: string;
    CreatedDate: Date;
    HasRelation: boolean;
    Contacts: ClientContactPresentation[];
}