Create 8 routes based on super admin features.
- Must create a folder and must have controller, 
service and module based on super admin features.
- Must have a DTO file
- Must follow the REST API standards (POST, GET, PUT, 
PATCH, DELETE)
- Must demonstrate uses of decorators like @Query, 
@Param, @Body
- The response must be in JSON Object


demo codes  + important points :



NestJS Project Directory structure.
app.controller.ts: Controller file that will contain all the application 
routes.
app.controller.spec.ts: This file would help writing out unit tests for 
the controllers.
app.module.ts: The module file essentially bundles all the controllers 
and providers of your application together.
app.service.ts: The service will include methods that will perform a 
certain operation. For example: Registering a new user.
main.ts: The entry file of the application will take in your module 
bundle and create an app instance using the NestFactory provided by 
Nest.


import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
// Define the controller and set the base URL path to '/users'
@Controller('users')
export class UserController {
//Injecting dependencies through the constructor
constructor(private readonly userService: UserService) {}
// Define a route handler for the HTTP GET method to handle requests to 
'/users' with GET method
@Get()
getUsers() {
return this.userService.getAllUsers();
}
// The `@Body()` decorator extracts the request body and binds it to the 
`data` parameter
@Post()
createUser(@Body() data: string) {
return this.userService.createUser(data);
}
}

import { Injectable } from '@nestjs/common';
// Mark the class as injectable using the `@Injectable()` decorator
@Injectable()
export class UserService {
// Method to fetch users
getUsers(): string[] {
return ['John', 'Jane', 'Doe'];
}
// Method to create a user
// Accepts a `data` parameter of type string representing user 
data
createUser(data: string): string {
// Logic to create a user using the provided data
return `User created: ${data}`;
}
}


import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
@Module({
providers: [UserService],
controllers: [UserController],
})
export class UserModule {}


// createUser.dto.ts
export class CreateUserDto {
name: string;
email: string;
password: string;
}


// user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './createUser.dto';
import { UserService } from './user.service';
@Controller('users')
export class UserController {
constructor(private readonly userService: UserService) {}
@Post()
createUser(@Body() createUserDto: CreateUserDto) {
return this.userService.createUser(createUserDto);
}
}


// user.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './createUser.dto';
@Injectable()
export class UserService {
createUser(createUserDto: CreateUserDto): string {
// Logic to create a new user using the data from the DTO
const { name, email } = createUserDto;
// ...create user logic...
return ‘User created: ${name} (${email})’;
}
}


import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
// Define the controller and set the base URL path to '/users'
@Controller('users')
export class UserController {
//Injecting dependencies through the constructor
constructor(private readonly userService: UserService) {}
// Define a route handler for the HTTP GET method to handle requests to 
'/users' with GET method
@Get()
getUsers() {
return this.userService.getAllUsers();
}
// The `@Body()` decorator extracts the request body and binds it to the 
`data` parameter
@Post()
createUser(@Body() data: string) {
return this.userService.createUser(data);
}
}


import { Injectable } from '@nestjs/common';
// Mark the class as injectable using the `@Injectable()` decorator
@Injectable()
export class UserService {
// Method to fetch users
getUsers(): string[] {
return ['John', 'Jane', 'Doe'];
}
// Method to create a user
// Accepts a `data` parameter of type string representing user 
data
createUser(data: string): string {
// Logic to create a user using the provided data
return `User created: ${data}`;
}
}


import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
@Module({
providers: [UserService],
controllers: [UserController],
})
export class UserModule {


    // user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './createUser.dto';
import { UserService } from './user.service';
@Controller('users')
export class UserController {
constructor(private readonly userService: UserService) {}
@Post()
createUser(@Body() createUserDto: CreateUserDto) {
return this.userService.createUser(createUserDto);
}
}


// user.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './createUser.dto';
@Injectable()
export class UserService {
createUser(createUserDto: CreateUserDto): string {
// Logic to create a new user using the data from the DTO
const { name, email } = createUserDto;
// ...create user logic...
return ‘User created: ${name} (${email})’;
}
}