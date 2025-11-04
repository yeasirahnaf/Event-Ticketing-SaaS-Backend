export class CreateAdminDto {
  name: string;
  email: string;
  password: string;
}

export class UpdateAdminDto {
  name: string;
  email: string;
}

export class UpdateAdminStatusDto {
  status: string;
}

export class CreateUserDto {
  name: string;
  email: string;
}
