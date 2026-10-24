export interface ISignupUser{
    userName: string;
    email: string;
    password:string;
}

export interface ISignupUserResponse{
    message: string;
    data: string;
}
export interface ILoginData{
    email: string;
    password: string;
}

export interface ILoginResponse{
    id: string; 
    email: string; 
    role: string; 
    accessToken: string;
}

export interface IToken{
    id: string;
    email: string;
    role: string;
    exp: number;
}

export interface ILoginResponse {
    id: string; 
    email: string; 
    role: string; 
    accessToken: string;
  }

  export interface IRefreshResponse { 
    message: string; 
    accessToken: string; 
}