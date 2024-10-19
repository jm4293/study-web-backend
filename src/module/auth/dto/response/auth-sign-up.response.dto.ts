import { ResponseCodeEnum, ResponseDto, ResponseMessageEnum } from '../../../../common';
import { BadRequestException } from '@nestjs/common';

export class AuthSignUpResponseDto extends ResponseDto {
  constructor(code: ResponseCodeEnum, message: ResponseMessageEnum, data: unknown) {
    super(code, message, data);
  }

  static Success(data: unknown) {
    return new AuthSignUpResponseDto(ResponseCodeEnum.SUCCESS, ResponseMessageEnum.SUCCESS, data);
  }

  static SignUpFail(data: string) {
    return new BadRequestException(
      new AuthSignUpResponseDto(ResponseCodeEnum.SIGN_IN_FAIL, ResponseMessageEnum.SIGN_IN_FAIL, data),
    );
  }
}