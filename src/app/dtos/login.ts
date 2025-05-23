export class LoginResponseDto {
  token!: string;
  token_type!: string;

  constructor(token: string, token_type: string) {
    this.token = token;
    this.token_type = token_type;
  }
}

export class LoginRequestDto {
  username!: string;
  password!: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
