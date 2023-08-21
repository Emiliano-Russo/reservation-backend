import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateUserDto } from "./entities/user.dto";


@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) {
    }

    @Post()
    @UseInterceptors(FileInterceptor('userImage')) // 'userImage' es el nombre del campo en tu formulario
    async create(
        @UploadedFile() userImage: any,
        @Body() createUserDto: CreateUserDto,
    ) {
        createUserDto.emailVerified =
            createUserDto.emailVerified == 'true' ? true : false;
        return this.userService.createUser(createUserDto, userImage);
    }

}
