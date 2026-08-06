import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Класс пустой специально, вся логика в AuthGuard('jwt')
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
