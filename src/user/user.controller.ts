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
import { UpdateUserDto } from './entities/user-update.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get(':userId')
  async get(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  async update(
    @Param('id') id: string,
    @UploadedFile() profileImage: any,
    @Body() updateUserDto: UpdateUserDto
  ) {
    console.log('what we recive: ', updateUserDto);
    return this.userService.updateUser(id, updateUserDto, profileImage);
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
    return this.userService.createUser(createUserDto, profileImage);
  }
}
