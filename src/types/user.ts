export type user = {
    username: string;
    email: string;
    password: string;
    name: string;
    lastname: string;
    phone: string;
    address: string;
}

export interface loginData {
    email: string;
    password: string;
}