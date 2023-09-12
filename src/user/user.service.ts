import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './entities/user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/shared/s3.service';
import { readFileSync } from 'fs';
import { ReservationService } from 'src/reservation/reservation.service';
import { ReservationController } from 'src/reservation/reservation.controller';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private s3Service: S3Service,
    private reservation: ReservationService,
    private authService: AuthService,
  ) {}

  async createUser(data: CreateUserDto, userImage: any) {
    console.log('creating user...');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    console.log('finding user by email');
    // Comprueba si el email o el nombre de usuario ya existen
    const existingUserByEmail = await this.findOneByEmail(data.email);
    console.log('not found by email');
    if (existingUserByEmail) {
      throw new Error('Username or email already exists');
    }

    let imageLink = '';
    if (userImage) {
      console.log('uploading user image...');
      // Subir la imagen de perfil al almacenamiento S3 y obtener la URL
      imageLink = await this.s3Service.uploadFile(
        'avatars/' + userImage.fieldname,
        userImage.buffer,
        userImage.mimetype,
      );
      console.log('el result: ', imageLink);
    }

    const user = new User({
      ...data,
      id: uuidv4(), // Usar el id proporcionado o generar uno nuevo
      password: hashedPassword,
      profileImage: imageLink, // Guardar la URL de la imagen de perfil
      followers: [],
      following: [],
      followRequests: [],
      posts: [],
      chats: [],
      bio: data.bio || '¡Bienvenidos a mi Perfil!',
    });

    const createdUser = await user.save();

    // Genera un token de acceso para el usuario
    const token = await this.authService.login(createdUser);
    console.log('finalmente el token: ', token);

    return { user: createdUser, token: token.access_token };
  }

  async findOneByEmail(email: string): Promise<any> {
    if (email === undefined) {
      throw new Error('Email cannot be undefined');
    }
    const users = await User.scan('email').eq(email).exec();
    return users[0];
  }
}
