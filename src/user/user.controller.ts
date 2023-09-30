import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './entities/user.dto';
import { UpdateUserDto } from './entities/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get(':userId')
  async get(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Get()
  async getUsers() {
    return this.getUsers();
  }

  @Patch('approve-user')
  async approveUser(@Query('email') email: string) {
    console.log(email);
    return this.userService.approveUser(email);
  }

  @Post('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    console.log(token);
    return this.userService.confirmEmail(token);
  }

  @Post()
  @UseInterceptors(FileInterceptor('profileImage')) // 'userImage' es el nombre del campo en tu formulario
  async create(
    @UploadedFile() profileImage: any,
    @Body() createUserDto: CreateUserDto,
  ) {
    // createUserDto.emailVerified =
    //   createUserDto.emailVerified == 'true' ? true : false;
    console.log('what we recive: ', createUserDto);
    console.log('profile image: ', profileImage);
    return this.userService.createUser(createUserDto, profileImage);
  }

  @Patch(':userId')
  @UseInterceptors(FileInterceptor('profileImage'))
  async update(
    @Param('userId') userId: string,
    @UploadedFile() profileImage: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto, profileImage);
  }
}
