import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './entities/user.dto';
import { UpdateUserDto } from './entities/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async get(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
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

  @Patch(':userId/fcmToken')
  async updateFcmToken(
    @Param('userId') userId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.userService.updateFcmToken(userId, fcmToken);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.userService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.userService.resetPassword(token, newPassword);
  }

  @Post('verify-reset-token')
  async verifyResetToken(@Body('token') token: string) {
    return this.userService.verifyResetToken(token);
  }
}
