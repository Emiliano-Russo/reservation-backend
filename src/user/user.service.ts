import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './entities/user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/shared/s3.service';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { ReservationService } from 'src/reservation/reservation.service';

@Injectable()
export class UserService {
  constructor(
    private s3Service: S3Service,
    private reservation: ReservationService,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  async getUser(id: string) {
    return User.get(id);
  }

  async createUser(data: CreateUserDto, profileImage: any) {
    console.log('creating user...');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    console.log('finding user by email');
    // Comprueba si el email o el nombre de usuario ya existen
    const existingUserByEmail = await this.findOneByEmail(data.email);
    console.log('not found by email');
    if (existingUserByEmail) {
      throw new Error('Username or email already exists');
    }

    let imageLink;
    if (profileImage) {
      console.log('uploading user image...');
      const idImage = uuidv4();
      const sanitizedFilename = profileImage.originalname.replace(/\s+/g, '');
      profileImage.originalname = idImage + sanitizedFilename;
      const folderS3 = 'avatars/';
      await this.s3Service.uploadFile(profileImage, folderS3);
      imageLink = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${folderS3}${profileImage.originalname}`;
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

    console.log('saving user....');
    const createdUser = await user.save();

    // deshabilitado de momento, NO BORRAR!
    // await this.mailService.sendConfirmationEmail(user.email);

    console.log('generating token...');
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
