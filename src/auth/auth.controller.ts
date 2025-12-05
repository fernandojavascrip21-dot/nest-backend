import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import type { LoginResponse } from './interface/login-response';
import type { jwtPayload } from './interface/jwt-interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Crear usuario manualmente (si se usa registro separado, puede omitirse)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  // Login
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Registro
  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Solo usuarios autenticados
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: any) {
    const userId = req.user; // en tu guard guardas el id del user
    // Puedes retornar todos los usuarios o los datos del usuario autenticado:
    return this.authService.findUserById(userId);
    // o: return this.authService.findAll(); (si prefieres ver todos)
  }

  // 🔐 Verifica token y devuelve nuevo token + datos del usuario
  @UseGuards(AuthGuard)
  @Get('/check-token')
  async checkToken(@Request() req: any): Promise<LoginResponse> {
    const userId = req.user; // guard te deja el id en req.user
    const user = await this.authService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const token = await this.authService['getJwtToken']({ id: user.id } as jwtPayload);

    // Retorna la misma estructura que login/register
    return {
      user,
      token,
    };
  }
}
