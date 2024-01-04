import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './entities/user.dto';
import { UpdateUserDto } from './entities/update-user.dto';
import { PaginationDto } from 'src/interfaces/pagination.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('count')
  async getUsersCount() {
    return this.userService.getUsersCountByCountryAndDepartment();
  }

  @Get('search')
  async searchUsers(
    @Query('country') country: string,
    @Query('searchTerm') searchTerm: string,
    @Query() paginationDto: PaginationDto,
  ) {
    console.log('data: ', country, searchTerm, paginationDto);
    return this.userService.searchUsers(country, searchTerm, paginationDto);
  }

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
}
