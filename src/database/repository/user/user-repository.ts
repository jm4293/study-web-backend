import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../../model';
import { Repository, UpdateResult } from 'typeorm';
import { AuthChangePasswordRequestDto, AuthSignUpRequestDto } from '../../../module';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly repository: Repository<UserModel>,
  ) {}

  async findUserByName(name: string): Promise<UserModel> {
    return await this.repository.findOne({ where: { name } });
  }

  async findUserByEmail(email: string): Promise<UserModel> {
    return await this.repository.findOne({ where: { email } });
  }

  async createUser(body: AuthSignUpRequestDto): Promise<UserModel> {
    const user = this.repository.create(body);
    return await this.repository.save(user);
  }

  async changePassword(body: AuthChangePasswordRequestDto): Promise<UpdateResult> {
    return await this.repository.update({ email: body.email }, { password: body.password });
  }
}