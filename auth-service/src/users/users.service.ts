
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './user.schema.js';
import { RegisterDto } from './register.dto.js';
import { LoginDto } from './login.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.userModel
      .findOne({ email })
      .exec();

    if (existingUser) {
      throw new RpcException({
        status: 409,
        message: 'Email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.userModel.create({
        name: dto.name.trim(),
        email,
        password: hashedPassword,
      });

      return {
        message: 'Registration successful.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new RpcException({
          status: 409,
          message: 'Email is already registered.',
        });
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    // Password is excluded by default in the schema, so explicitly select it.
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();

    if (!user) {
      throw new RpcException({
        status: 401,
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new RpcException({
        status: 401,
        message: 'Invalid email or password.',
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
      email: user.email,
    });

    return {
      message: 'Login successful.',
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }
}
