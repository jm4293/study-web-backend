import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '~/database/repository/user';
import { AuthChangePasswordRequestDto, AuthSignInRequestDto, AuthSignUpRequestDto } from '~/module/auth/request';
import { AuthChangePasswordResponseDto, AuthSignInResponseDto, AuthSignUpResponseDto } from '~/module/auth/response';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(body: AuthSignInRequestDto, res: Response) {
    const { email, password } = body;

    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw AuthSignInResponseDto.SignInFail('일치하는 사용자가 없습니다.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw AuthSignInResponseDto.SignInFail('비밀번호가 일치하지 않습니다.');
    }

    const token = await this.generateToken({ userId: user.id, email: user.email, name: user.name });

    res.setHeader('Authorization', `Bearer ${token}`);

    const responseData = { email: user.email, name: user.name };

    return res.send(AuthSignInResponseDto.Success('로그인 성공', responseData));
  }

  async signUp(body: AuthSignUpRequestDto) {
    const { name, email, password } = body;

    const isExistName = await this.userRepository.findUserByName(name);

    if (isExistName) {
      throw AuthSignUpResponseDto.SignUpFail('이미 존재하는 이름입니다.');
    }

    const isExistEmail = await this.userRepository.findUserByEmail(email);

    if (isExistEmail) {
      throw AuthSignUpResponseDto.SignUpFail('이미 존재하는 이메일입니다.');
    }

    const hashSalt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, hashSalt);

    const result = await this.userRepository.createUser({ ...body, password: hashPassword });

    const responseData = { email: result.email, name: result.name };

    return AuthSignUpResponseDto.Success('회원가입 성공', responseData);
  }

  async changePassword(body: AuthChangePasswordRequestDto): Promise<AuthChangePasswordResponseDto> {
    const { email, password } = body;

    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw AuthChangePasswordResponseDto.ChangePasswordFail('일치하는 사용자가 없습니다.');
    }

    const hashSalt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, hashSalt);

    await this.userRepository.changePassword({ email, password: hashPassword });

    const responseData = { email: user.email, name: user.name };

    return AuthChangePasswordResponseDto.Success('비밀번호 변경 완료', responseData);
  }

  async generateToken(payload: { userId: number; email: string; name: string }): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
