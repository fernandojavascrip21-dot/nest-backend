import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserSchema,User} from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';


@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name:User.name,
        schema:UserSchema
      }
    ]),

    JwtModule.register({
      global:true,
      secret:process.env.JWT_SEED,
      signOptions:{expiresIn:'2h'}
    })
  ]
})
export class AuthModule {}
