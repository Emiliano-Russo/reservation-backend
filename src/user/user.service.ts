import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './entities/user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/shared/s3.service';
import { AuthService } from 'src/auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './entities/update-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private s3Service: S3Service,
    private authService: AuthService,
    private readonly mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  async getUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(data: CreateUserDto, profileImage: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const existingUserByEmail = await this.findOneByEmail(data.email);
    if (existingUserByEmail) {
      throw new Error('Username or email already exists');
    }

    let imageLink;
    if (profileImage) {
      const idImage = uuidv4();
      const sanitizedFilename = profileImage.originalname.replace(/\s+/g, '');
      profileImage.originalname = idImage + sanitizedFilename;
      const folderS3 = 'avatars/';
      await this.s3Service.uploadFile(profileImage, folderS3);
      imageLink = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${folderS3}${profileImage.originalname}`;
    }

    const user = this.userRepository.create({
      ...data,
      id: uuidv4(),
      password: hashedPassword,
      profileImage: imageLink,
    });

    const createdUser = await this.userRepository.save(user);

    //deshabilitado de momento, NO BORRAR!
    await this.sendConfirmationEmail(user.email);

    const token = await this.authService.login(createdUser);

    return { user: createdUser, token: token.access_token };
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      throw new Error('Email cannot be undefined');
    }
    return this.userRepository.findOne({ where: { email } });
  }

  // user.service.ts
  async updateUser(
    id: string,
    data: UpdateUserDto,
    profileImage: any,
  ): Promise<User> {
    const user = await this.getUser(id); // Esto arrojará un error si el usuario no existe

    if (profileImage) {
      const idImage = uuidv4();
      const sanitizedFilename = profileImage.originalname.replace(/\s+/g, '');
      profileImage.originalname = idImage + sanitizedFilename;
      const folderS3 = 'avatars/';
      await this.s3Service.uploadFile(profileImage, folderS3);
      const imageLink = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${folderS3}${profileImage.originalname}`;
      user.profileImage = imageLink;
    }

    Object.assign(user, data); // Esto copiará los valores de `data` al usuario

    return this.userRepository.save(user);
  }

  async addLoyaltyPoints(id: string, amount: number): Promise<User> {
    // Buscar al usuario por su ID
    const user = await this.getUser(id); // Esto arrojará un error si el usuario no existe

    // Añadir la cantidad de puntos de lealtad
    user.loyaltyPoints += amount;

    // Guardar el usuario actualizado en la base de datos
    return this.userRepository.save(user);
  }

  async verifyEmail(email: string): Promise<User> {
    // Buscar al usuario por su ID
    const user = await this.findOneByEmail(email);

    // Establecer emailVerified en true
    user.emailVerified = true;

    // Guardar el usuario actualizado en la base de datos
    return this.userRepository.save(user);
  }

  async sendConfirmationEmail(email: string) {
    console.log('email: ', email);
    const token = this.generateEmailConfirmationToken(email);
    const url = `${process.env.HOST_FRONTEND}/confirm-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirma tu correo',
      text: `Por favor, confirma tu correo haciendo clic en el siguiente enlace: ${url}`,
    });
  }

  confirmEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'email-confirmation') {
        throw new Error('Token inválido');
      }

      console.log('payload: ', payload);
      this.verifyEmail(payload.email);

      return { email: payload.email, message: 'Token válido' };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  private generateEmailConfirmationToken(email: string): string {
    const payload = { email, type: 'email-confirmation' };
    return this.jwtService.sign(payload);
  }
}
