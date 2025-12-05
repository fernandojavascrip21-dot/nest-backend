import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { CreateUserDto, UpdateAuthDto, LoginDto, RegisterDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from './interface/jwt-interface';
import { LoginResponse } from './interface/login-response';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });

      await newUser.save();

      const { password: _, ...user } = newUser.toJSON();
      return user as unknown as User;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something terrible happened!');
    }
  }

  /**
   * Registers a new user and returns user + JWT
   */
  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    try {
      const user = await this.create(registerDto);
      return {
        user,
        token: await this.getJwtToken({ id: (user as any)._id ?? (user as any).id }),
      };
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('The email already exists');
      }
      throw new InternalServerErrorException('Could not complete the registration');
    }
  }

  /**
   * Login and return user + JWT
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).select('+password').exec();

    if (!user) throw new UnauthorizedException('Not valid credentials - email');
    if (!user.password) throw new BadRequestException('Password is required');
    if (!user.isActive) throw new UnauthorizedException('User account is not active.');
    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: await this.getJwtToken({ id: user.id }), // `user.id` es string de _id
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    return this.userModel.findById(id);
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  /**
   * Signs a JWT using module-level signOptions (expiresIn: '2h')
   * IMPORTANT: do NOT add exp/iat manually.
   */
  private async getJwtToken(payload: jwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload); // usa secret y expiresIn del JwtModule
  }
}
