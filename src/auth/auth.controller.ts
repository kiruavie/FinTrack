import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Créer un nouveau compte utilisateur',
    description:
      'Permet à un nouvel utilisateur de créer un compte avec email, mot de passe et nom.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Informations de création du compte',
  })
  @ApiResponse({
    status: 201,
    description: 'Compte créé avec succès',
    schema: {
      example: {
        message: 'User registered',
        user: {
          id: 'cljk1234567890',
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Données invalides ou email déjà utilisé',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Se connecter',
    description: 'Authentifie un utilisateur et retourne un token JWT.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Identifiants de connexion',
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Identifiants invalides',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
