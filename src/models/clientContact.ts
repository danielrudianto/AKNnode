export interface clientContactForm{
    Id: number;
    Name: string;
    Position:string;
    PhoneNumber: string;
    Email: string;
    ClientId: number;
    CreatedBy: number;
    CreatedDate: Date;
}

export interface ClientContactPresentation{
    Id: number;
    Name: string;
    Position: string;
    PhoneNumber: string;
    Email: string;
    CreatedBy: string;
    CreatedDate: Date;
}